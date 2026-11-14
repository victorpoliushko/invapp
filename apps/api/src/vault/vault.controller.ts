import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { ManagedKeyDto, UpdatePassphraseDto, VaultDto } from './vault.dto';
import { VaultService } from './vault.service';

@UseGuards(PassportJwtAuthGuard)
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get()
  get(@GetUser() user: User) {
    return this.vaultService.get(user.id);
  }

  @Post()
  create(@Body() dto: VaultDto, @GetUser() user: User) {
    return this.vaultService.create(user.id, dto);
  }

  @Post('standard')
  createStandard(@Body() dto: ManagedKeyDto, @GetUser() user: User) {
    return this.vaultService.createStandard(user.id, dto);
  }

  @Put('private')
  switchToPrivate(@Body() dto: VaultDto, @GetUser() user: User) {
    return this.vaultService.switchToPrivate(user.id, dto);
  }

  @Put('standard')
  switchToStandard(@Body() dto: ManagedKeyDto, @GetUser() user: User) {
    return this.vaultService.switchToStandard(user.id, dto);
  }

  @Put('passphrase')
  updatePassphrase(@Body() dto: UpdatePassphraseDto, @GetUser() user: User) {
    return this.vaultService.updatePassphrase(user.id, dto);
  }

  @Delete()
  reset(@GetUser() user: User) {
    return this.vaultService.reset(user.id);
  }
}
