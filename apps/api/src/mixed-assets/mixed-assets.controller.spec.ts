import { MixedAssetsController } from './mixed-assets.controller';

describe('MixedAssetsController', () => {
  const user = { id: 'u1' } as any;

  let service: any;
  let controller: MixedAssetsController;

  beforeEach(() => {
    service = {
      getByPortfolio: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new MixedAssetsController(service);
  });

  describe('getByPortfolio', () => {
    it('delegates to the service with the portfolio id and authenticated user id', () => {
      controller.getByPortfolio('p1', user);

      expect(service.getByPortfolio).toHaveBeenCalledWith('p1', 'u1');
    });
  });

  describe('create', () => {
    it('delegates to the service with the request body and authenticated user id', () => {
      const body = { name: 'Vintage Watch', portfolioId: 'p1' };

      controller.create(body, user);

      expect(service.create).toHaveBeenCalledWith(body, 'u1');
    });
  });

  describe('update', () => {
    it('delegates to the service with the mixed asset id, request body and authenticated user id', () => {
      const body = { name: 'Updated Asset' };

      controller.update('a1', body, user);

      expect(service.update).toHaveBeenCalledWith('a1', body, 'u1');
    });
  });

  describe('delete', () => {
    it('delegates to the service with the mixed asset id and authenticated user id', () => {
      controller.delete('a1', user);

      expect(service.delete).toHaveBeenCalledWith('a1', 'u1');
    });
  });
});
