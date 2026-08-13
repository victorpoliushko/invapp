/// <reference types="jest" />
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let portfoliosService: any;
  let service: TransactionsService;
  let trx: any;

  beforeEach(() => {
    trx = {
      stockTransaction: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      cryptoTransaction: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      stockPosition: { update: jest.fn() },
      cryptoPosition: { update: jest.fn() },
    };

    prisma = {
      asset: { findFirst: jest.fn(), findUnique: jest.fn() },
      stockTransaction: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }),
      },
      cryptoTransaction: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn((cb) => cb(trx)),
    };

    portfoliosService = { addAssetToPortfolio: jest.fn(), assertOwnership: jest.fn() };

    service = new TransactionsService(prisma, portfoliosService);
  });

  describe('update', () => {
    it('recomputes quantity and weighted avg price from all BUY/SELL transactions', async () => {
      trx.stockTransaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.stockTransaction.findMany.mockResolvedValue([
        { type: 'BUY', quantityChange: 10, pricePerUnit: 100 },
        { type: 'BUY', quantityChange: 5, pricePerUnit: 200 },
        { type: 'SELL', quantityChange: 3, pricePerUnit: 250 },
      ]);

      await service.update('tx-1', { date: '2026-01-01', quantityChange: 10, pricePerUnit: 100 }, OWNER_ID);

      expect(prisma.stockTransaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        select: { portfolioId: true },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      // bought 15 total, cost 10*100 + 5*200 = 2000, avg = 2000/15
      expect(trx.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 12, price: 2000 / 15 },
      });
    });

    it('routes to the crypto tables when the transaction is a crypto transaction', async () => {
      prisma.stockTransaction.findUnique.mockResolvedValue(null);
      prisma.cryptoTransaction.findUnique.mockResolvedValue({ portfolioId: 'p1' });
      trx.cryptoTransaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.cryptoTransaction.findMany.mockResolvedValue([
        { type: 'BUY', quantityChange: 2, pricePerUnit: 50000 },
      ]);

      await service.update('tx-1', { date: '2026-01-01', quantityChange: 2, pricePerUnit: 50000 }, OWNER_ID);

      expect(trx.cryptoPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 2, price: 50000 },
      });
      expect(trx.stockPosition.update).not.toHaveBeenCalled();
    });

    it('sets price to 0 when there are no BUY transactions', async () => {
      trx.stockTransaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.stockTransaction.findMany.mockResolvedValue([
        { type: 'SELL', quantityChange: 2, pricePerUnit: 100 },
      ]);

      await service.update('tx-1', { date: '2026-01-01', quantityChange: 2, pricePerUnit: 100 }, OWNER_ID);

      expect(trx.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: -2, price: 0 },
      });
    });

    it('throws NotFound when the transaction does not exist in either table', async () => {
      prisma.stockTransaction.findUnique.mockResolvedValue(null);
      prisma.cryptoTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { date: '2026-01-01', quantityChange: 2, pricePerUnit: 100 }, OWNER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.update('tx-1', { date: '2026-01-01', quantityChange: 2, pricePerUnit: 100 }, OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('recomputes position from remaining transactions after deletion', async () => {
      trx.stockTransaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.stockTransaction.findMany.mockResolvedValue([
        { type: 'BUY', quantityChange: 10, pricePerUnit: 100 },
      ]);

      await service.delete('tx-1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(trx.stockTransaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-1' } });
      expect(trx.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 10, price: 100 },
      });
    });

    it('zeroes out the position when the last transaction is removed', async () => {
      trx.stockTransaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.stockTransaction.findMany.mockResolvedValue([]);

      await service.delete('tx-1', OWNER_ID);

      expect(trx.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 0, price: 0 },
      });
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.delete('tx-1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('resolves the asset by ticker name when assetId is not provided', async () => {
      prisma.asset.findFirst.mockResolvedValue({ id: 'a1' });
      prisma.stockTransaction.create.mockResolvedValue({ id: 'tx-1', date: new Date('2026-01-01') });

      await service.create({
        assetName: 'AAPL',
        portfolioId: 'p1',
        type: 'BUY',
        quantityChange: 1,
        date: '2026-01-01',
        pricePerUnit: 100,
      } as any, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.asset.findFirst).toHaveBeenCalledWith({ where: { ticker: 'AAPL' } });
      expect(prisma.stockTransaction.create).toHaveBeenCalled();
    });

    it('creates a crypto transaction when the asset is a cryptocurrency', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'CRYPTOCURRENCY' });
      prisma.cryptoTransaction.create.mockResolvedValue({ id: 'tx-1', date: new Date('2026-01-01') });

      await service.create({
        assetId: 'a1',
        portfolioId: 'p1',
        type: 'BUY',
        quantityChange: 1,
        date: '2026-01-01',
        pricePerUnit: 50000,
      } as any, OWNER_ID);

      expect(prisma.cryptoTransaction.create).toHaveBeenCalled();
      expect(prisma.stockTransaction.create).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.create({
        assetName: 'AAPL',
        portfolioId: 'p1',
        type: 'BUY',
        quantityChange: 1,
        date: '2026-01-01',
        pricePerUnit: 100,
      } as any, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.stockTransaction.create).not.toHaveBeenCalled();
      expect(prisma.cryptoTransaction.create).not.toHaveBeenCalled();
    });
  });
});
