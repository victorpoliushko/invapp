import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManagedKeyDto, UpdatePassphraseDto, VaultDto } from './vault.dto';

const VAULT_FIELDS = {
  mode: true,
  managedKey: true,
  salt: true,
  iterations: true,
  wrappedKey: true,
  recoverySalt: true,
  recoveryWrappedKey: true,
} as const;

const NO_PASSPHRASE = {
  salt: null,
  iterations: null,
  wrappedKey: null,
  recoverySalt: null,
  recoveryWrappedKey: null,
} as const;

function privateFields(dto: VaultDto) {
  return {
    mode: 'PRIVATE' as const,
    managedKey: null,
    salt: dto.salt,
    iterations: dto.iterations,
    wrappedKey: dto.wrappedKey,
    recoverySalt: dto.recoverySalt,
    recoveryWrappedKey: dto.recoveryWrappedKey,
  };
}

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    const vault = await this.prisma.userVault.findUnique({ where: { userId }, select: VAULT_FIELDS });
    return { vault };
  }

  private async assertNew(userId: string) {
    const existing = await this.prisma.userVault.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Encryption is already set up');
  }

  private async requireMode(userId: string, mode: 'STANDARD' | 'PRIVATE') {
    const existing = await this.prisma.userVault.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('Encryption is not set up');
    if (existing.mode !== mode) throw new BadRequestException(`Your account is not in ${mode.toLowerCase()} mode`);
  }

  async create(userId: string, dto: VaultDto) {
    await this.assertNew(userId);
    const vault = await this.prisma.userVault.create({
      data: { userId, ...privateFields(dto) },
      select: VAULT_FIELDS,
    });
    return { vault };
  }

  async createStandard(userId: string, dto: ManagedKeyDto) {
    await this.assertNew(userId);
    const vault = await this.prisma.userVault.create({
      data: { userId, mode: 'STANDARD', managedKey: dto.key },
      select: VAULT_FIELDS,
    });
    return { vault };
  }

  async switchToPrivate(userId: string, dto: VaultDto) {
    await this.requireMode(userId, 'STANDARD');
    const vault = await this.prisma.userVault.update({
      where: { userId },
      data: privateFields(dto),
      select: VAULT_FIELDS,
    });
    return { vault };
  }

  async switchToStandard(userId: string, dto: ManagedKeyDto) {
    await this.requireMode(userId, 'PRIVATE');
    const vault = await this.prisma.userVault.update({
      where: { userId },
      data: { mode: 'STANDARD', managedKey: dto.key, ...NO_PASSPHRASE },
      select: VAULT_FIELDS,
    });
    return { vault };
  }

  async updatePassphrase(userId: string, dto: UpdatePassphraseDto) {
    await this.requireMode(userId, 'PRIVATE');
    const vault = await this.prisma.userVault.update({
      where: { userId },
      data: { salt: dto.salt, iterations: dto.iterations, wrappedKey: dto.wrappedKey },
      select: VAULT_FIELDS,
    });
    return { vault };
  }

  async reset(userId: string) {
    const portfolios = await this.prisma.portfolio.findMany({ where: { userId }, select: { id: true } });
    const portfolioId = { in: portfolios.map((p) => p.id) };
    await this.prisma.$transaction([
      this.prisma.stockTransaction.deleteMany({ where: { portfolioId } }),
      this.prisma.cryptoTransaction.deleteMany({ where: { portfolioId } }),
      this.prisma.stockPosition.deleteMany({ where: { portfolioId } }),
      this.prisma.cryptoPosition.deleteMany({ where: { portfolioId } }),
      this.prisma.bond.deleteMany({ where: { portfolioId } }),
      this.prisma.realEstate.deleteMany({ where: { portfolioId } }),
      this.prisma.mixedAsset.deleteMany({ where: { portfolioId } }),
      this.prisma.cash.deleteMany({ where: { portfolioId } }),
      this.prisma.portfolio.updateMany({ where: { userId }, data: { goal: null } }),
      this.prisma.userVault.deleteMany({ where: { userId } }),
    ]);
    return { vault: null };
  }
}
