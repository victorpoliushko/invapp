import { RealEstateController } from './real-estate.controller';

describe('RealEstateController', () => {
  const user = { id: 'u1' } as any;

  let service: any;
  let controller: RealEstateController;

  beforeEach(() => {
    service = {
      getByPortfolio: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createTransaction: jest.fn(),
      addTransactionByCode: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
    };

    controller = new RealEstateController(service);
  });

  describe('getByPortfolio', () => {
    it('delegates to the service with the portfolio id and authenticated user id', () => {
      controller.getByPortfolio('p1', user);

      expect(service.getByPortfolio).toHaveBeenCalledWith('p1', 'u1');
    });
  });

  describe('create', () => {
    it('delegates to the service with the create dto and authenticated user id', () => {
      const dto = {
        code: 'LVIV-01',
        name: 'City Apartment',
        type: 'APARTMENT',
        purchaseDate: '2026-01-01',
        purchasePrice: 150000,
        rooms: 3,
        totalArea: 72.5,
        portfolioId: 'p1',
      };

      controller.create(dto as any, user);

      expect(service.create).toHaveBeenCalledWith(dto, 'u1');
    });
  });

  describe('update', () => {
    it('delegates to the service with the property id, update dto and authenticated user id', () => {
      const dto = { rooms: 4, totalArea: 85 };

      controller.update('re-1', dto as any, user);

      expect(service.update).toHaveBeenCalledWith('re-1', dto, 'u1');
    });
  });

  describe('delete', () => {
    it('delegates to the service with the property id and authenticated user id', () => {
      controller.delete('re-1', user);

      expect(service.delete).toHaveBeenCalledWith('re-1', 'u1');
    });
  });

  describe('createTransaction', () => {
    it('delegates to the service with the transaction dto and authenticated user id', () => {
      const dto = { realEstateId: 're-1', startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 500 };

      controller.createTransaction(dto as any, user);

      expect(service.createTransaction).toHaveBeenCalledWith(dto, 'u1');
    });
  });

  describe('addTransactionByCode', () => {
    it('delegates to the service with each field from the body and authenticated user id', () => {
      const body = { portfolioId: 'p1', code: 'LVIV-01', startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 500 };

      controller.addTransactionByCode(body, user);

      expect(service.addTransactionByCode).toHaveBeenCalledWith('p1', 'LVIV-01', '2026-01-01', '2026-02-01', 500, 'u1');
    });
  });

  describe('updateTransaction', () => {
    it('delegates to the service with the transaction id, data and authenticated user id', () => {
      const data = { startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 600 };

      controller.updateTransaction('tx-1', data, user);

      expect(service.updateTransaction).toHaveBeenCalledWith('tx-1', data, 'u1');
    });
  });

  describe('deleteTransaction', () => {
    it('delegates to the service with the transaction id and authenticated user id', () => {
      controller.deleteTransaction('tx-1', user);

      expect(service.deleteTransaction).toHaveBeenCalledWith('tx-1', 'u1');
    });
  });
});
