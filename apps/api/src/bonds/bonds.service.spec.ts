/// <reference types="jest" />
import { BondsService } from './bonds.service';

describe('BondsService', () => {
  let prisma: { bond: { findMany: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };
  let service: BondsService;

  beforeEach(() => {
    prisma = {
      bond: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new BondsService(prisma as any);
  });

  describe('create', () => {
    it('coerces numeric string inputs and parses the purchase date', () => {
      service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: '1000' as any,
        couponRate: '5' as any,
        couponFrequency: 'ANNUAL' as any,
        quantity: '10' as any,
        purchasePrice: '980' as any,
        purchaseDate: '2026-01-01',
      });

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
  });

  describe('update', () => {
    it('only includes fields that were provided', () => {
      service.update('bond-1', { quantity: 20 });

      expect(prisma.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        data: { quantity: 20 },
      });
    });

    it('omits purchaseDate when not provided', () => {
      service.update('bond-1', { isin: 'US999' });

      const call = prisma.bond.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty('purchaseDate');
      expect(call.data).toEqual({ isin: 'US999' });
    });
  });

  describe('getByPortfolio', () => {
    it('queries bonds scoped to the given portfolio', () => {
      service.getByPortfolio('p1');
      expect(prisma.bond.findMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
    });
  });

  describe('delete', () => {
    it('deletes the bond by id', () => {
      service.delete('bond-1');
      expect(prisma.bond.delete).toHaveBeenCalledWith({ where: { id: 'bond-1' } });
    });
  });
});
