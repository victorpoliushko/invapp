/// <reference types="jest" />
import { ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { FxService } from './fx.service';

const NBU = [
  { cc: 'USD', rate: 40, exchangedate: '01.11.2026' },
  { cc: 'EUR', rate: 44, exchangedate: '01.11.2026' },
];

describe('FxService', () => {
  let http: any;
  let service: FxService;

  beforeEach(() => {
    http = { get: jest.fn().mockReturnValue(of({ data: NBU })) };
    service = new FxService(http);
  });

  it('converts NBU UAH rates into units per 1 USD', async () => {
    const { base, date, rates } = await service.getRates();

    expect(base).toBe('USD');
    expect(date).toBe('01.11.2026');
    expect(rates.USD).toBe(1);
    expect(rates.UAH).toBe(40);
    expect(rates.EUR).toBeCloseTo(40 / 44);
  });

  it('caches rates between calls', async () => {
    await service.getRates();
    await service.getRates();

    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('converts amounts to USD', async () => {
    const toUsd = await service.toUsdConverter();

    expect(toUsd(400, 'UAH')).toBeCloseTo(10);
    expect(toUsd(10, 'eur')).toBeCloseTo(11);
    expect(toUsd(5, 'USD')).toBe(5);
  });

  it('throws for a currency NBU does not quote', async () => {
    const toUsd = await service.toUsdConverter();

    expect(() => toUsd(1, 'XYZ')).toThrow(ServiceUnavailableException);
  });

  it('throws when NBU is down and nothing is cached', async () => {
    http.get.mockReturnValue(throwError(() => new Error('down')));

    await expect(service.getRates()).rejects.toThrow(ServiceUnavailableException);
  });
});
