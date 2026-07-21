import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  let service: any;
  let controller: TransactionsController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new TransactionsController(service);
  });

  describe('addTransaction', () => {
    it('delegates to the service with the create dto', () => {
      const dto = {
        assetName: 'AAPL',
        portfolioId: 'p1',
        type: 'BUY',
        quantityChange: 10,
        pricePerUnit: 100,
        date: '2026-01-01',
      };

      controller.addTransaction(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateTransaction', () => {
    it('delegates to the service with the transaction id and full payload', () => {
      const data = { id: 'tx-1', date: '2026-01-01', quantityChange: 5, pricePerUnit: 150 };

      controller.updateTransaction(data);

      expect(service.update).toHaveBeenCalledWith('tx-1', data);
    });
  });

  describe('removeTransaction', () => {
    it('delegates to the service with the transaction id', () => {
      controller.removeTransaction({ id: 'tx-1' });

      expect(service.delete).toHaveBeenCalledWith('tx-1');
    });
  });
});
