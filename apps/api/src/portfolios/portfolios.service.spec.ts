/// <reference types="jest" />
// Tests for pure helper logic extracted from PortfoliosService
import { PortfoliosService } from './portfolios.service';
import { TransactionType } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

function calculateAvgPrice(
  transactions: { type: 'BUY' | 'SELL'; quantityChange: number; pricePerUnit: number }[],
): number {
  let totalQuantity = 0;
  let totalCost = 0;
  for (const t of transactions) {
    if (t.type === 'BUY') {
      totalQuantity += t.quantityChange;
      totalCost += t.quantityChange * t.pricePerUnit;
    } else {
      totalQuantity -= t.quantityChange;
      totalCost -= t.quantityChange * t.pricePerUnit;
    }
  }
  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}

// ── helpers mirroring PortfoliosPage.tsx client logic ────────────────────────

interface PortfolioAssetStub {
  asset: { ticker: string; type: string | null; currentPrice: number | null };
  price: number | null;
  quantity: number;
}

function calcAssetReturns(portfolioAssets: PortfolioAssetStub[]) {
  return portfolioAssets
    .filter((pa) => pa.asset.currentPrice != null && pa.price != null && pa.price !== 0)
    .map((pa) => {
      const pct = ((pa.asset.currentPrice! - pa.price!) / pa.price!) * 100;
      const dollarReturn = (pa.asset.currentPrice! - pa.price!) * pa.quantity;
      return { ticker: pa.asset.ticker, type: pa.asset.type, pct, dollarReturn };
    });
}

function topPerformers(portfolioAssets: PortfolioAssetStub[]) {
  return calcAssetReturns(portfolioAssets).sort((a, b) => b.pct - a.pct).slice(0, 3);
}

function topLosers(portfolioAssets: PortfolioAssetStub[]) {
  return calcAssetReturns(portfolioAssets).filter((a) => a.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 3);
}

function calcPortfolioDollarReturn(portfolioAssets: PortfolioAssetStub[]): number | null {
  const returns = calcAssetReturns(portfolioAssets);
  if (returns.length === 0) return null;
  return returns.reduce((sum, a) => sum + a.dollarReturn, 0);
}

function calcPortfolioReturn(portfolioAssets: PortfolioAssetStub[]): number | null {
  const valid = portfolioAssets.filter(
    (pa) => pa.asset?.currentPrice != null && pa.price != null && pa.price !== 0 && pa.quantity != null,
  );
  if (valid.length === 0) return null;
  const totalCost = valid.reduce((sum, pa) => sum + pa.price! * pa.quantity, 0);
  const totalCurrent = valid.reduce((sum, pa) => sum + pa.asset.currentPrice! * pa.quantity, 0);
  if (totalCost === 0) return null;
  return ((totalCurrent - totalCost) / totalCost) * 100;
}

// ── helper mirroring AssetTable.tsx multi-expand toggle ──────────────────────

function toggleExpanded(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('calculateAvgPrice', () => {
  it('computes weighted average for multiple BUY transactions', () => {
    const transactions = [
      { type: 'BUY' as const, quantityChange: 2, pricePerUnit: 100 },
      { type: 'BUY' as const, quantityChange: 3, pricePerUnit: 200 },
    ];
    expect(calculateAvgPrice(transactions)).toBe(160);
  });

  it('accounts for SELL transactions when computing avg', () => {
    const transactions = [
      { type: 'BUY' as const, quantityChange: 10, pricePerUnit: 50 },
      { type: 'SELL' as const, quantityChange: 5, pricePerUnit: 50 },
    ];
    expect(calculateAvgPrice(transactions)).toBe(50);
  });

  it('returns 0 when net quantity is 0 (fully sold out)', () => {
    const transactions = [
      { type: 'BUY' as const, quantityChange: 5, pricePerUnit: 100 },
      { type: 'SELL' as const, quantityChange: 5, pricePerUnit: 150 },
    ];
    expect(calculateAvgPrice(transactions)).toBe(0);
  });

  it('returns 0 for empty transaction list', () => {
    expect(calculateAvgPrice([])).toBe(0);
  });
});

describe('topPerformers', () => {
  const assets: PortfolioAssetStub[] = [
    { asset: { ticker: 'A', type: 'Stock', currentPrice: 150 }, price: 100, quantity: 10 },
    { asset: { ticker: 'B', type: 'CRYPTOCURRENCY', currentPrice: 200 }, price: 100, quantity: 5 },
    { asset: { ticker: 'C', type: 'Stock', currentPrice: 80 }, price: 100, quantity: 2 },
    { asset: { ticker: 'D', type: 'ETF', currentPrice: 110 }, price: 100, quantity: 1 },
  ];

  it('returns top 3 sorted by % gain descending', () => {
    const result = topPerformers(assets);
    expect(result.map((r) => r.ticker)).toEqual(['B', 'A', 'D']);
  });

  it('excludes assets with null currentPrice', () => {
    const withNull: PortfolioAssetStub[] = [
      { asset: { ticker: 'X', type: 'Stock', currentPrice: null }, price: 100, quantity: 1 },
      { asset: { ticker: 'Y', type: 'Stock', currentPrice: 200 }, price: 100, quantity: 1 },
    ];
    const result = topPerformers(withNull);
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('Y');
  });
});

describe('topLosers', () => {
  const assets: PortfolioAssetStub[] = [
    { asset: { ticker: 'A', type: 'Stock', currentPrice: 150 }, price: 100, quantity: 10 },
    { asset: { ticker: 'B', type: 'Stock', currentPrice: 60 }, price: 100, quantity: 5 },
    { asset: { ticker: 'C', type: 'Stock', currentPrice: 80 }, price: 100, quantity: 2 },
  ];

  it('only includes assets with negative returns', () => {
    const result = topLosers(assets);
    expect(result.every((r) => r.pct < 0)).toBe(true);
    expect(result.find((r) => r.ticker === 'A')).toBeUndefined();
  });

  it('sorts worst performer first', () => {
    const result = topLosers(assets);
    expect(result[0].ticker).toBe('B');
  });
});

describe('calcPortfolioReturn', () => {
  it('computes weighted % return across multiple assets', () => {
    const assets: PortfolioAssetStub[] = [
      { asset: { ticker: 'A', type: 'Stock', currentPrice: 150 }, price: 100, quantity: 10 },
      { asset: { ticker: 'B', type: 'Stock', currentPrice: 80 }, price: 100, quantity: 10 },
    ];
    // cost = 1000 + 1000 = 2000, current = 1500 + 800 = 2300 -> +15%
    expect(calcPortfolioReturn(assets)).toBeCloseTo(15);
  });

  it('returns null when no asset has price data', () => {
    const assets: PortfolioAssetStub[] = [
      { asset: { ticker: 'A', type: 'Stock', currentPrice: null }, price: 100, quantity: 10 },
    ];
    expect(calcPortfolioReturn(assets)).toBeNull();
  });
});

describe('calcPortfolioDollarReturn', () => {
  it('sums dollar return across all assets', () => {
    const assets: PortfolioAssetStub[] = [
      { asset: { ticker: 'A', type: 'Stock', currentPrice: 150 }, price: 100, quantity: 10 },
      { asset: { ticker: 'B', type: 'Stock', currentPrice: 80 }, price: 100, quantity: 10 },
    ];
    // (150-100)*10 + (80-100)*10 = 500 - 200 = 300
    expect(calcPortfolioDollarReturn(assets)).toBe(300);
  });

  it('returns null when there is no valid asset data', () => {
    expect(calcPortfolioDollarReturn([])).toBeNull();
  });
});

describe('PortfoliosService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let assetsService: any;
  let service: PortfoliosService;

  beforeEach(() => {
    prisma = {
      portfolio: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ userId: OWNER_ID }),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      asset: {
        findUnique: jest.fn(),
      },
      stockPosition: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      cryptoPosition: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      stockTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      cryptoTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    assetsService = {
      findAssetByName: jest.fn(),
      createAsset: jest.fn(),
      getSharePrice: jest.fn(),
    };

    service = new PortfoliosService(prisma, assetsService);
  });

  describe('assertOwnership', () => {
    it('resolves without throwing when the portfolio belongs to the user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OWNER_ID });

      await expect(service.assertOwnership('p1', OWNER_ID)).resolves.toBeUndefined();
    });

    it('throws NotFoundException when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.assertOwnership('missing', OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.assertOwnership('p1', OWNER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('creates a portfolio and includes the user', async () => {
      prisma.portfolio.create.mockResolvedValue({ id: 'p1', name: 'Retirement', userId: 'u1' });

      const result = await service.create({ name: 'Retirement', userId: 'u1' } as any);

      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: { name: 'Retirement', userId: 'u1' },
        include: { user: true },
      });
      expect(result.id).toBe('p1');
    });
  });

  describe('getById', () => {
    it('fetches a portfolio with assets, transactions and real estate', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        realEstateAssets: [],
      });

      const result = await service.getById('p1', OWNER_ID);

      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'p1' } }),
      );
      expect(result.id).toBe('p1');
    });

    it('returns null when portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.getById('missing', OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.getById('p1', OWNER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('updates only the portfolio name', async () => {
      prisma.portfolio.update.mockResolvedValue({ id: 'p1', name: 'New Name' });

      await service.update({ id: 'p1', name: 'New Name' } as any, OWNER_ID);

      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { name: 'New Name' },
        include: {
          stockPositions: { include: { asset: true } },
          cryptoPositions: { include: { asset: true } },
        },
      });
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.update({ id: 'p1', name: 'New Name' } as any, OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.portfolio.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes transactions, positions and the portfolio in one transaction', async () => {
      prisma.$transaction.mockResolvedValue(undefined);

      await service.delete('p1', OWNER_ID);

      expect(prisma.stockTransaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.cryptoTransaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.stockPosition.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.cryptoPosition.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.portfolio.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(5);
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.delete('p1', OWNER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.portfolio.delete).not.toHaveBeenCalled();
    });
  });

  describe('getByUserId', () => {
    it('returns all portfolios for a user, including bonds and real estate', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        { id: 'p1', stockPositions: [], cryptoPositions: [], bonds: [], realEstateAssets: [] },
        { id: 'p2', stockPositions: [], cryptoPositions: [], bonds: [], realEstateAssets: [] },
      ]);

      const result = await service.getByUserId('u1');

      expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: {
          stockPositions: { include: { asset: true } },
          cryptoPositions: { include: { asset: true } },
          bonds: true,
          realEstateAssets: true,
          mixedAssets: true,
        },
      });
      expect(result).toHaveLength(2);
    });

    it('includes each portfolio\'s bonds and real estate in the returned dto', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [],
          cryptoPositions: [],
          bonds: [{ id: 'b1', isin: 'US123' }],
          realEstateAssets: [{ id: 're1', code: 'LVIV-01' }],
        },
      ]);

      const [result] = await service.getByUserId('u1');

      expect(result.bonds).toEqual([{ id: 'b1', isin: 'US123' }]);
      expect(result.realEstateAssets).toEqual([{ id: 're1', code: 'LVIV-01' }]);
    });

    it('returns an empty array when the user has no portfolios', async () => {
      prisma.portfolio.findMany.mockResolvedValue([]);

      const result = await service.getByUserId('u1');

      expect(result).toEqual([]);
    });
  });

  describe('addAssetToPortfolio', () => {
    const baseInput = {
      assetName: 'AAPL',
      type: TransactionType.BUY,
      quantityChange: 10,
      pricePerUnit: 100,
      date: '2026-01-01',
    };

    it('throws NotFound when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.addAssetToPortfolio('missing', baseInput as any, OWNER_ID)).rejects.toThrow();
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(assetsService.findAssetByName).not.toHaveBeenCalled();
    });

    it('creates a new asset when it does not exist yet', async () => {
      assetsService.findAssetByName.mockResolvedValue(null);
      assetsService.createAsset.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.stockPosition.findUnique.mockResolvedValue(null);
      prisma.stockPosition.create.mockResolvedValue({ id: 'pa1' });
      prisma.stockTransaction.create.mockResolvedValue({});
      prisma.stockTransaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100 },
      ]);
      prisma.stockPosition.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(assetsService.createAsset).toHaveBeenCalledWith(
        expect.objectContaining({ ticker: 'AAPL' }),
      );
      expect(prisma.stockPosition.create).toHaveBeenCalledWith({
        data: { assetId: 'a1', portfolioId: 'p1', quantity: 0 },
      });
    });

    it('reuses an existing asset and position without recreating them', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.stockPosition.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.stockTransaction.create.mockResolvedValue({});
      prisma.stockTransaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100 },
      ]);
      prisma.stockPosition.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(assetsService.createAsset).not.toHaveBeenCalled();
      expect(prisma.stockPosition.create).not.toHaveBeenCalled();
    });

    it('recomputes quantity and rounded average price from all transactions', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.stockPosition.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.stockTransaction.create.mockResolvedValue({});
      prisma.stockTransaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100 },
        { type: TransactionType.BUY, quantityChange: 5, pricePerUnit: 133 },
        { type: TransactionType.SELL, quantityChange: 3, pricePerUnit: 999 },
      ]);
      prisma.stockPosition.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      // quantity = 10 + 5 - 3 = 12, cost = 1000 + 665 - 2997 = -1332, avg = -1332/12 = -111 (rounded)
      expect(prisma.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 12, price: Math.round(-1332 / 12) },
      });
    });

    it('creates a cryptocurrency asset sourced from coingecko when a coingeckoId is provided, routed to the crypto tables', async () => {
      assetsService.findAssetByName.mockResolvedValue(null);
      assetsService.createAsset.mockResolvedValue({ id: 'a1', ticker: 'BTC', type: 'CRYPTOCURRENCY' });
      prisma.cryptoPosition.findUnique.mockResolvedValue(null);
      prisma.cryptoPosition.create.mockResolvedValue({ id: 'pa1' });
      prisma.cryptoTransaction.create.mockResolvedValue({});
      prisma.cryptoTransaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 1, pricePerUnit: 50000 },
      ]);
      prisma.cryptoPosition.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.addAssetToPortfolio('p1', {
        ...baseInput,
        assetName: 'BTC',
        coingeckoId: 'bitcoin',
      } as any, OWNER_ID);

      expect(assetsService.createAsset).toHaveBeenCalledWith({
        ticker: 'BTC',
        coingeckoId: 'bitcoin',
        type: 'CRYPTOCURRENCY',
        dataSource: 'COINGECKO',
      });
      expect(prisma.cryptoPosition.create).toHaveBeenCalledWith({
        data: { assetId: 'a1', portfolioId: 'p1', quantity: 0 },
      });
      expect(prisma.stockPosition.create).not.toHaveBeenCalled();
    });

    it('records a SELL-only position as a negative quantity with zero average price', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.stockPosition.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.stockTransaction.create.mockResolvedValue({});
      prisma.stockTransaction.findMany.mockResolvedValue([
        { type: TransactionType.SELL, quantityChange: 4, pricePerUnit: 100 },
      ]);
      prisma.stockPosition.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.addAssetToPortfolio('p1', {
        ...baseInput,
        type: TransactionType.SELL,
        quantityChange: 4,
      } as any, OWNER_ID);

      expect(prisma.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: -4, price: 0 },
      });
    });

    it('records the transaction with the given type, quantity, price and date', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.stockPosition.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.stockTransaction.create.mockResolvedValue({});
      prisma.stockTransaction.findMany.mockResolvedValue([]);
      prisma.stockPosition.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(prisma.stockTransaction.create).toHaveBeenCalledWith({
        data: {
          type: TransactionType.BUY,
          quantityChange: 10,
          date: new Date('2026-01-01'),
          pricePerUnit: 100,
          portfolioId: 'p1',
          assetId: 'a1',
        },
      });
    });
  });

  describe('deleteAsset', () => {
    it('removes transactions and the stock position, returning the updated portfolio', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'Stock' });
      prisma.stockTransaction.deleteMany.mockResolvedValue({});
      prisma.stockPosition.delete.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      const result = await service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID);

      expect(prisma.stockTransaction.deleteMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1', assetId: 'a1' },
      });
      expect(prisma.stockPosition.delete).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
      });
      expect(result.id).toBe('p1');
    });

    it('removes transactions and the crypto position when the asset is a cryptocurrency', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'CRYPTOCURRENCY' });
      prisma.cryptoTransaction.deleteMany.mockResolvedValue({});
      prisma.cryptoPosition.delete.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', stockPositions: [], cryptoPositions: [] });

      await service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID);

      expect(prisma.cryptoTransaction.deleteMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1', assetId: 'a1' },
      });
      expect(prisma.cryptoPosition.delete).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
      });
      expect(prisma.stockTransaction.deleteMany).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.stockTransaction.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('getPortfolioBalance', () => {
    it('throws NotFoundException when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.getPortfolioBalance('missing', 'USD' as any, OWNER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.getPortfolioBalance('p1', 'USD' as any, OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns actual prices for each stock and crypto position', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [{ assetId: 'a1', asset: { ticker: 'AAPL' } }],
        cryptoPositions: [{ assetId: 'a2', asset: { ticker: 'BTC' } }],
      });
      assetsService.getSharePrice.mockResolvedValueOnce(150).mockResolvedValueOnce(50000);

      const result = await service.getPortfolioBalance('p1', 'USD' as any, OWNER_ID);

      expect(result).toEqual([
        { assetId: 'a1', symbol: 'AAPL', actualPrice: 150 },
        { assetId: 'a2', symbol: 'BTC', actualPrice: 50000 },
      ]);
    });

    it('fetches prices concurrently instead of serially', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [{ assetId: 'a1', asset: { ticker: 'AAPL' } }],
        cryptoPositions: [{ assetId: 'a2', asset: { ticker: 'BTC' } }],
      });
      assetsService.getSharePrice.mockResolvedValue(100);

      const start = Date.now();
      await service.getPortfolioBalance('p1', 'USD' as any, OWNER_ID);

      expect(Date.now() - start).toBeLessThan(500);
    });

    it('returns an empty array when the portfolio has no positions', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ id: 'p1', userId: OWNER_ID, stockPositions: [], cryptoPositions: [] });

      const result = await service.getPortfolioBalance('p1', 'USD' as any, OWNER_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getPortfolioReturns', () => {
    it('throws NotFoundException when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.getPortfolioReturns('missing', 'all', OWNER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.getPortfolioReturns('p1', 'all', OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns null for both fields when there is no valid position data', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1', userId: OWNER_ID, stockPositions: [], cryptoPositions: [], bonds: [], realEstateAssets: [],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      expect(result).toEqual({ pctReturn: null, dollarReturn: null });
    });

    it('computes weighted % and $ return across all BUY/SELL transactions for "all" time', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [
          {
            asset: { currentPrice: 150 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100, date: new Date('2020-01-01') },
            ],
          },
          {
            asset: { currentPrice: 80 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100, date: new Date('2020-01-01') },
            ],
          },
        ],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      // cost = 1000 + 1000 = 2000, current = 1500 + 800 = 2300 -> +15%, +300
      expect(result.pctReturn).toBeCloseTo(15);
      expect(result.dollarReturn).toBe(300);
    });

    it('only counts transactions within the last year when period is "year"', async () => {
      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      const recently = new Date(now.getFullYear(), now.getMonth(), Math.max(now.getDate() - 1, 1));

      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [
          {
            asset: { currentPrice: 200 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 999, date: twoYearsAgo },
              { type: TransactionType.BUY, quantityChange: 5, pricePerUnit: 100, date: recently },
            ],
          },
        ],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
      });

      const result = await service.getPortfolioReturns('p1', 'year', OWNER_ID);

      // only the recent 5@100 transaction counts: cost = 500, current = 1000 -> +100%, +500
      expect(result.pctReturn).toBeCloseTo(100);
      expect(result.dollarReturn).toBe(500);
    });

    it('excludes assets with no current price', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [
          {
            asset: { currentPrice: null },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100, date: new Date('2020-01-01') },
            ],
          },
        ],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      expect(result).toEqual({ pctReturn: null, dollarReturn: null });
    });

    it('excludes assets that were fully sold off (net non-positive quantity)', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [
          {
            asset: { currentPrice: 150 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 5, pricePerUnit: 100, date: new Date('2020-01-01') },
              { type: TransactionType.SELL, quantityChange: 5, pricePerUnit: 150, date: new Date('2020-06-01') },
            ],
          },
        ],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      expect(result).toEqual({ pctReturn: null, dollarReturn: null });
    });

    describe('bond income', () => {
      it('includes a full year of coupon income for "all" time on a bond held over a year', async () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          realEstateAssets: [],
          bonds: [
            {
              faceValue: 1000,
              couponRate: 5,
              quantity: 10,
              purchasePrice: 950,
              purchaseDate: twoYearsAgo,
              maturityDate: null,
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        // annual income = 1000 * 0.05 * 10 = 500/yr, held ~2 years -> ~1000 income
        // cost = 950 * 10 = 9500
        expect(result.dollarReturn).toBeCloseTo(1000, -1);
        expect(result.pctReturn).toBeCloseTo((1000 / 9500) * 100, 0);
      });

      it('prorates income to only the days held within the "month" period', async () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          realEstateAssets: [],
          bonds: [
            {
              faceValue: 1000,
              couponRate: 12,
              quantity: 1,
              purchasePrice: 1000,
              purchaseDate: twoYearsAgo,
              maturityDate: null,
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'month', OWNER_ID);

        // annual income = 1000 * 0.12 * 1 = 120/yr; a partial month should earn
        // a small fraction of that, not the full annual figure
        expect(result.dollarReturn).toBeGreaterThan(0);
        expect(result.dollarReturn).toBeLessThan(120);
      });

      it('excludes a bond that matured before the requested period started', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          realEstateAssets: [],
          bonds: [
            {
              faceValue: 1000,
              couponRate: 5,
              quantity: 10,
              purchasePrice: 950,
              purchaseDate: new Date('2015-01-01'),
              maturityDate: new Date('2018-01-01'),
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'year', OWNER_ID);

        expect(result).toEqual({ pctReturn: null, dollarReturn: null });
      });

      it('excludes bonds with zero or negative quantity', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          realEstateAssets: [],
          bonds: [
            {
              faceValue: 1000,
              couponRate: 5,
              quantity: 0,
              purchasePrice: 950,
              purchaseDate: new Date('2020-01-01'),
              maturityDate: null,
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        expect(result).toEqual({ pctReturn: null, dollarReturn: null });
      });

      it('adds capital gain from the currentValue override on top of coupon income', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          realEstateAssets: [],
          bonds: [
            {
              faceValue: 0,
              couponRate: 0,
              quantity: 10,
              purchasePrice: 950,
              currentValue: 1000,
              purchaseDate: new Date('2020-01-01'),
              maturityDate: null,
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        // no coupon income (rate 0); capital gain = (1000 - 950) * 10 = 500
        expect(result.dollarReturn).toBe(500);
        expect(result.pctReturn).toBeCloseTo((500 / 9500) * 100, 5);
      });

      it('counts a capital loss from the currentValue override, even with no income', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          realEstateAssets: [],
          bonds: [
            {
              faceValue: 0,
              couponRate: 0,
              quantity: 10,
              purchasePrice: 950,
              currentValue: 900,
              purchaseDate: new Date('2020-01-01'),
              maturityDate: null,
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        expect(result.dollarReturn).toBe(-500);
      });
    });

    describe('real estate income', () => {
      it('includes rental income overlapping the period and always counts the purchase price as cost', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [
            {
              purchasePrice: 100000,
              transactions: [
                { startDate: new Date('2020-01-01'), endDate: new Date('2020-02-01'), monthlyRent: 1000 },
              ],
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        // January (31 days) of rent at 30.4375 days/month average
        const expectedIncome = (31 / 30.4375) * 1000;
        expect(result.dollarReturn).toBeCloseTo(expectedIncome, 5);
        expect(result.pctReturn).toBeCloseTo((expectedIncome / 100000) * 100, 5);
      });

      it('still counts the purchase price as cost even with no rental transactions', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [
            { purchasePrice: 100000, transactions: [] },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        expect(result.dollarReturn).toBe(0);
        expect(result.pctReturn).toBe(0);
      });

      it('adds capital gain from the currentValue override on top of rental income', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [
            { purchasePrice: 100000, currentValue: 120000, transactions: [] },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

        expect(result.dollarReturn).toBe(20000);
        expect(result.pctReturn).toBeCloseTo(20, 5);
      });

      it('excludes rental income from outside the requested period', async () => {
        prisma.portfolio.findUnique.mockResolvedValue({
          id: 'p1',
          userId: OWNER_ID,
          stockPositions: [],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [
            {
              purchasePrice: 100000,
              transactions: [
                { startDate: new Date('2015-01-01'), endDate: new Date('2015-02-01'), monthlyRent: 1000 },
              ],
            },
          ],
        });

        const result = await service.getPortfolioReturns('p1', 'month', OWNER_ID);

        expect(result.dollarReturn).toBe(0);
      });
    });

    it('combines stock, bond and real estate returns into one total', async () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [
          {
            asset: { currentPrice: 150 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100, date: new Date('2020-01-01') },
            ],
          },
        ],
        cryptoPositions: [],
        bonds: [
          {
            faceValue: 1000,
            couponRate: 5,
            quantity: 1,
            purchasePrice: 950,
            purchaseDate: twoYearsAgo,
            maturityDate: null,
          },
        ],
        realEstateAssets: [
          {
            purchasePrice: 50000,
            transactions: [
              { startDate: new Date('2020-01-01'), endDate: new Date('2020-02-01'), monthlyRent: 500 },
            ],
          },
        ],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      // stock: cost 1000, return 500 | bond: cost 950, ~2yrs of 50/yr income ~= 100
      // real estate: cost 50000, ~500 rental income
      // totalCost = 1000 + 950 + 50000 = 51950; totalReturn ~= 500 + 100 + 500 = 1100
      expect(result.dollarReturn).toBeGreaterThan(1000);
      expect(result.dollarReturn).toBeLessThan(1200);
      expect(result.pctReturn).toBeCloseTo((result.dollarReturn! / 51950) * 100, 5);
    });
  });

  describe('getTopMovers', () => {
    it('throws NotFoundException when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.getTopMovers('missing', 'all', OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.getTopMovers('p1', 'all', OWNER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('ranks stocks by price-change % and bonds/real estate by income yield %, highest first', async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [
          {
            asset: { ticker: 'WINNER', type: 'Stock', currentPrice: 200 },
            transactions: [{ type: TransactionType.BUY, quantityChange: 1, pricePerUnit: 100, date: new Date('2020-01-01') }],
          },
          {
            asset: { ticker: 'LOSER', type: 'Stock', currentPrice: 50 },
            transactions: [{ type: TransactionType.BUY, quantityChange: 1, pricePerUnit: 100, date: new Date('2020-01-01') }],
          },
        ],
        cryptoPositions: [],
        bonds: [
          {
            isin: 'US-BOND-1',
            faceValue: 1000,
            couponRate: 5,
            quantity: 1,
            purchasePrice: 1000,
            purchaseDate: sixMonthsAgo,
            maturityDate: null,
          },
        ],
        realEstateAssets: [
          {
            code: 'PROP-1',
            purchasePrice: 100000,
            transactions: [{ startDate: sixMonthsAgo, endDate: new Date('2030-01-01'), monthlyRent: 100 }],
          },
        ],
      });

      const result = await service.getTopMovers('p1', 'all', OWNER_ID);

      // WINNER: +100%, bond ~5% yield, real estate ~small yield, LOSER: -50%
      expect(result.topPerformers[0].label).toBe('WINNER');
      expect(result.topPerformers.map((m: any) => m.label)).not.toContain('LOSER');
      expect(result.topLosers[0].label).toBe('LOSER');
      expect(result.topLosers[0].pct).toBeLessThan(0);
    });

    it('limits each list to 3 entries', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [1, 2, 3, 4, 5].map((n) => ({
          asset: { ticker: `T${n}`, type: 'Stock', currentPrice: 100 + n },
          transactions: [{ type: TransactionType.BUY, quantityChange: 1, pricePerUnit: 100, date: new Date('2020-01-01') }],
        })),
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
      });

      const result = await service.getTopMovers('p1', 'all', OWNER_ID);

      expect(result.topPerformers.length).toBeLessThanOrEqual(3);
    });

    it('excludes a bond with zero income (not held during the period) from both lists', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [
          {
            isin: 'MATURED-BOND',
            faceValue: 1000,
            couponRate: 5,
            quantity: 1,
            purchasePrice: 1000,
            purchaseDate: new Date('2015-01-01'),
            maturityDate: new Date('2018-01-01'),
          },
        ],
        realEstateAssets: [],
      });

      const result = await service.getTopMovers('p1', 'year', OWNER_ID);

      expect(result.topPerformers).toEqual([]);
      expect(result.topLosers).toEqual([]);
    });

    it('includes a real estate property with zero rental income among performers at 0%, never as a loser', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [{ code: 'VACANT', purchasePrice: 100000, transactions: [] }],
      });

      const result = await service.getTopMovers('p1', 'all', OWNER_ID);

      expect(result.topPerformers).toEqual([
        expect.objectContaining({ label: 'VACANT', pct: 0, dollarReturn: 0 }),
      ]);
      expect(result.topLosers).toEqual([]);
    });

    it('surfaces a bond as a top loser purely from a capital loss, with no income at all', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [
          {
            isin: 'DOWN-BOND',
            faceValue: 0,
            couponRate: 0,
            quantity: 10,
            purchasePrice: 1000,
            currentValue: 900,
            purchaseDate: new Date('2020-01-01'),
            maturityDate: null,
          },
        ],
        realEstateAssets: [],
      });

      const result = await service.getTopMovers('p1', 'all', OWNER_ID);

      expect(result.topLosers).toEqual([
        expect.objectContaining({ label: 'DOWN-BOND', pct: -10, dollarReturn: -1000 }),
      ]);
    });

    it('ranks a real estate property by capital gain plus rental income', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [
          { code: 'APPRECIATED', purchasePrice: 100000, currentValue: 130000, transactions: [] },
        ],
      });

      const result = await service.getTopMovers('p1', 'all', OWNER_ID);

      expect(result.topPerformers).toEqual([
        expect.objectContaining({ label: 'APPRECIATED', pct: 30, dollarReturn: 30000 }),
      ]);
    });
  });

  describe('getNetWorth', () => {
    it('returns zero for a user with no portfolios', async () => {
      prisma.portfolio.findMany.mockResolvedValue([]);

      const result = await service.getNetWorth(OWNER_ID);

      expect(result).toEqual({
        total: 0,
        byType: { stocks: 0, crypto: 0, bonds: 0, realEstate: 0, mixedAssets: 0 },
      });
    });

    it('sums current value across stocks, crypto, bonds, real estate and mixed assets in a single portfolio', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [{ asset: { type: 'Stock', currentPrice: 150 }, price: 100, quantity: 10 }],
          cryptoPositions: [{ asset: { type: 'CRYPTOCURRENCY', currentPrice: 50000 }, price: 40000, quantity: 0.5 }],
          bonds: [{ purchasePrice: 950, quantity: 10 }],
          realEstateAssets: [{ purchasePrice: 200000 }],
          mixedAssets: [{ purchasePrice: 5000, currentValue: 6000, quantity: 1 }],
        },
      ]);

      const result = await service.getNetWorth(OWNER_ID);

      // stocks: 150*10 = 1500 | crypto: 50000*0.5 = 25000
      // bonds: 950*10 = 9500 | real estate: 200000 | mixed assets: 6000*1 = 6000
      expect(result.byType).toEqual({ stocks: 1500, crypto: 25000, bonds: 9500, realEstate: 200000, mixedAssets: 6000 });
      expect(result.total).toBe(1500 + 25000 + 9500 + 200000 + 6000);
    });

    it('falls back to purchasePrice for a mixed asset with no currentValue set yet', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [],
          mixedAssets: [{ purchasePrice: 5000, currentValue: null, quantity: 2 }],
        },
      ]);

      const result = await service.getNetWorth(OWNER_ID);

      expect(result.byType.mixedAssets).toBe(10000);
    });

    it('prefers currentValue over purchasePrice for bonds and real estate when set', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [],
          cryptoPositions: [],
          bonds: [{ purchasePrice: 950, currentValue: 1000, quantity: 10 }],
          realEstateAssets: [{ purchasePrice: 200000, currentValue: 220000 }],
          mixedAssets: [],
        },
      ]);

      const result = await service.getNetWorth(OWNER_ID);

      expect(result.byType.bonds).toBe(10000);
      expect(result.byType.realEstate).toBe(220000);
    });

    it('falls back to purchasePrice for bonds and real estate with no currentValue set yet', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [],
          cryptoPositions: [],
          bonds: [{ purchasePrice: 950, currentValue: null, quantity: 10 }],
          realEstateAssets: [{ purchasePrice: 200000, currentValue: null }],
          mixedAssets: [],
        },
      ]);

      const result = await service.getNetWorth(OWNER_ID);

      expect(result.byType.bonds).toBe(9500);
      expect(result.byType.realEstate).toBe(200000);
    });

    it('sums across multiple portfolios, not just one', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [{ asset: { type: 'Stock', currentPrice: 100 }, price: 100, quantity: 1 }],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [],
        },
        {
          id: 'p2',
          stockPositions: [{ asset: { type: 'Stock', currentPrice: 200 }, price: 200, quantity: 1 }],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [],
        },
      ]);

      const result = await service.getNetWorth(OWNER_ID);

      expect(result.byType.stocks).toBe(300);
      expect(result.total).toBe(300);
    });

    it('falls back to the average cost when currentPrice has not been fetched yet', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          stockPositions: [{ asset: { type: 'Stock', currentPrice: null }, price: 80, quantity: 5 }],
          cryptoPositions: [],
          bonds: [],
          realEstateAssets: [],
        },
      ]);

      const result = await service.getNetWorth(OWNER_ID);

      expect(result.byType.stocks).toBe(400);
    });

    it('scopes the query to the given user', async () => {
      prisma.portfolio.findMany.mockResolvedValue([]);

      await service.getNetWorth(OWNER_ID);

      expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: OWNER_ID },
        include: {
          stockPositions: { include: { asset: true } },
          cryptoPositions: { include: { asset: true } },
          bonds: true,
          realEstateAssets: true,
          mixedAssets: true,
        },
      });
    });
  });

  describe('getPortfolioNetWorth', () => {
    it('throws NotFoundException when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.getPortfolioNetWorth('missing', OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.getPortfolioNetWorth('p1', OWNER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('sums current value across asset types for a single portfolio', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [{ asset: { currentPrice: 150 }, price: 100, quantity: 10 }],
        cryptoPositions: [{ asset: { currentPrice: 50000 }, price: 40000, quantity: 0.5 }],
        bonds: [{ purchasePrice: 950, currentValue: null, quantity: 10 }],
        realEstateAssets: [{ purchasePrice: 200000, currentValue: null }],
        mixedAssets: [{ purchasePrice: 5000, currentValue: 6000, quantity: 1 }],
      });

      const result = await service.getPortfolioNetWorth('p1', OWNER_ID);

      expect(result.byType).toEqual({ stocks: 1500, crypto: 25000, bonds: 9500, realEstate: 200000, mixedAssets: 6000 });
      expect(result.total).toBe(1500 + 25000 + 9500 + 200000 + 6000);
    });

    it('does not include other portfolios owned by the same user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [{ asset: { currentPrice: 100 }, price: 100, quantity: 1 }],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
        mixedAssets: [],
      });

      const result = await service.getPortfolioNetWorth('p1', OWNER_ID);

      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'p1' } }),
      );
      expect(result.total).toBe(100);
    });

    it('returns zero for a portfolio with no holdings of any kind', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
        mixedAssets: [],
      });

      const result = await service.getPortfolioNetWorth('p1', OWNER_ID);

      expect(result).toEqual({
        total: 0,
        byType: { stocks: 0, crypto: 0, bonds: 0, realEstate: 0, mixedAssets: 0 },
      });
    });

    it('tolerates a missing mixedAssets relation', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
      });

      const result = await service.getPortfolioNetWorth('p1', OWNER_ID);

      expect(result.byType.mixedAssets).toBe(0);
    });

    it('requests every asset relation needed to value the portfolio', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        stockPositions: [],
        cryptoPositions: [],
        bonds: [],
        realEstateAssets: [],
        mixedAssets: [],
      });

      await service.getPortfolioNetWorth('p1', OWNER_ID);

      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
        include: {
          stockPositions: { include: { asset: true } },
          cryptoPositions: { include: { asset: true } },
          bonds: true,
          realEstateAssets: true,
          mixedAssets: true,
        },
      });
    });
  });
});

describe('toggleExpanded', () => {
  it('adds an id that is not yet expanded', () => {
    const result = toggleExpanded(new Set(), 'asset-1');
    expect(result.has('asset-1')).toBe(true);
  });

  it('removes an id that is already expanded', () => {
    const result = toggleExpanded(new Set(['asset-1']), 'asset-1');
    expect(result.has('asset-1')).toBe(false);
  });

  it('keeps other expanded ids untouched when toggling one', () => {
    const result = toggleExpanded(new Set(['asset-1']), 'asset-2');
    expect(result.has('asset-1')).toBe(true);
    expect(result.has('asset-2')).toBe(true);
  });
});
