/// <reference types="jest" />
// Tests for pure helper logic extracted from PortfoliosService

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
