/// <reference types="jest" />
// Tests for pure bond calculation logic mirrored from BondRow.tsx

interface BondStub {
  faceValue: number;
  couponRate: number;
  quantity: number;
  purchasePrice: number;
}

function calcAnnualIncome(bond: BondStub): number {
  return bond.faceValue * (bond.couponRate / 100) * bond.quantity;
}

function calcTotalPosition(bond: BondStub): number {
  return bond.purchasePrice * bond.quantity;
}

describe('calcAnnualIncome', () => {
  it('computes coupon income across all units held', () => {
    const bond: BondStub = { faceValue: 1000, couponRate: 5, quantity: 10, purchasePrice: 980 };
    // 1000 * 0.05 * 10 = 500
    expect(calcAnnualIncome(bond)).toBe(500);
  });

  it('returns 0 when quantity is 0', () => {
    const bond: BondStub = { faceValue: 1000, couponRate: 5, quantity: 0, purchasePrice: 980 };
    expect(calcAnnualIncome(bond)).toBe(0);
  });

  it('returns 0 when coupon rate is 0', () => {
    const bond: BondStub = { faceValue: 1000, couponRate: 0, quantity: 10, purchasePrice: 980 };
    expect(calcAnnualIncome(bond)).toBe(0);
  });
});

describe('calcTotalPosition', () => {
  it('multiplies purchase price by quantity', () => {
    const bond: BondStub = { faceValue: 1000, couponRate: 5, quantity: 10, purchasePrice: 980 };
    expect(calcTotalPosition(bond)).toBe(9800);
  });

  it('returns 0 when quantity is 0', () => {
    const bond: BondStub = { faceValue: 1000, couponRate: 5, quantity: 0, purchasePrice: 980 };
    expect(calcTotalPosition(bond)).toBe(0);
  });
});
