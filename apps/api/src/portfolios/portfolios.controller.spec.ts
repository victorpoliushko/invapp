import { HttpException } from '@nestjs/common';
import { PortfoliosController } from './portfolios.controller';

describe('PortfoliosController', () => {
  let service: any;
  let controller: PortfoliosController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getById: jest.fn(),
      getByUserId: jest.fn(),
      addAssetToPortfolio: jest.fn(),
      deleteAsset: jest.fn(),
      getPortfolioBalance: jest.fn(),
      getPortfolioReturns: jest.fn(),
    };

    controller = new PortfoliosController(service);
  });

  describe('createPortfolio', () => {
    it('creates the portfolio when the dto userId matches the authenticated user', async () => {
      const dto = { userId: 'u1', name: 'Retirement' };
      service.create.mockResolvedValue({ id: 'p1', ...dto });

      const result = await controller.createPortfolio(dto as any, { id: 'u1' } as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'p1', ...dto });
    });

    it('throws Forbidden when the dto userId does not match the authenticated user', () => {
      const dto = { userId: 'someone-else', name: 'Retirement' };

      expect(() => controller.createPortfolio(dto as any, { id: 'u1' } as any)).toThrow(
        HttpException,
      );
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('updatePortfolio', () => {
    it('delegates to the service with the update dto', () => {
      const dto = { id: 'p1', name: 'New Name' };
      controller.updatePortfolio('p1', dto as any);

      expect(service.update).toHaveBeenCalledWith(dto);
    });
  });

  describe('deletePortfolio', () => {
    it('delegates to the service with the portfolio id', () => {
      controller.deletePortfolio('p1');

      expect(service.delete).toHaveBeenCalledWith('p1');
    });
  });

  describe('getPortfolio', () => {
    it('delegates to the service with the portfolio id', () => {
      controller.getPortfolio('p1');

      expect(service.getById).toHaveBeenCalledWith('p1');
    });
  });

  describe('getPortfoliosByUserId', () => {
    it('delegates to the service with the user id', () => {
      controller.getPortfoliosByUserId('u1');

      expect(service.getByUserId).toHaveBeenCalledWith('u1');
    });
  });

  describe('addAssetToPortfolio', () => {
    it('delegates to the service with the portfolio id and dto', () => {
      const dto = { assetName: 'AAPL', quantityChange: 1, pricePerUnit: 100, date: '2026-01-01', type: 'BUY' };
      controller.addAssetToPortfolio('p1', dto as any);

      expect(service.addAssetToPortfolio).toHaveBeenCalledWith('p1', dto);
    });
  });

  describe('deleteAsset', () => {
    it('delegates to the service with the portfolio id and dto', () => {
      const dto = { assetId: 'a1' };
      controller.deleteAsset('p1', dto as any);

      expect(service.deleteAsset).toHaveBeenCalledWith('p1', dto);
    });
  });

  describe('getBalance', () => {
    it('delegates to the service with the portfolio id and currency', () => {
      controller.getBalance('p1', 'USD' as any);

      expect(service.getPortfolioBalance).toHaveBeenCalledWith('p1', 'USD');
    });
  });

  describe('getReturns', () => {
    it('defaults to the "all" period when none is provided', () => {
      controller.getReturns('p1', undefined as any);

      expect(service.getPortfolioReturns).toHaveBeenCalledWith('p1', 'all');
    });

    it('passes through an explicit period', () => {
      controller.getReturns('p1', 'year');

      expect(service.getPortfolioReturns).toHaveBeenCalledWith('p1', 'year');
    });
  });
});
