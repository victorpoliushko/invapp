/// <reference types="jest" />
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BondsService } from './bonds.service';

const enc = (value: string) => `v1:aQ==:${Buffer.from(value).toString('base64')}`;

describe('BondsService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let portfoliosService: any;
  let service: BondsService;

  const base = {
    portfolioId: 'p1',
    isin: 'US123',
    name: 'Treasury',
    faceValue: enc('1000'),
    couponRate: enc('5'),
    couponFrequency: 'ANNUAL' as any,
    quantity: enc('10'),
    purchasePrice: enc('980'),
    purchaseDate: '2026-01-01',
  };

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
    it('stores the encrypted amounts and records the initial trade', async () => {
      await service.create({ ...base, transaction: { quantity: enc('10'), pricePerUnit: enc('980') } }, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.bond.create).toHaveBeenCalledWith({
        include: { transactions: { orderBy: { date: 'desc' } } },
        data: {
          portfolioId: 'p1',
          isin: 'US123',
          name: 'Treasury',
          faceValue: enc('1000'),
          couponRate: enc('5'),
          couponFrequency: 'ANNUAL',
          currency: undefined,
          quantity: enc('10'),
          purchasePrice: enc('980'),
          currentValue: undefined,
          purchaseDate: new Date('2026-01-01'),
          maturityDate: undefined,
          transactions: {
            create: { type: 'BUY', quantity: enc('10'), pricePerUnit: enc('980'), date: new Date('2026-01-01') },
          },
        },
      });
    });

    it('does not record a trade when none is sent', async () => {
      await service.create(base, OWNER_ID);

      expect(prisma.bond.create.mock.calls[0][0].data).not.toHaveProperty('transactions');
    });

    it('parses the maturity date and stores currentValue when provided', async () => {
      await service.create({ ...base, maturityDate: '2030-01-01', currentValue: enc('990') }, OWNER_ID);

      const data = prisma.bond.create.mock.calls[0][0].data;
      expect(data.maturityDate).toEqual(new Date('2030-01-01'));
      expect(data.currentValue).toBe(enc('990'));
    });

    it('rejects plaintext amounts', async () => {
      await expect(service.create({ ...base, faceValue: '1000' }, OWNER_ID)).rejects.toThrow(BadRequestException);
      expect(prisma.bond.create).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.create(base, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.create).not.toHaveBeenCalled();
    });
  });

  describe('currency', () => {
    it('normalizes the currency code on create', async () => {
      await service.create({ ...base, currency: ' eur ' }, OWNER_ID);

      expect(prisma.bond.create.mock.calls[0][0].data.currency).toBe('EUR');
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
      await service.update('bond-1', { quantity: enc('20'), purchasePrice: enc('900'), couponRate: enc('6') } as any, OWNER_ID);

      expect(prisma.bond.update).toHaveBeenCalledWith({ where: { id: 'bond-1' }, data: { couponRate: enc('6') } });
    });

    it('stores currentValue when provided', async () => {
      await service.update('bond-1', { currentValue: enc('1010') }, OWNER_ID);

      expect(prisma.bond.update).toHaveBeenCalledWith({ where: { id: 'bond-1' }, data: { currentValue: enc('1010') } });
    });

    it('throws NotFound when the bond does not exist', async () => {
      prisma.bond.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'x' }, OWNER_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.bond.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.update('bond-1', { name: 'x' }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.bond.update).not.toHaveBeenCalled();
    });
  });

  describe('getByPortfolio', () => {
    it('queries bonds scoped to the given portfolio', async () => {
      await service.getByPortfolio('p1', OWNER_ID);

      expect(prisma.bond.findMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1' },
        include: { transactions: { orderBy: { date: 'desc' } } },
      });
    });
  });

  describe('delete', () => {
    it('deletes the bond by id', async () => {
      await service.delete('bond-1', OWNER_ID);

      expect(prisma.bond.delete).toHaveBeenCalledWith({ where: { id: 'bond-1' } });
    });
  });

  describe('trades', () => {
    let tx: any;
    const holding = { quantity: enc('20'), purchasePrice: enc('90'), purchaseDate: '2026-01-01T00:00:00.000Z' };

    beforeEach(() => {
      tx = {
        bondTransaction: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        bond: { update: jest.fn().mockImplementation(({ data }) => data), delete: jest.fn() },
        cash: { findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }), update: jest.fn(), create: jest.fn() },
      };
      prisma.$transaction = jest.fn((fn: (t: any) => unknown) => fn(tx));
      prisma.bondTransaction = {
        findUnique: jest.fn().mockResolvedValue({ bondId: 'bond-1', bond: { portfolioId: 'p1' } }),
      };
    });

    it('records a trade and stores the holding the device recomputed', async () => {
      await service.addTransaction(
        'bond-1',
        { type: 'BUY', quantity: enc('10'), pricePerUnit: enc('80'), date: '2026-01-01', bond: holding },
        OWNER_ID,
      );

      expect(tx.bondTransaction.create).toHaveBeenCalledWith({
        data: { bondId: 'bond-1', type: 'BUY', quantity: enc('10'), pricePerUnit: enc('80'), date: new Date('2026-01-01') },
      });
      expect(tx.bond.update).toHaveBeenCalledWith({
        where: { id: 'bond-1' },
        include: { transactions: { orderBy: { date: 'desc' } } },
        data: { quantity: enc('20'), purchasePrice: enc('90'), purchaseDate: new Date('2026-01-01') },
      });
    });

    it('credits sale proceeds to the cash entry the device chose', async () => {
      await service.addTransaction(
        'bond-1',
        {
          type: 'SELL',
          quantity: enc('4'),
          pricePerUnit: enc('120'),
          date: '2026-02-01',
          bond: holding,
          cash: { id: 'cash-1', amount: enc('480') },
        },
        OWNER_ID,
      );

      expect(tx.cash.update).toHaveBeenCalledWith({ where: { id: 'cash-1' }, data: { amount: enc('480') } });
    });

    it('deletes the bond when the device reports the holding is sold out', async () => {
      const result = await service.addTransaction(
        'bond-1',
        { type: 'SELL', quantity: enc('5'), pricePerUnit: enc('110'), date: '2026-02-01', bond: holding, soldOut: true },
        OWNER_ID,
      );

      expect(tx.bond.delete).toHaveBeenCalledWith({ where: { id: 'bond-1' } });
      expect(tx.bondTransaction.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('rejects plaintext amounts before writing', async () => {
      await expect(
        service.addTransaction('bond-1', { type: 'BUY', quantity: '1', pricePerUnit: enc('100'), date: '2026-01-01', bond: holding }, OWNER_ID),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws Forbidden before writing when the bond belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.addTransaction('bond-1', { type: 'BUY', quantity: enc('1'), pricePerUnit: enc('100'), date: '2026-01-01', bond: holding }, OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates a trade and stores the recomputed holding', async () => {
      await service.updateTransaction('t1', { quantity: enc('5'), bond: holding }, OWNER_ID);

      expect(tx.bondTransaction.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { quantity: enc('5') } });
      expect(tx.bond.update.mock.calls[0][0].data.quantity).toBe(enc('20'));
    });

    it('deletes a trade and stores the recomputed holding', async () => {
      await service.deleteTransaction('t1', { quantity: enc('0'), purchasePrice: enc('0') }, OWNER_ID);

      expect(tx.bondTransaction.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(tx.bond.update.mock.calls[0][0].data).toEqual({ quantity: enc('0'), purchasePrice: enc('0') });
    });

    it('throws NotFound for an unknown trade', async () => {
      prisma.bondTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteTransaction('missing', { quantity: enc('0'), purchasePrice: enc('0') }, OWNER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('sells the whole bond and credits the proceeds', async () => {
      await service.sellAll('bond-1', { name: 'Sale proceeds', category: 'GENERAL', currency: 'USD', amount: enc('1000') }, OWNER_ID);

      expect(tx.cash.create).toHaveBeenCalledWith({
        data: { portfolioId: 'p1', category: 'GENERAL', currency: 'USD', name: 'Sale proceeds', amount: enc('1000') },
      });
      expect(tx.bond.delete).toHaveBeenCalledWith({ where: { id: 'bond-1' } });
    });
  });
});
