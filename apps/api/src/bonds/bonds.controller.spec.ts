import { BondsController } from './bonds.controller';

describe('BondsController', () => {
  const user = { id: 'u1' } as any;

  let service: any;
  let controller: BondsController;

  beforeEach(() => {
    service = {
      getByPortfolio: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new BondsController(service);
  });

  describe('getByPortfolio', () => {
    it('delegates to the service with the portfolio id and authenticated user id', () => {
      controller.getByPortfolio('p1', user);

      expect(service.getByPortfolio).toHaveBeenCalledWith('p1', 'u1');
    });
  });

  describe('create', () => {
    it('delegates to the service with the request body and authenticated user id', () => {
      const body = { name: 'US Treasury', portfolioId: 'p1' };

      controller.create(body, user);

      expect(service.create).toHaveBeenCalledWith(body, 'u1');
    });
  });

  describe('update', () => {
    it('delegates to the service with the bond id, request body and authenticated user id', () => {
      const body = { name: 'Updated Bond' };

      controller.update('b1', body, user);

      expect(service.update).toHaveBeenCalledWith('b1', body, 'u1');
    });
  });

  describe('delete', () => {
    it('delegates to the service with the bond id and authenticated user id', () => {
      controller.delete('b1', user);

      expect(service.delete).toHaveBeenCalledWith('b1', 'u1');
    });
  });
});
