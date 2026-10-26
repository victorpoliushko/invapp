/// <reference types="jest" />
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
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
        include: { transactions: { orderBy: { date: 'desc' } } },
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
          transactions: {
            create: { type: 'BUY', quantity: 10, pricePerUnit: 980, date: new Date('2026-01-01') },
          },
        },
      });
    });

    it('parses the maturity date when provided', async () => {
      await service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: 1000,
        couponRate: 5,
        couponFrequency: 'ANNUAL' as any,
        quantity: 10,
        purchasePrice: 980,
        purchaseDate: '2026-01-01',
        maturityDate: '2036-01-01',
      }, OWNER_ID);

      expect(prisma.bond.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ maturityDate: new Date('2036-01-01') }) }),
      );
    });

    it('leaves maturityDate undefined when not provided', async () => {
      await service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: 1000,
        couponRate: 5,
        couponFrequency: 'ANNUAL' as any,
        quantity: 10,
        purchasePrice: 980,
        purchaseDate: '2026-01-01',
      }, OWNER_ID);

      expect(prisma.bond.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ maturityDate: undefined }) }),
      );
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

    it('coerces currentValue when provided', async () => {
      await service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: 1000,
        couponRate: 5,
        couponFrequency: 'ANNUAL' as any,
        quantity: 10,
        purchasePrice: 980,
        currentValue: '1010' as any,
        purchaseDate: '2026-01-01',
      }, OWNER_ID);

      expect(prisma.bond.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentValue: 1010 }) }),
      );
    });

    it('leaves currentValue undefined when not provided', async () => {
      await service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: 1000,
        couponRate: 5,
        couponFrequency: 'ANNUAL' as any,
        quantity: 10,
        purchasePrice: 980,
        purchaseDate: '2026-01-01',
      }, OWNER_ID);

      expect(prisma.bond.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentValue: undefined }) }),
      );
    });
  });

  describe('create — initial trade', () => {
    it('does not record a trade when quantity is 0', async () => {
      await service.create({
        portfolioId: 'p1',
        isin: 'US123',
        name: 'Treasury',
        faceValue: 1000,
        couponRate: 5,
        couponFrequency: 'ANNUAL' as any,
        quantity: 0,
        purchasePrice: 980,
        purchaseDate: '2026-01-01',
      }, OWNER_ID);

      expect(prisma.bond.create.mock.calls[0][0].data).not.toHaveProperty('transactions');
    });
  });

  describe('currency', () => {
    const base = {
      portfolioId: 'p1',
      isin: 'US123',
      name: 'Treasury',
      faceValue: 1000,
      couponRate: 5,
      couponFrequency: 'ANNUAL' as any,
      quantity: 0,
      purchasePrice: 980,
      purchaseDate: '2026-01-01',
    };

    it('normalizes the currency code on create', async () => {
      await service.create({ ...base, currency: ' eur ' }, OWNER_ID);

      expect(prisma.bond.create.mock.calls[0][0].data.currency).toBe('EUR');
    });

    it('leaves currency to the database default when omitted', async () => {
      await service.create(base, OWNER_ID);

      expect(prisma.bond.create.mock.calls[0][0].data.currency).toBeUndefined();
    });

    it('rejects an invalid currency code', async () => {
      await expect(service.create({ ...base, currency: 'EURO' }, OWNER_ID)).rejects.toThrow(BadRequestException);
      expect(prisma.bond.create).not.toHaveBeenCalled();
    });

    it('updates the currency', async () => {
      await service.update('bond-1', { currency: 'gbp' }, OWNER_ID);

      expect(prisma.bond.update).toHaveBeenCalledWith({ where: { id: 'bond-1' }, data: { currency: 'GBP' } });
    });
  });

  describe('update', () => {
    it('ignores quantity and purchasePrice, which are derived from trades', async () => {
      await service.update('bond-1', { quantity: 20, purchasePrice: 900, couponRate: 6 } as any, OWNER_ID);

      expect(prisma.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        data: { couponRate: 6 },
      });
    });

    it('only includes fields that were provided', async () => {
      await service.update('bond-1', { couponRate: 6 }, OWNER_ID);

      expect(prisma.bond.findUnique).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        select: { portfolioId: true },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        data: { couponRate: 6 },
      });
    });

    it('omits purchaseDate when not provided', async () => {
      await service.update('bond-1', { isin: 'US999' }, OWNER_ID);

      const call = prisma.bond.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty('purchaseDate');
      expect(call.data).toEqual({ isin: 'US999' });
    });

    it('parses maturityDate when provided', async () => {
      await service.update('bond-1', { maturityDate: '2036-01-01' }, OWNER_ID);

      expect(prisma.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        data: { maturityDate: new Date('2036-01-01') },
      });
    });

    it('omits maturityDate when not provided', async () => {
      await service.update('bond-1', { isin: 'US999' }, OWNER_ID);

      const call = prisma.bond.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty('maturityDate');
    });

    it('parses currentValue when provided', async () => {
      await service.update('bond-1', { currentValue: 1025 }, OWNER_ID);

      expect(prisma.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        data: { currentValue: 1025 },
      });
    });

    it('omits currentValue when not provided', async () => {
      await service.update('bond-1', { isin: 'US999' }, OWNER_ID);

      const call = prisma.bond.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty('currentValue');
    });

    it('throws NotFound when the bond does not exist', async () => {
      prisma.bond.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { couponRate: 6 }, OWNER_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.bond.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.update('bond-1', { couponRate: 6 }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.update).not.toHaveBeenCalled();
    });
  });

  describe('getByPortfolio', () => {
    it('queries bonds scoped to the given portfolio', async () => {
      await service.getByPortfolio('p1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.findMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1' },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
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

  describe('trades', () => {
    let tx: any;
    const trade = (type: 'BUY' | 'SELL', quantity: number, pricePerUnit: number, date: string) =>
      ({ type, quantity, pricePerUnit, date: new Date(date) });

    beforeEach(() => {
      tx = {
        bondTransaction: {
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          findMany: jest.fn(),
        },
        bond: { update: jest.fn().mockImplementation(({ data }) => data), delete: jest.fn() },
      };
      prisma.$transaction = jest.fn((fn: (t: any) => unknown) => fn(tx));
      prisma.bondTransaction = {
        findUnique: jest.fn().mockResolvedValue({ bondId: 'bond-1', bond: { portfolioId: 'p1' } }),
      };
    });

    it('records a BUY and recalculates quantity, average price and first purchase date', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([
        trade('BUY', 10, 100, '2026-03-01'),
        trade('BUY', 10, 80, '2026-01-01'),
      ]);

      await service.addTransaction('bond-1', { type: 'BUY', quantity: 10, pricePerUnit: 80, date: '2026-01-01' } as any, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(tx.bondTransaction.create).toHaveBeenCalledWith({
        data: { bondId: 'bond-1', type: 'BUY', quantity: 10, pricePerUnit: 80, date: new Date('2026-01-01') },
      });
      expect(tx.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        include: { transactions: { orderBy: { date: 'desc' } } },
        data: { quantity: 20, purchasePrice: 90, purchaseDate: new Date('2026-01-01') },
      });
    });

    it('reduces quantity on SELL without changing the average purchase price', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([
        trade('BUY', 10, 100, '2026-01-01'),
        trade('SELL', 4, 120, '2026-02-01'),
      ]);

      await service.addTransaction('bond-1', { type: 'SELL', quantity: 4, pricePerUnit: 120, date: '2026-02-01' } as any, OWNER_ID);

      expect(tx.bond.update.mock.calls[0][0].data).toEqual({
        quantity: 6,
        purchasePrice: 100,
        purchaseDate: new Date('2026-01-01'),
      });
    });

    it('deletes the bond when a SELL closes the whole holding', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([
        trade('BUY', 5, 100, '2026-01-01'),
        trade('SELL', 5, 110, '2026-02-01'),
      ]);

      const result = await service.addTransaction('bond-1', { type: 'SELL', quantity: 5, pricePerUnit: 110, date: '2026-02-01' } as any, OWNER_ID);

      expect(tx.bond.delete).toHaveBeenCalledWith({ where: { id: 'bond-1' } });
      expect(result).toBeNull();
    });

    it('keeps the bond after a partial SELL', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([
        trade('BUY', 5, 100, '2026-01-01'),
        trade('SELL', 2, 110, '2026-02-01'),
      ]);

      await service.addTransaction('bond-1', { type: 'SELL', quantity: 2, pricePerUnit: 110, date: '2026-02-01' } as any, OWNER_ID);

      expect(tx.bond.delete).not.toHaveBeenCalled();
    });

    it('rejects a SELL larger than the holding', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([
        trade('BUY', 2, 100, '2026-01-01'),
        trade('SELL', 3, 100, '2026-02-01'),
      ]);

      await expect(
        service.addTransaction('bond-1', { type: 'SELL', quantity: 3, pricePerUnit: 100, date: '2026-02-01' } as any, OWNER_ID),
      ).rejects.toThrow(BadRequestException);
      expect(tx.bond.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden before writing when the bond belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.addTransaction('bond-1', { type: 'BUY', quantity: 1, pricePerUnit: 100, date: '2026-01-01' } as any, OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates a trade and recalculates the bond', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([trade('BUY', 5, 100, '2026-01-01')]);

      await service.updateTransaction('t1', { quantity: 5 } as any, OWNER_ID);

      expect(tx.bondTransaction.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { quantity: 5 } });
      expect(tx.bond.update.mock.calls[0][0].data.quantity).toBe(5);
    });

    it('deletes a trade and recalculates the bond', async () => {
      tx.bondTransaction.findMany.mockResolvedValue([]);

      await service.deleteTransaction('t1', OWNER_ID);

      expect(tx.bondTransaction.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(tx.bond.update.mock.calls[0][0].data).toEqual({ quantity: 0, purchasePrice: 0 });
    });

    it('throws NotFound for an unknown trade', async () => {
      prisma.bondTransaction.findUnique.mockResolvedValue(null);

      await expect(service.deleteTransaction('missing', OWNER_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
