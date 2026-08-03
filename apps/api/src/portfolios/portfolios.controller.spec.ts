import { ForbiddenException, HttpException } from '@nestjs/common';
import { PortfoliosController } from './portfolios.controller';

describe('PortfoliosController', () => {
  const user = { id: 'u1' } as any;

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

      const result = await controller.createPortfolio(dto as any, user);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'p1', ...dto });
    });

    it('throws Forbidden when the dto userId does not match the authenticated user', () => {
      const dto = { userId: 'someone-else', name: 'Retirement' };

      expect(() => controller.createPortfolio(dto as any, user)).toThrow(HttpException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('updatePortfolio', () => {
    it('delegates to the service with the update dto and authenticated user id', () => {
      const dto = { id: 'p1', name: 'New Name' };
      controller.updatePortfolio('p1', dto as any, user);

      expect(service.update).toHaveBeenCalledWith(dto, 'u1');
    });
  });

  describe('deletePortfolio', () => {
    it('delegates to the service with the portfolio id and authenticated user id', () => {
      controller.deletePortfolio('p1', user);

      expect(service.delete).toHaveBeenCalledWith('p1', 'u1');
    });
  });

  describe('getPortfolio', () => {
    it('delegates to the service with the portfolio id and authenticated user id', () => {
      controller.getPortfolio('p1', user);

      expect(service.getById).toHaveBeenCalledWith('p1', 'u1');
    });
  });

  describe('getPortfoliosByUserId', () => {
    it('delegates to the service when the requested user id matches the authenticated user', () => {
      controller.getPortfoliosByUserId('u1', user);

      expect(service.getByUserId).toHaveBeenCalledWith('u1');
    });

    it('throws Forbidden when requesting another user\'s portfolios', () => {
      expect(() => controller.getPortfoliosByUserId('someone-else', user)).toThrow(ForbiddenException);
      expect(service.getByUserId).not.toHaveBeenCalled();
    });
  });

  describe('addAssetToPortfolio', () => {
    it('delegates to the service with the portfolio id, dto and authenticated user id', () => {
      const dto = { assetName: 'AAPL', quantityChange: 1, pricePerUnit: 100, date: '2026-01-01', type: 'BUY' };
      controller.addAssetToPortfolio('p1', dto as any, user);

      expect(service.addAssetToPortfolio).toHaveBeenCalledWith('p1', dto, 'u1');
    });
  });

  describe('deleteAsset', () => {
    it('delegates to the service with the portfolio id, dto and authenticated user id', () => {
      const dto = { assetId: 'a1' };
      controller.deleteAsset('p1', dto as any, user);

      expect(service.deleteAsset).toHaveBeenCalledWith('p1', dto, 'u1');
    });
  });

  describe('getBalance', () => {
    it('delegates to the service with the portfolio id, currency and authenticated user id', () => {
      controller.getBalance('p1', 'USD' as any, user);

      expect(service.getPortfolioBalance).toHaveBeenCalledWith('p1', 'USD', 'u1');
    });
  });

  describe('getReturns', () => {
    it('defaults to the "all" period when none is provided', () => {
      controller.getReturns('p1', undefined as any, user);

      expect(service.getPortfolioReturns).toHaveBeenCalledWith('p1', 'all', 'u1');
    });

    it('passes through an explicit period', () => {
      controller.getReturns('p1', 'year', user);

      expect(service.getPortfolioReturns).toHaveBeenCalledWith('p1', 'year', 'u1');
    });
  });
});
