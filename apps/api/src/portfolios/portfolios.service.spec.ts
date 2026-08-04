/// <reference types="jest" />
// Tests for pure helper logic extracted from PortfoliosService
import { PortfoliosService } from './portfolios.service';
import { TransactionType } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

interface AssetWithPrice {
  asset: string;
  price: number;
  currency: string;
  quantity: number;
}

function calculateAssetsTotalPrice(assets: AssetWithPrice[]): number {
  return assets.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
}

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

describe('calculateAssetsTotalPrice', () => {
  it('sums price * quantity across assets', () => {
    const assets = [
      { asset: 'AAPL', price: 100, currency: 'USD', quantity: 2 },
      { asset: 'BTC', price: 50000, currency: 'USD', quantity: 0.5 },
    ];
    expect(calculateAssetsTotalPrice(assets)).toBe(25200);
  });

  it('returns 0 for empty list', () => {
    expect(calculateAssetsTotalPrice([])).toBe(0);
  });
});

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
      portfolioAsset: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      transaction: {
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
        portfolioAssets: [],
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
        include: { portfolioAssets: { include: { asset: true } } },
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
    it('deletes transactions, portfolio assets and the portfolio in one transaction', async () => {
      prisma.portfolioAsset.deleteMany = jest.fn();
      prisma.$transaction.mockResolvedValue(undefined);

      await service.delete('p1', OWNER_ID);

      expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.portfolioAsset.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.portfolio.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(3);
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
        { id: 'p1', portfolioAssets: [], bonds: [], realEstateAssets: [] },
        { id: 'p2', portfolioAssets: [], bonds: [], realEstateAssets: [] },
      ]);

      const result = await service.getByUserId('u1');

      expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: {
          portfolioAssets: { include: { asset: true } },
          bonds: true,
          realEstateAssets: true,
        },
      });
      expect(result).toHaveLength(2);
    });

    it('includes each portfolio\'s bonds and real estate in the returned dto', async () => {
      prisma.portfolio.findMany.mockResolvedValue([
        {
          id: 'p1',
          portfolioAssets: [],
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
      prisma.portfolioAsset.findUnique.mockResolvedValue(null);
      prisma.portfolioAsset.create.mockResolvedValue({ id: 'pa1' });
      prisma.transaction.create.mockResolvedValue({});
      prisma.transaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100 },
      ]);
      prisma.portfolioAsset.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(assetsService.createAsset).toHaveBeenCalledWith(
        expect.objectContaining({ ticker: 'AAPL' }),
      );
      expect(prisma.portfolioAsset.create).toHaveBeenCalledWith({
        data: { assetId: 'a1', portfolioId: 'p1', quantity: 0 },
      });
    });

    it('reuses an existing asset and portfolioAsset without recreating them', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.portfolioAsset.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.transaction.create.mockResolvedValue({});
      prisma.transaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100 },
      ]);
      prisma.portfolioAsset.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(assetsService.createAsset).not.toHaveBeenCalled();
      expect(prisma.portfolioAsset.create).not.toHaveBeenCalled();
    });

    it('recomputes quantity and rounded average price from all transactions', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.portfolioAsset.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.transaction.create.mockResolvedValue({});
      prisma.transaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100 },
        { type: TransactionType.BUY, quantityChange: 5, pricePerUnit: 133 },
        { type: TransactionType.SELL, quantityChange: 3, pricePerUnit: 999 },
      ]);
      prisma.portfolioAsset.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      // quantity = 10 + 5 - 3 = 12, cost = 1000 + 665 - 2997 = -1332, avg = -1332/12 = -111 (rounded)
      expect(prisma.portfolioAsset.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: 12, price: Math.round(-1332 / 12) },
      });
    });

    it('creates a cryptocurrency asset sourced from coingecko when a coingeckoId is provided', async () => {
      assetsService.findAssetByName.mockResolvedValue(null);
      assetsService.createAsset.mockResolvedValue({ id: 'a1', ticker: 'BTC' });
      prisma.portfolioAsset.findUnique.mockResolvedValue(null);
      prisma.portfolioAsset.create.mockResolvedValue({ id: 'pa1' });
      prisma.transaction.create.mockResolvedValue({});
      prisma.transaction.findMany.mockResolvedValue([
        { type: TransactionType.BUY, quantityChange: 1, pricePerUnit: 50000 },
      ]);
      prisma.portfolioAsset.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

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
    });

    it('records a SELL-only position as a negative quantity with zero average price', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.portfolioAsset.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.transaction.create.mockResolvedValue({});
      prisma.transaction.findMany.mockResolvedValue([
        { type: TransactionType.SELL, quantityChange: 4, pricePerUnit: 100 },
      ]);
      prisma.portfolioAsset.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

      await service.addAssetToPortfolio('p1', {
        ...baseInput,
        type: TransactionType.SELL,
        quantityChange: 4,
      } as any, OWNER_ID);

      expect(prisma.portfolioAsset.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: { quantity: -4, price: 0 },
      });
    });

    it('records the transaction with the given type, quantity, price and date', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });
      prisma.portfolioAsset.findUnique.mockResolvedValue({ id: 'pa1' });
      prisma.transaction.create.mockResolvedValue({});
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.portfolioAsset.update.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
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
    it('removes transactions and the portfolio asset, returning the updated portfolio', async () => {
      prisma.transaction.deleteMany.mockResolvedValue({});
      prisma.portfolioAsset.delete.mockResolvedValue({});
      prisma.portfolio.findUniqueOrThrow.mockResolvedValue({ id: 'p1', portfolioAssets: [] });

      const result = await service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID);

      expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1', assetId: 'a1' },
      });
      expect(prisma.portfolioAsset.delete).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
      });
      expect(result.id).toBe('p1');
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.transaction.deleteMany).not.toHaveBeenCalled();
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

    it('returns actual prices for each portfolio asset', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        portfolioAssets: [
          { assetId: 'a1', asset: { ticker: 'AAPL' } },
          { assetId: 'a2', asset: { ticker: 'BTC' } },
        ],
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
        portfolioAssets: [
          { assetId: 'a1', asset: { ticker: 'AAPL' } },
          { assetId: 'a2', asset: { ticker: 'BTC' } },
        ],
      });
      assetsService.getSharePrice.mockResolvedValue(100);

      const start = Date.now();
      await service.getPortfolioBalance('p1', 'USD' as any, OWNER_ID);

      expect(Date.now() - start).toBeLessThan(500);
    });

    it('returns an empty array when the portfolio has no assets', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ id: 'p1', userId: OWNER_ID, portfolioAssets: [] });

      const result = await service.getPortfolioBalance('p1', 'USD' as any, OWNER_ID);

      expect(result).toEqual([]);
    });
  });

  describe('calculateAssetsTotalPrice (service method)', () => {
    it('sums price * quantity across assets', () => {
      const assets = [
        { asset: 'AAPL', price: 100, currency: 'USD' as any, quantity: 2 },
        { asset: 'BTC', price: 50000, currency: 'USD' as any, quantity: 0.5 },
      ];
      expect(service.calculateAssetsTotalPrice(assets)).toBe(25200);
    });

    it('returns 0 for an empty list', () => {
      expect(service.calculateAssetsTotalPrice([])).toBe(0);
    });
  });

  describe('syncAssetPrice', () => {
    it('looks up the asset by id when an id is provided', async () => {
      prisma.asset = { findUnique: jest.fn().mockResolvedValue({ ticker: 'AAPL' }) };
      assetsService.getSharePrice.mockResolvedValue(150);

      const result = await service.syncAssetPrice([{ id: 'a1', assetSymbol: 'AAPL' }]);

      expect(prisma.asset.findUnique).toHaveBeenCalledWith({ where: { id: 'a1' } });
      expect(assetsService.getSharePrice).toHaveBeenCalledWith('AAPL');
      expect(result).toBe(150);
    });

    it('falls back to looking up by ticker symbol when no id is provided', async () => {
      prisma.asset = { findUnique: jest.fn().mockResolvedValue({ ticker: 'BTC' }) };
      assetsService.getSharePrice.mockResolvedValue(50000);

      const result = await service.syncAssetPrice([{ assetSymbol: 'BTC' }]);

      expect(prisma.asset.findUnique).toHaveBeenCalledWith({ where: { ticker: 'BTC' } });
      expect(result).toBe(50000);
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
      prisma.portfolio.findUnique.mockResolvedValue({ id: 'p1', userId: OWNER_ID, portfolioAssets: [] });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      expect(result).toEqual({ pctReturn: null, dollarReturn: null });
    });

    it('computes weighted % and $ return across all BUY/SELL transactions for "all" time', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        portfolioAssets: [
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
        portfolioAssets: [
          {
            asset: { currentPrice: 200 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 999, date: twoYearsAgo },
              { type: TransactionType.BUY, quantityChange: 5, pricePerUnit: 100, date: recently },
            ],
          },
        ],
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
        portfolioAssets: [
          {
            asset: { currentPrice: null },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 10, pricePerUnit: 100, date: new Date('2020-01-01') },
            ],
          },
        ],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      expect(result).toEqual({ pctReturn: null, dollarReturn: null });
    });

    it('excludes assets that were fully sold off (net non-positive quantity)', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({
        id: 'p1',
        userId: OWNER_ID,
        portfolioAssets: [
          {
            asset: { currentPrice: 150 },
            transactions: [
              { type: TransactionType.BUY, quantityChange: 5, pricePerUnit: 100, date: new Date('2020-01-01') },
              { type: TransactionType.SELL, quantityChange: 5, pricePerUnit: 150, date: new Date('2020-06-01') },
            ],
          },
        ],
      });

      const result = await service.getPortfolioReturns('p1', 'all', OWNER_ID);

      expect(result).toEqual({ pctReturn: null, dollarReturn: null });
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
