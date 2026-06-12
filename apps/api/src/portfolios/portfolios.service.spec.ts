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
    // (2*100 + 3*200) / 5 = 800 / 5 = 160
    expect(calculateAvgPrice(transactions)).toBe(160);
  });

  it('accounts for SELL transactions when computing avg', () => {
    const transactions = [
      { type: 'BUY' as const, quantityChange: 10, pricePerUnit: 50 },
      { type: 'SELL' as const, quantityChange: 5, pricePerUnit: 50 },
    ];
    // net qty=5, net cost=250 → avg=50
    expect(calculateAvgPrice(transactions)).toBe(50);
  });
});
