/// <reference types="jest" />
import { RealEstateService } from './real-estate.service';

describe('RealEstateService', () => {
  let prisma: any;
  let service: RealEstateService;

  beforeEach(() => {
    prisma = {
      realEstate: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
      realEstateTransaction: { create: jest.fn() },
    };
    service = new RealEstateService(prisma);
  });

  describe('addTransactionByCode', () => {
    it('attaches the transaction to an existing property when the code already exists', async () => {
      prisma.realEstate.findFirst.mockResolvedValue({ id: 're-1', code: 'LVIV-01' });

      await service.addTransactionByCode('p1', 'LVIV-01', '2026-01-01', '2026-02-01', 500);

      expect(prisma.realEstate.create).not.toHaveBeenCalled();
      expect(prisma.realEstateTransaction.create).toHaveBeenCalledWith({
        data: {
          realEstateId: 're-1',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-02-01'),
          monthlyRent: 500,
        },
      });
    });

    it('creates a placeholder property when the code does not exist yet', async () => {
      prisma.realEstate.findFirst.mockResolvedValue(null);
      prisma.realEstate.create.mockResolvedValue({ id: 're-new', code: 'NEW-01' });

      await service.addTransactionByCode('p1', 'NEW-01', '2026-01-01', '2026-02-01', 750);

      expect(prisma.realEstate.create).toHaveBeenCalledWith({
        data: {
          code: 'NEW-01',
          name: 'NEW-01',
          type: 'APARTMENT',
          purchaseDate: expect.any(Date),
          purchasePrice: 0,
          portfolioId: 'p1',
        },
      });
      expect(prisma.realEstateTransaction.create).toHaveBeenCalledWith({
        data: {
          realEstateId: 're-new',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-02-01'),
          monthlyRent: 750,
        },
      });
    });

    it('coerces a string monthlyRent to a number', async () => {
      prisma.realEstate.findFirst.mockResolvedValue({ id: 're-1', code: 'LVIV-01' });

      await service.addTransactionByCode('p1', 'LVIV-01', '2026-01-01', '2026-02-01', '500' as any);

      expect(prisma.realEstateTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ monthlyRent: 500 }) }),
      );
    });
  });

  describe('getByPortfolio', () => {
    it('scopes the query to the given portfolio and orders transactions by start date desc', async () => {
      await service.getByPortfolio('p1');
      expect(prisma.realEstate.findMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1' },
        include: { transactions: { orderBy: { startDate: 'desc' } } },
      });
    });
  });

  describe('delete', () => {
    it('deletes the property by id', async () => {
      await service.delete('re-1');
      expect(prisma.realEstate.delete).toHaveBeenCalledWith({ where: { id: 're-1' } });
    });
  });
});
