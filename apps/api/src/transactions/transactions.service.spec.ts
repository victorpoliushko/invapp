/// <reference types="jest" />
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

const QTY = 'v1:aQ==:cQ==';
const PRICE = 'v1:aQ==:cA==';
const POSITION = { quantity: 'v1:aQ==:UQ==', price: 'v1:aQ==:UA==' };

describe('TransactionsService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let portfoliosService: any;
  let service: TransactionsService;
  let trx: any;

  beforeEach(() => {
    trx = {
      stockTransaction: {
        update: jest.fn().mockResolvedValue({ assetId: 'a1' }),
        delete: jest.fn().mockResolvedValue({ assetId: 'a1' }),
      },
      cryptoTransaction: {
        update: jest.fn().mockResolvedValue({ assetId: 'a1' }),
        delete: jest.fn().mockResolvedValue({ assetId: 'a1' }),
      },
      stockPosition: { update: jest.fn() },
      cryptoPosition: { update: jest.fn() },
    };

    prisma = {
      stockTransaction: { findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }) },
      cryptoTransaction: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((cb) => cb(trx)),
    };

    portfoliosService = { addAssetToPortfolio: jest.fn(), assertOwnership: jest.fn() };
    service = new TransactionsService(prisma, portfoliosService);
  });

  describe('update', () => {
    it('stores the edited trade and the position the device recomputed', async () => {
      await service.update('tx-1', { date: '2026-01-01', quantityChange: QTY, pricePerUnit: PRICE, position: POSITION }, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(trx.stockTransaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: { date: new Date('2026-01-01'), quantityChange: QTY, pricePerUnit: PRICE },
      });
      expect(trx.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: POSITION,
      });
    });

    it('routes to the crypto tables when the transaction is a crypto transaction', async () => {
      prisma.stockTransaction.findUnique.mockResolvedValue(null);
      prisma.cryptoTransaction.findUnique.mockResolvedValue({ portfolioId: 'p1' });

      await service.update('tx-1', { date: '2026-01-01', quantityChange: QTY, pricePerUnit: PRICE, position: POSITION }, OWNER_ID);

      expect(trx.cryptoPosition.update).toHaveBeenCalled();
      expect(trx.stockPosition.update).not.toHaveBeenCalled();
    });

    it('rejects plaintext amounts', async () => {
      await expect(
        service.update('tx-1', { date: '2026-01-01', quantityChange: '2', pricePerUnit: PRICE, position: POSITION }, OWNER_ID),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws NotFound when the transaction does not exist in either table', async () => {
      prisma.stockTransaction.findUnique.mockResolvedValue(null);
      await expect(
        service.update('missing', { date: '2026-01-01', quantityChange: QTY, pricePerUnit: PRICE, position: POSITION }, OWNER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());
      await expect(
        service.update('tx-1', { date: '2026-01-01', quantityChange: QTY, pricePerUnit: PRICE, position: POSITION }, OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the trade and stores the recomputed position', async () => {
      await service.delete('tx-1', POSITION, OWNER_ID);

      expect(trx.stockTransaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-1' } });
      expect(trx.stockPosition.update).toHaveBeenCalledWith({
        where: { portfolioId_assetId: { portfolioId: 'p1', assetId: 'a1' } },
        data: POSITION,
      });
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());
      await expect(service.delete('tx-1', POSITION, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('delegates to the portfolio service, which checks ownership', async () => {
      const input = { assetName: 'AAPL', portfolioId: 'p1', type: 'BUY', quantityChange: QTY, pricePerUnit: PRICE, date: '2026-01-01', position: POSITION } as any;
      await service.create(input, OWNER_ID);
      expect(portfoliosService.addAssetToPortfolio).toHaveBeenCalledWith('p1', input, OWNER_ID);
    });
  });
});
