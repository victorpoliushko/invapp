import { BondsController } from './bonds.controller';

describe('BondsController', () => {
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
    it('delegates to the service with the portfolio id', () => {
      controller.getByPortfolio('p1');

      expect(service.getByPortfolio).toHaveBeenCalledWith('p1');
    });
  });

  describe('create', () => {
    it('delegates to the service with the request body', () => {
      const body = { name: 'US Treasury', portfolioId: 'p1' };

      controller.create(body);

      expect(service.create).toHaveBeenCalledWith(body);
    });
  });

  describe('update', () => {
    it('delegates to the service with the bond id and request body', () => {
      const body = { name: 'Updated Bond' };

      controller.update('b1', body);

      expect(service.update).toHaveBeenCalledWith('b1', body);
    });
  });

  describe('delete', () => {
    it('delegates to the service with the bond id', () => {
      controller.delete('b1');

      expect(service.delete).toHaveBeenCalledWith('b1');
    });
  });
});
