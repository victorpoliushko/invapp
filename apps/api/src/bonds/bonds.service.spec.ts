/// <reference types="jest" />
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BondsService } from './bonds.service';

describe('BondsService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let portfoliosService: any;
  let service: BondsService;

  beforeEach(() => {
    prisma = {
      bond: {
        findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    portfoliosService = { assertOwnership: jest.fn() };
    service = new BondsService(prisma as any, portfoliosService);
  });

  describe('create', () => {
    it('coerces numeric string inputs and parses the purchase date', async () => {
      await service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: '1000' as any,
        couponRate: '5' as any,
        couponFrequency: 'ANNUAL' as any,
        quantity: '10' as any,
        purchasePrice: '980' as any,
        purchaseDate: '2026-01-01',
      }, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.create).toHaveBeenCalledWith({
        data: {
          portfolioId: 'p1',
          isin: 'US123',
          name: 'Treasury',
          faceValue: 1000,
          couponRate: 5,
          couponFrequency: 'ANNUAL',
          quantity: 10,
          purchasePrice: 980,
          purchaseDate: new Date('2026-01-01'),
        },
      });
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: 1000,
        couponRate: 5,
        couponFrequency: 'ANNUAL' as any,
        quantity: 10,
        purchasePrice: 980,
        purchaseDate: '2026-01-01',
      }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('only includes fields that were provided', async () => {
      await service.update('bond-1', { quantity: 20 }, OWNER_ID);

      expect(prisma.bond.findUnique).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        select: { portfolioId: true },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        data: { quantity: 20 },
      });
    });

    it('omits purchaseDate when not provided', async () => {
      await service.update('bond-1', { isin: 'US999' }, OWNER_ID);

      const call = prisma.bond.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty('purchaseDate');
      expect(call.data).toEqual({ isin: 'US999' });
    });

    it('throws NotFound when the bond does not exist', async () => {
      prisma.bond.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { quantity: 20 }, OWNER_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.bond.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.update('bond-1', { quantity: 20 }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.update).not.toHaveBeenCalled();
    });
  });

  describe('getByPortfolio', () => {
    it('queries bonds scoped to the given portfolio', async () => {
      await service.getByPortfolio('p1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.findMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.getByPortfolio('p1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.findMany).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the bond by id', async () => {
      await service.delete('bond-1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.delete).toHaveBeenCalledWith({ where: { id: 'bond-1' } });
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.delete('bond-1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.delete).not.toHaveBeenCalled();
    });
  });
});
