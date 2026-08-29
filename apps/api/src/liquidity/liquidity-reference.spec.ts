/// <reference types="jest" />
import {
  realEstatePriceTier,
  realEstateLiquidity,
  REAL_ESTATE_PRICE_TIERS,
} from './liquidity-reference';

describe('realEstatePriceTier', () => {
  it('classifies a price at or below the LOW ceiling as LOW', () => {
    expect(realEstatePriceTier(0)).toBe('LOW');
    expect(realEstatePriceTier(REAL_ESTATE_PRICE_TIERS.LOW)).toBe('LOW');
  });

  it('classifies a price just above the LOW ceiling as MID', () => {
    expect(realEstatePriceTier(REAL_ESTATE_PRICE_TIERS.LOW + 1)).toBe('MID');
    expect(realEstatePriceTier(REAL_ESTATE_PRICE_TIERS.MID)).toBe('MID');
  });

  it('classifies a price above the MID ceiling as HIGH', () => {
    expect(realEstatePriceTier(REAL_ESTATE_PRICE_TIERS.MID + 1)).toBe('HIGH');
    expect(realEstatePriceTier(10_000_000)).toBe('HIGH');
  });
});

describe('realEstateLiquidity', () => {
  it('returns a fast/full day range for the matching type and tier', () => {
    const result = realEstateLiquidity('APARTMENT', 100_000);
    expect(result.fast).toEqual({ minDays: 14, maxDays: 21 });
    expect(result.full).toEqual({ minDays: 30, maxDays: 60 });
  });

  it('commercial properties always take at least as long as apartments in the same tier', () => {
    const apartment = realEstateLiquidity('APARTMENT', 300_000);
    const commercial = realEstateLiquidity('COMMERCIAL', 300_000);
    expect(commercial.full.minDays).toBeGreaterThan(apartment.full.minDays);
  });

  it('a full-value sale always takes at least as long as a fast sale', () => {
    (['APARTMENT', 'HOUSE', 'COMMERCIAL'] as const).forEach((type) => {
      (['LOW', 'MID', 'HIGH'] as const).forEach((tier) => {
        const price =
          tier === 'HIGH' ? 1_000_000 : REAL_ESTATE_PRICE_TIERS[tier];
        const { fast, full } = realEstateLiquidity(type, price);
        expect(full.minDays).toBeGreaterThanOrEqual(fast.minDays);
        expect(full.maxDays).toBeGreaterThanOrEqual(fast.maxDays);
      });
    });
  });
});
