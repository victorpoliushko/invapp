/// <reference types="jest" />
import { computeLiquidity, mergeLiquiditySummaries, LiquidityPortfolioInput } from './liquidity.service';
import { STOCK_LIQUIDITY, BOND_LIQUIDITY, CRYPTO_LIQUIDITY, realEstateLiquidity } from './liquidity-reference';

function emptyPortfolio(): LiquidityPortfolioInput {
  return { stockPositions: [], cryptoPositions: [], bonds: [], realEstateAssets: [] };
}

describe('computeLiquidity', () => {
  it('values a stock position at currentPrice * quantity with the US range by default', () => {
    const portfolio = emptyPortfolio();
    portfolio.stockPositions = [{ asset: { currentPrice: 100, exchange: null }, price: 50, quantity: 10 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.stocks).toEqual({ amount: 1000, ...STOCK_LIQUIDITY.US });
  });

  it('classifies a recognized EU exchange into the EU range', () => {
    const portfolio = emptyPortfolio();
    portfolio.stockPositions = [{ asset: { currentPrice: 100, exchange: 'XETRA' }, price: 50, quantity: 1 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.stocks).toEqual({ amount: 100, ...STOCK_LIQUIDITY.EU });
  });

  it('falls back to the position price when the asset has no live currentPrice', () => {
    const portfolio = emptyPortfolio();
    portfolio.stockPositions = [{ asset: { currentPrice: null, exchange: null }, price: 20, quantity: 5 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.stocks.amount).toBe(100);
  });

  it('classifies a major-ticker crypto position into the MAJOR range', () => {
    const portfolio = emptyPortfolio();
    portfolio.cryptoPositions = [{ asset: { currentPrice: 50000, ticker: 'btc' }, price: 40000, quantity: 2 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.crypto).toEqual({ amount: 100000, ...CRYPTO_LIQUIDITY.MAJOR });
  });

  it('classifies an unrecognized ticker as LONG_TAIL', () => {
    const portfolio = emptyPortfolio();
    portfolio.cryptoPositions = [{ asset: { currentPrice: 1, ticker: 'SOMENICHECOIN' }, price: 1, quantity: 1000 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.crypto).toEqual({ amount: 1000, ...CRYPTO_LIQUIDITY.LONG_TAIL });
  });

  it('values a bond at currentValue * quantity, defaulting to investment-grade timing', () => {
    const portfolio = emptyPortfolio();
    portfolio.bonds = [{ currentValue: 105, purchasePrice: 100, quantity: 10 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.bonds).toEqual({ amount: 1050, ...BOND_LIQUIDITY.CORPORATE_INVESTMENT_GRADE });
  });

  it('falls back to purchasePrice when a bond has no currentValue override', () => {
    const portfolio = emptyPortfolio();
    portfolio.bonds = [{ currentValue: null, purchasePrice: 100, quantity: 3 }];

    const result = computeLiquidity(portfolio);

    expect(result.byType.bonds.amount).toBe(300);
  });

  it('gives real estate both a fast-sale headline range and a full-value alternative', () => {
    const portfolio = emptyPortfolio();
    portfolio.realEstateAssets = [{ currentValue: 100000, purchasePrice: 90000, type: 'APARTMENT' }];
    const expected = realEstateLiquidity('APARTMENT', 100000);

    const result = computeLiquidity(portfolio);

    expect(result.byType.realEstate).toEqual({ amount: 100000, ...expected.fast, full: { amount: 100000, ...expected.full } });
  });

  it('excludes mixed assets entirely (no field in the input shape)', () => {
    const result = computeLiquidity(emptyPortfolio());
    expect(result.byType).not.toHaveProperty('mixedAssets');
  });

  it('sums the liquid bucket across stocks, bonds, and crypto with a widened min/max range', () => {
    const portfolio = emptyPortfolio();
    portfolio.stockPositions = [{ asset: { currentPrice: 100, exchange: null }, price: 100, quantity: 1 }]; // US: 1-2
    portfolio.bonds = [{ currentValue: 100, purchasePrice: 100, quantity: 1 }]; // investment grade: 2-4
    portfolio.cryptoPositions = [{ asset: { currentPrice: 100, ticker: 'BTC' }, price: 100, quantity: 1 }]; // major: 0-1

    const result = computeLiquidity(portfolio);

    expect(result.liquid).toEqual({ amount: 300, minDays: 0, maxDays: 4 });
  });

  it('sets illiquid to the real estate full-value range, not the fast-sale range', () => {
    const portfolio = emptyPortfolio();
    portfolio.realEstateAssets = [{ currentValue: 100000, purchasePrice: 90000, type: 'APARTMENT' }];
    const expected = realEstateLiquidity('APARTMENT', 100000);

    const result = computeLiquidity(portfolio);

    expect(result.illiquid).toEqual({ amount: 100000, ...expected.full });
  });

  it('leaves a bucket at a zero-amount empty line when there are no holdings of that type', () => {
    const result = computeLiquidity(emptyPortfolio());
    expect(result.byType.stocks).toEqual({ amount: 0, minDays: 0, maxDays: 0 });
    expect(result.liquid).toEqual({ amount: 0, minDays: 0, maxDays: 0 });
  });
});

describe('mergeLiquiditySummaries', () => {
  it('sums amounts and widens ranges across multiple portfolios', () => {
    const a = computeLiquidity({
      ...emptyPortfolio(),
      stockPositions: [{ asset: { currentPrice: 100, exchange: null }, price: 100, quantity: 1 }], // US: 1-2
    });
    const b = computeLiquidity({
      ...emptyPortfolio(),
      stockPositions: [{ asset: { currentPrice: 100, exchange: 'XETRA' }, price: 100, quantity: 1 }], // EU: 2-3
    });

    const merged = mergeLiquiditySummaries([a, b]);

    expect(merged.byType.stocks).toEqual({ amount: 200, minDays: 1, maxDays: 3 });
  });

  it('returns an all-zero summary for an empty list of portfolios', () => {
    const merged = mergeLiquiditySummaries([]);
    expect(merged.liquid).toEqual({ amount: 0, minDays: 0, maxDays: 0 });
    expect(merged.illiquid).toEqual({ amount: 0, minDays: 0, maxDays: 0 });
  });
});
