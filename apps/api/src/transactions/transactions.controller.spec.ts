import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  const user = { id: 'u1' } as any;

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
    it('delegates to the service with the create dto and authenticated user id', () => {
      const dto = {
        assetName: 'AAPL',
        portfolioId: 'p1',
        type: 'BUY',
        quantityChange: 'v1:aQ==:cQ==',
        pricePerUnit: 'v1:aQ==:cA==',
        date: '2026-01-01',
      };

      controller.addTransaction(dto as any, user);

      expect(service.create).toHaveBeenCalledWith(dto, 'u1');
    });
  });

  describe('updateTransaction', () => {
    it('delegates to the service with the transaction id, full payload and authenticated user id', () => {
      const position = { quantity: 'v1:aQ==:cQ==', price: 'v1:aQ==:cA==' };
      const data = { id: 'tx-1', date: '2026-01-01', quantityChange: 'v1:aQ==:cQ==', pricePerUnit: 'v1:aQ==:cA==', position };

      controller.updateTransaction(data, user);

      expect(service.update).toHaveBeenCalledWith('tx-1', data, 'u1');
    });
  });

  describe('removeTransaction', () => {
    it('delegates to the service with the transaction id and authenticated user id', () => {
      const position = { quantity: 'v1:aQ==:cQ==', price: 'v1:aQ==:cA==' };
      controller.removeTransaction({ id: 'tx-1', position }, user);
      expect(service.delete).toHaveBeenCalledWith('tx-1', position, 'u1');
    });
  });
});
