import { AssetsController } from './assets.controller';

describe('AssetsController', () => {
  let service: any;
  let controller: AssetsController;

  beforeEach(() => {
    service = {
      testFinnhub: jest.fn(),
      getSharePrice: jest.fn(),
      getAssets: jest.fn(),
      fetchAndStoreAssets: jest.fn(),
      findAssetInAPI: jest.fn(),
      searchCrypto: jest.fn(),
    };

    controller = new AssetsController(service);
  });

  describe('testFinhub', () => {
    it('delegates to the service with the symbol', async () => {
      service.testFinnhub.mockResolvedValue({ c: 150 });

      const result = await controller.testFinhub('AAPL');

      expect(service.testFinnhub).toHaveBeenCalledWith('AAPL');
      expect(result).toEqual({ c: 150 });
    });
  });

  describe('getSharePrice', () => {
    it('wraps the price in a { price } object', async () => {
      service.getSharePrice.mockResolvedValue(187.5);

      const result = await controller.getSharePrice('AAPL');

      expect(service.getSharePrice).toHaveBeenCalledWith('AAPL');
      expect(result).toEqual({ price: 187.5 });
    });
  });

  describe('getAllAssets', () => {
    it('delegates to the service with the pagination dto', async () => {
      service.getAssets.mockResolvedValue([{ ticker: 'AAPL' }]);

      const result = await controller.getAllAssets({ limit: 10, offset: 0 } as any);

      expect(service.getAssets).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toEqual([{ ticker: 'AAPL' }]);
    });
  });

  describe('getAndStoreAssets', () => {
    it('delegates to the service', async () => {
      service.fetchAndStoreAssets.mockResolvedValue(undefined);

      await controller.getAndStoreAssets();

      expect(service.fetchAndStoreAssets).toHaveBeenCalled();
    });
  });

  describe('searchAsset', () => {
    it('delegates to the service with the query', () => {
      controller.searchAsset('apple');

      expect(service.findAssetInAPI).toHaveBeenCalledWith('apple');
    });
  });

  describe('searchCrypto', () => {
    it('delegates to the service with the query', () => {
      controller.searchCrypto('bitcoin');

      expect(service.searchCrypto).toHaveBeenCalledWith('bitcoin');
    });
  });
});
