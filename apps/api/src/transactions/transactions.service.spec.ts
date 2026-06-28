/// <reference types="jest" />
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let prisma: any;
  let portfoliosService: any;
  let service: TransactionsService;
  let trx: any;

  beforeEach(() => {
    trx = {
      transaction: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      portfolioAsset: {
        update: jest.fn(),
      },
    };

    prisma = {
      asset: { findFirst: jest.fn() },
      transaction: { create: jest.fn() },
      $transaction: jest.fn((cb) => cb(trx)),
    };

    portfoliosService = { addAssetToPortfolio: jest.fn() };

    service = new TransactionsService(prisma, portfoliosService);
  });

  describe('update', () => {
    it('recomputes quantity and weighted avg price from all BUY/SELL transactions', async () => {
      trx.transaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.transaction.findMany.mockResolvedValue([
        { type: 'BUY', quantityChange: 10, pricePerUnit: 100 },
        { type: 'BUY', quantityChange: 5, pricePerUnit: 200 },
        { type: 'SELL', quantityChange: 3, pricePerUnit: 250 },
      ]);

      await service.update('tx-1', { date: '2026-01-01', quantityChange: 10, pricePerUnit: 100 });

      // bought 15 total, cost 10*100 + 5*200 = 2000, avg = 2000/15
      expect(trx.portfolioAsset.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 12, price: 2000 / 15 },
      });
    });

    it('sets price to 0 when there are no BUY transactions', async () => {
      trx.transaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.transaction.findMany.mockResolvedValue([
        { type: 'SELL', quantityChange: 2, pricePerUnit: 100 },
      ]);

      await service.update('tx-1', { date: '2026-01-01', quantityChange: 2, pricePerUnit: 100 });

      expect(trx.portfolioAsset.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: -2, price: 0 },
      });
    });
  });

  describe('delete', () => {
    it('recomputes position from remaining transactions after deletion', async () => {
      trx.transaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.transaction.findMany.mockResolvedValue([
        { type: 'BUY', quantityChange: 10, pricePerUnit: 100 },
      ]);

      await service.delete('tx-1');

      expect(trx.transaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-1' } });
      expect(trx.portfolioAsset.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 10, price: 100 },
      });
    });

    it('zeroes out the position when the last transaction is removed', async () => {
      trx.transaction.findUniqueOrThrow.mockResolvedValue({ portfolioId: 'p1', assetId: 'a1' });
      trx.transaction.findMany.mockResolvedValue([]);

      await service.delete('tx-1');

      expect(trx.portfolioAsset.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 0, price: 0 },
      });
    });
  });

  describe('create', () => {
    it('resolves the asset by ticker name when assetId is not provided', async () => {
      prisma.asset.findFirst.mockResolvedValue({ id: 'a1' });
      prisma.transaction.create.mockResolvedValue({ id: 'tx-1', date: new Date('2026-01-01') });

      await service.create({
        assetName: 'AAPL',
        portfolioId: 'p1',
        type: 'BUY',
        quantityChange: 1,
        date: '2026-01-01',
        pricePerUnit: 100,
      } as any);

      expect(prisma.asset.findFirst).toHaveBeenCalledWith({ where: { ticker: 'AAPL' } });
    });
  });
});
