/// <reference types="jest" />
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CashService } from './cash.service';

describe('CashService', () => {
  let prisma: any;
  let portfoliosService: any;
  let service: CashService;

  beforeEach(() => {
    prisma = {
      cash: {
        findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    portfoliosService = { assertOwnership: jest.fn() };
    service = new CashService(prisma, portfoliosService);
  });

  it('creates a cash entry with a normalized currency', async () => {
    await service.create({ portfolioId: 'p1', name: ' Savings ', currency: 'eur', amount: '1200' as any }, 'u1');

    expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', 'u1');
    expect(prisma.cash.create).toHaveBeenCalledWith({
      data: { portfolioId: 'p1', name: 'Savings', currency: 'EUR', amount: 1200 },
    });
  });

  it('rejects an unsupported currency', async () => {
    await expect(
      service.create({ portfolioId: 'p1', name: 'x', currency: 'GBP', amount: 1 }, 'u1'),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.cash.create).not.toHaveBeenCalled();
  });

  it('rejects a negative amount', async () => {
    await expect(
      service.create({ portfolioId: 'p1', name: 'x', currency: 'USD', amount: -5 }, 'u1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates only the provided fields', async () => {
    await service.update('c1', { amount: 50 }, 'u1');

    expect(prisma.cash.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { amount: 50 } });
  });

  it('throws NotFound for an unknown entry', async () => {
    prisma.cash.findUnique.mockResolvedValue(null);

    await expect(service.delete('missing', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('throws Forbidden for another user\'s portfolio', async () => {
    portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

    await expect(service.getByPortfolio('p1', 'u2')).rejects.toThrow(ForbiddenException);
    expect(prisma.cash.findMany).not.toHaveBeenCalled();
  });
});
