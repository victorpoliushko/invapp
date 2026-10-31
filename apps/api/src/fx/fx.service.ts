import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

const NBU_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

type NbuRate = { cc: string; rate: number; exchangedate: string };

export type FxRates = {
  base: 'USD';
  date: string;
  rates: Record<string, number>;
};

export type ToUsd = (amount: number, currency: string) => number;

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private cache: { value: FxRates; fetchedAt: number } | null = null;

  constructor(private readonly http: HttpService) {}

  async getRates(): Promise<FxRates> {
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_TTL_MS) return this.cache.value;

    try {
      const { data } = await lastValueFrom(this.http.get<NbuRate[]>(NBU_URL));
      const value = toUsdBase(data);
      this.cache = { value, fetchedAt: Date.now() };
      return value;
    } catch (error) {
      this.logger.warn(`NBU rates fetch failed: ${error.message}`);
      if (this.cache) return this.cache.value;
      throw new ServiceUnavailableException('Exchange rates are unavailable');
    }
  }

  async toUsdConverter(): Promise<ToUsd> {
    const { rates } = await this.getRates();
    return (amount, currency) => {
      const perUsd = rates[currency.toUpperCase()];
      if (!perUsd) throw new ServiceUnavailableException(`No exchange rate for ${currency}`);
      return amount / perUsd;
    };
  }
}

function toUsdBase(nbu: NbuRate[]): FxRates {
  const uahPerUnit: Record<string, number> = { UAH: 1 };
  for (const r of nbu) uahPerUnit[r.cc] = r.rate;

  const uahPerUsd = uahPerUnit.USD;
  if (!uahPerUsd) throw new Error('NBU response has no USD rate');

  const rates: Record<string, number> = {};
  for (const [cc, uah] of Object.entries(uahPerUnit)) rates[cc] = uahPerUsd / uah;

  const date = nbu.find((r) => r.cc === 'USD')?.exchangedate ?? '';
  return { base: 'USD', date, rates };
}
