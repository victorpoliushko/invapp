import { RealEstateController } from './real-estate.controller';

describe('RealEstateController', () => {
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
    it('delegates to the service with the portfolio id', () => {
      controller.getByPortfolio('p1');

      expect(service.getByPortfolio).toHaveBeenCalledWith('p1');
    });
  });

  describe('create', () => {
    it('delegates to the service with the create dto', () => {
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

      controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('delegates to the service with the property id and update dto', () => {
      const dto = { rooms: 4, totalArea: 85 };

      controller.update('re-1', dto as any);

      expect(service.update).toHaveBeenCalledWith('re-1', dto);
    });
  });

  describe('delete', () => {
    it('delegates to the service with the property id', () => {
      controller.delete('re-1');

      expect(service.delete).toHaveBeenCalledWith('re-1');
    });
  });

  describe('createTransaction', () => {
    it('delegates to the service with the transaction dto', () => {
      const dto = { realEstateId: 're-1', startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 500 };

      controller.createTransaction(dto as any);

      expect(service.createTransaction).toHaveBeenCalledWith(dto);
    });
  });

  describe('addTransactionByCode', () => {
    it('delegates to the service with each field from the body', () => {
      const body = { portfolioId: 'p1', code: 'LVIV-01', startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 500 };

      controller.addTransactionByCode(body);

      expect(service.addTransactionByCode).toHaveBeenCalledWith('p1', 'LVIV-01', '2026-01-01', '2026-02-01', 500);
    });
  });

  describe('updateTransaction', () => {
    it('delegates to the service with the transaction id and data', () => {
      const data = { startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 600 };

      controller.updateTransaction('tx-1', data);

      expect(service.updateTransaction).toHaveBeenCalledWith('tx-1', data);
    });
  });

  describe('deleteTransaction', () => {
    it('delegates to the service with the transaction id', () => {
      controller.deleteTransaction('tx-1');

      expect(service.deleteTransaction).toHaveBeenCalledWith('tx-1');
    });
  });
});
