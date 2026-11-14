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

const enc = (value: string) => `v1:aQ==:${Buffer.from(value).toString('base64')}`;

const FULL_INCLUDE = {
  stockPositions: { include: { asset: true, transactions: { orderBy: { date: 'desc' } } } },
  cryptoPositions: { include: { asset: true, transactions: { orderBy: { date: 'desc' } } } },
  bonds: { include: { transactions: { orderBy: { date: 'desc' } } } },
  realEstateAssets: { include: { transactions: { orderBy: { startDate: 'desc' } } } },
  mixedAssets: true,
  cash: true,
};

describe('PortfoliosService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let assetsService: any;
  let service: PortfoliosService;

  beforeEach(() => {
    prisma = {
      cash: { findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }), update: jest.fn(), create: jest.fn() },
      portfolio: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ id: 'p1', userId: OWNER_ID }),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      asset: { findUnique: jest.fn() },
      stockPosition: { upsert: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
      cryptoPosition: { upsert: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
      stockTransaction: { create: jest.fn(), deleteMany: jest.fn() },
      cryptoTransaction: { create: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn((arg) => (typeof arg === 'function' ? arg(prisma) : Promise.resolve(arg))),
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
    it('creates a portfolio with an encrypted goal', async () => {
      prisma.portfolio.create.mockResolvedValue({ id: 'p1', name: 'Retirement', userId: 'u1' });

      const result = await service.create({ name: 'Retirement', userId: 'u1', goal: enc('10') });

      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: { name: 'Retirement', userId: 'u1', goal: enc('10') },
        include: { user: true },
      });
      expect(result.id).toBe('p1');
    });

    it('rejects a plaintext goal', async () => {
      await expect(service.create({ name: 'Retirement', userId: 'u1', goal: '10' })).rejects.toThrow();
      expect(prisma.portfolio.create).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('fetches a portfolio with every holding the device needs', async () => {
      const result = await service.getById('p1', OWNER_ID);

      expect(prisma.portfolio.findUnique).toHaveBeenLastCalledWith({ where: { id: 'p1' }, include: FULL_INCLUDE });
      expect(result.id).toBe('p1');
    });

    it('throws NotFound when the portfolio does not exist', async () => {
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
        include: FULL_INCLUDE,
      });
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.update({ id: 'p1', name: 'New Name' } as any, OWNER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.portfolio.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes transactions, positions and the portfolio in one transaction', async () => {
      await service.delete('p1', OWNER_ID);

      expect(prisma.stockTransaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.cryptoTransaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.stockPosition.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.cryptoPosition.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
      expect(prisma.portfolio.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(5);
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.delete('p1', OWNER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.portfolio.delete).not.toHaveBeenCalled();
    });
  });

  describe('getByUserId', () => {
    it('returns all portfolios for a user with every holding', async () => {
      prisma.portfolio.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

      const result = await service.getByUserId('u1');

      expect(prisma.portfolio.findMany).toHaveBeenCalledWith({ where: { userId: 'u1' }, include: FULL_INCLUDE });
      expect(result).toHaveLength(2);
    });

    it('returns an empty array when the user has no portfolios', async () => {
      prisma.portfolio.findMany.mockResolvedValue([]);

      expect(await service.getByUserId('u1')).toEqual([]);
    });
  });

  describe('addAssetToPortfolio', () => {
    const baseInput = {
      assetName: 'AAPL',
      type: TransactionType.BUY,
      quantityChange: enc('10'),
      pricePerUnit: enc('100'),
      date: '2026-01-01',
      position: { quantity: enc('10'), price: enc('100') },
    };

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID)).rejects.toThrow(ForbiddenException);
      expect(assetsService.findAssetByName).not.toHaveBeenCalled();
    });

    it('rejects plaintext amounts before touching assets', async () => {
      await expect(
        service.addAssetToPortfolio('p1', { ...baseInput, quantityChange: '10' } as any, OWNER_ID),
      ).rejects.toThrow();
      expect(assetsService.findAssetByName).not.toHaveBeenCalled();
    });

    it('creates the asset when needed and stores the trade with the device-computed position', async () => {
      assetsService.findAssetByName.mockResolvedValue(null);
      assetsService.createAsset.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });

      await service.addAssetToPortfolio('p1', baseInput as any, OWNER_ID);

      expect(assetsService.createAsset).toHaveBeenCalledWith(expect.objectContaining({ ticker: 'AAPL' }));
      expect(prisma.stockPosition.upsert).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        create: { portfolioId: 'p1', assetId: 'a1', quantity: enc('10'), price: enc('100') },
        update: { quantity: enc('10'), price: enc('100') },
      });
      expect(prisma.stockTransaction.create).toHaveBeenCalledWith({
        data: {
          type: TransactionType.BUY,
          quantityChange: enc('10'),
          pricePerUnit: enc('100'),
          date: new Date('2026-01-01'),
          portfolioId: 'p1',
          assetId: 'a1',
        },
      });
    });

    it('looks the asset up by id when one is sent', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });

      await service.addAssetToPortfolio('p1', { ...baseInput, assetId: 'a1' } as any, OWNER_ID);

      expect(prisma.asset.findUnique).toHaveBeenCalledWith({ where: { id: 'a1' } });
      expect(assetsService.findAssetByName).not.toHaveBeenCalled();
    });

    it('routes crypto assets sourced from coingecko to the crypto tables', async () => {
      assetsService.findAssetByName.mockResolvedValue(null);
      assetsService.createAsset.mockResolvedValue({ id: 'a1', ticker: 'BTC', type: 'CRYPTOCURRENCY' });

      await service.addAssetToPortfolio('p1', { ...baseInput, assetName: 'BTC', coingeckoId: 'bitcoin' } as any, OWNER_ID);

      expect(assetsService.createAsset).toHaveBeenCalledWith({
        ticker: 'BTC',
        coingeckoId: 'bitcoin',
        type: 'CRYPTOCURRENCY',
        dataSource: 'COINGECKO',
      });
      expect(prisma.cryptoPosition.upsert).toHaveBeenCalled();
      expect(prisma.stockPosition.upsert).not.toHaveBeenCalled();
    });

    it('credits sale proceeds to the cash entry the device chose', async () => {
      assetsService.findAssetByName.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });

      await service.addAssetToPortfolio(
        'p1',
        { ...baseInput, type: TransactionType.SELL, cash: { id: 'cash-1', amount: enc('500') } } as any,
        OWNER_ID,
      );

      expect(prisma.cash.update).toHaveBeenCalledWith({ where: { id: 'cash-1' }, data: { amount: enc('500') } });
    });
  });

  describe('sellAllAsset', () => {
    it('removes the position and creates a new cash entry for the proceeds', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'Stock' });

      await service.sellAllAsset(
        'p1',
        'a1',
        { name: 'Digital cash', category: 'STOCK', currency: 'USD', amount: enc('1500') },
        OWNER_ID,
      );

      expect(prisma.stockTransaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1', assetId: 'a1' } });
      expect(prisma.stockPosition.delete).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
      });
      expect(prisma.cash.create).toHaveBeenCalledWith({
        data: { portfolioId: 'p1', category: 'STOCK', currency: 'USD', name: 'Digital cash', amount: enc('1500') },
      });
    });

    it('rejects a cash entry from another portfolio', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'Stock' });
      prisma.cash.findUnique.mockResolvedValue({ portfolioId: 'other' });

      await expect(
        service.sellAllAsset('p1', 'a1', { id: 'cash-x', amount: enc('1') }, OWNER_ID),
      ).rejects.toThrow();
      expect(prisma.cash.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteAsset', () => {
    it('removes transactions and the stock position', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'Stock' });

      const result = await service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID);

      expect(prisma.stockTransaction.deleteMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1', assetId: 'a1' } });
      expect(prisma.stockPosition.delete).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
      });
      expect(result.id).toBe('p1');
    });

    it('removes the crypto position when the asset is a cryptocurrency', async () => {
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', type: 'CRYPTOCURRENCY' });

      await service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID);

      expect(prisma.cryptoPosition.delete).toHaveBeenCalled();
      expect(prisma.stockTransaction.deleteMany).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      prisma.portfolio.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(service.deleteAsset('p1', { assetId: 'a1' } as any, OWNER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.stockTransaction.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('getPortfolioBalance', () => {
    it('throws NotFoundException when the portfolio does not exist', async () => {
      prisma.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.getPortfolioBalance('missing', 'USD' as any, OWNER_ID)).rejects.toThrow(NotFoundException);
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
  });
});

// ── pure helper tests (no service dependency) ───────────────────────────────

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
