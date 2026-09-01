import { of, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { AssetsService } from './assets.service';

describe('AssetsService', () => {
  let configService: any;
  let httpService: any;
  let prisma: any;
  let service: AssetsService;

  beforeEach(() => {
    configService = { get: jest.fn().mockReturnValue('api-key') };
    httpService = { get: jest.fn() };
    prisma = {
      asset: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        createMany: jest.fn(),
      },
      $disconnect: jest.fn(),
    };

    service = new AssetsService(configService, httpService, prisma);
  });

  describe('getSharePrice', () => {
    it('returns the cached price when it was updated within the last hour', async () => {
      prisma.asset.findUnique.mockResolvedValue({
        currentPrice: 150,
        priceUpdatedAt: new Date(Date.now() - 5 * 60 * 1000),
        dataSource: 'ALPHA_VANTAGE',
      });

      const result = await service.getSharePrice('aapl');

      expect(result).toBe(150);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('delegates to the crypto price lookup for coingecko-sourced assets with a stale cache', async () => {
      prisma.asset.findUnique.mockResolvedValue({
        currentPrice: 100,
        priceUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dataSource: 'COINGECKO',
        coingeckoId: 'bitcoin',
      });
      httpService.get.mockReturnValue(of({ data: { bitcoin: { usd: 50000 } } }));

      const result = await service.getSharePrice('btc');

      expect(result).toBe(50000);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('bitcoin'),
        expect.anything(),
      );
    });

    it('fetches and stores a fresh price from Finnhub when the cache is stale', async () => {
      prisma.asset.findUnique.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: { c: 187.5 } }));

      const result = await service.getSharePrice('aapl');

      expect(result).toBe(187.5);
      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { ticker: 'AAPL' },
        data: { currentPrice: 187.5, priceUpdatedAt: expect.any(Date) },
      });
    });

    it('falls back to the existing cached price when the API response has no quote', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      prisma.asset.findUnique.mockResolvedValue({ currentPrice: 120, priceUpdatedAt: null });
      httpService.get.mockReturnValue(of({ data: { c: 0 } }));

      const result = await service.getSharePrice('aapl');

      expect(result).toBe(120);
      expect(prisma.asset.update).not.toHaveBeenCalled();
    });

    it('falls back to 0 when there is no cached price and the API returns no quote', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      prisma.asset.findUnique.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: {} }));

      const result = await service.getSharePrice('aapl');

      expect(result).toBe(0);
    });

    it('falls back to the existing cached price when the API call throws', async () => {
      prisma.asset.findUnique.mockResolvedValue({ currentPrice: 99, priceUpdatedAt: null });
      httpService.get.mockReturnValue(throwError(() => new Error('network error')));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getSharePrice('aapl');

      expect(result).toBe(99);
    });
  });

  describe('getCryptoPrice', () => {
    it('fetches and stores the price from CoinGecko', async () => {
      httpService.get.mockReturnValue(of({ data: { bitcoin: { usd: 60000 } } }));

      const result = await service.getCryptoPrice('bitcoin', 'btc');

      expect(result).toBe(60000);
      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { ticker: 'BTC' },
        data: { currentPrice: 60000, priceUpdatedAt: expect.any(Date) },
      });
    });

    it('returns 0 without updating when CoinGecko has no price for the id', async () => {
      httpService.get.mockReturnValue(of({ data: {} }));

      const result = await service.getCryptoPrice('unknown-coin', 'xyz');

      expect(result).toBe(0);
      expect(prisma.asset.update).not.toHaveBeenCalled();
    });

    it('falls back to the existing cached price when the CoinGecko call throws', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('network error')));
      prisma.asset.findUnique.mockResolvedValue({ currentPrice: 42 });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getCryptoPrice('bitcoin', 'btc');

      expect(result).toBe(42);
      expect(prisma.asset.findUnique).toHaveBeenCalledWith({ where: { ticker: 'BTC' } });
    });
  });

  describe('findAssetByName', () => {
    it('looks up the asset by ticker', async () => {
      prisma.asset.findFirst.mockResolvedValue({ ticker: 'AAPL' });

      const result = await service.findAssetByName('AAPL');

      expect(prisma.asset.findFirst).toHaveBeenCalledWith({ where: { ticker: 'AAPL' } });
      expect(result.ticker).toBe('AAPL');
    });
  });

  describe('getAssets', () => {
    it('paginates using the given limit and offset', async () => {
      prisma.asset.findMany.mockResolvedValue([{ ticker: 'AAPL' }]);

      const result = await service.getAssets({ limit: 10, offset: 20 } as any);

      expect(prisma.asset.findMany).toHaveBeenCalledWith({ take: 10, skip: 20 });
      expect(result).toHaveLength(1);
    });
  });

  describe('createAsset', () => {
    it('creates the asset with a generated id', async () => {
      prisma.asset.create.mockResolvedValue({ id: 'a1', ticker: 'AAPL' });

      const result = await service.createAsset({
        ticker: 'AAPL',
        name: 'Apple',
        type: 'STOCK' as any,
        exchange: 'NASDAQ',
        dataSource: 'ALPHA_VANTAGE' as any,
      } as any);

      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          ticker: 'AAPL',
          name: 'Apple',
          type: 'STOCK',
          exchange: 'NASDAQ',
          dataSource: 'ALPHA_VANTAGE',
          coingeckoId: undefined,
        },
      });
      expect(result.id).toBe('a1');
    });
  });

  describe('updateAsset', () => {
    it('updates by id when an id is provided', async () => {
      prisma.asset.update.mockResolvedValue({ id: 'a1' });

      await service.updateAsset({ id: 'a1', ticker: 'AAPL' } as any);

      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { id: 'a1', ticker: 'AAPL' },
      });
    });

    it('updates by ticker when no id is provided', async () => {
      prisma.asset.update.mockResolvedValue({ ticker: 'AAPL' });

      await service.updateAsset({ ticker: 'AAPL' } as any);

      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { ticker: 'AAPL' },
        data: { ticker: 'AAPL' },
      });
    });
  });

  describe('searchCrypto', () => {
    it('maps and caps results to the first 10 coins', async () => {
      const coins = Array.from({ length: 15 }, (_, i) => ({
        id: `coin-${i}`,
        symbol: `c${i}`,
        name: `Coin ${i}`,
        thumb: `thumb-${i}`,
      }));
      httpService.get.mockReturnValue(of({ data: { coins } }));

      const result = await service.searchCrypto('coin');

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ id: 'coin-0', symbol: 'C0', name: 'Coin 0', thumb: 'thumb-0' });
    });

    it('returns an empty array when there are no matching coins', async () => {
      httpService.get.mockReturnValue(of({ data: {} }));

      const result = await service.searchCrypto('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('findAssetInAPI', () => {
    it('maps Finnhub search results to the expected shape', async () => {
      httpService.get.mockReturnValue(
        of({
          data: {
            result: [
              { symbol: 'AAPL', description: 'Apple Inc', displaySymbol: 'AAPL', type: 'Common Stock' },
            ],
          },
        }),
      );

      const result = await service.findAssetInAPI('apple');

      expect(result).toEqual([{ assetSymbol: 'AAPL', name: 'Apple Inc' }]);
    });

    it('throws an InternalServerError HttpException when the API call fails', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('network error')));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.findAssetInAPI('apple')).rejects.toThrow(HttpException);
    });
  });
});
