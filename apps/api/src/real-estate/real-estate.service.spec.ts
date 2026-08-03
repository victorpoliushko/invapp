/// <reference types="jest" />
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RealEstateService } from './real-estate.service';

describe('RealEstateService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let portfoliosService: any;
  let service: RealEstateService;

  beforeEach(() => {
    prisma = {
      realEstate: {
        findFirst: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      realEstateTransaction: {
        findUnique: jest.fn().mockResolvedValue({ realEstate: { portfolioId: 'p1' } }),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    portfoliosService = { assertOwnership: jest.fn() };
    service = new RealEstateService(prisma, portfoliosService);
  });

  describe('addTransactionByCode', () => {
    it('attaches the transaction to an existing property when the code already exists', async () => {
      prisma.realEstate.findFirst.mockResolvedValue({ id: 're-1', code: 'LVIV-01' });

      await service.addTransactionByCode('p1', 'LVIV-01', '2026-01-01', '2026-02-01', 500, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
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

      await service.addTransactionByCode('p1', 'NEW-01', '2026-01-01', '2026-02-01', 750, OWNER_ID);

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

      await service.addTransactionByCode('p1', 'LVIV-01', '2026-01-01', '2026-02-01', '500' as any, OWNER_ID);

      expect(prisma.realEstateTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ monthlyRent: 500 }) }),
      );
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.addTransactionByCode('p1', 'LVIV-01', '2026-01-01', '2026-02-01', 500, OWNER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.realEstate.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('persists rooms and totalArea alongside the other fields', async () => {
      prisma.realEstate.create.mockResolvedValue({ id: 're-1' });

      await service.create({
        code: 'LVIV-01',
        name: 'City Apartment',
        type: 'APARTMENT' as any,
        purchaseDate: '2026-01-01',
        purchasePrice: 150000,
        rooms: 3,
        totalArea: 72.5,
        portfolioId: 'p1',
      }, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.realEstate.create).toHaveBeenCalledWith({
        data: {
          code: 'LVIV-01',
          name: 'City Apartment',
          type: 'APARTMENT',
          purchaseDate: new Date('2026-01-01'),
          purchasePrice: 150000,
          rooms: 3,
          totalArea: 72.5,
          portfolioId: 'p1',
        },
        include: { transactions: true },
      });
    });

    it('persists undefined rooms and totalArea when not provided', async () => {
      prisma.realEstate.create.mockResolvedValue({ id: 're-1' });

      await service.create({
        code: 'LVIV-02',
        name: 'Studio',
        type: 'APARTMENT' as any,
        purchaseDate: '2026-01-01',
        purchasePrice: 90000,
        portfolioId: 'p1',
      }, OWNER_ID);

      expect(prisma.realEstate.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ rooms: undefined, totalArea: undefined }) }),
      );
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.create({
          code: 'LVIV-01',
          name: 'City Apartment',
          type: 'APARTMENT' as any,
          purchaseDate: '2026-01-01',
          purchasePrice: 150000,
          portfolioId: 'p1',
        }, OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.realEstate.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates the provided fields, converting purchaseDate to a Date', async () => {
      prisma.realEstate.update.mockResolvedValue({ id: 're-1' });

      await service.update('re-1', {
        code: 'LVIV-01',
        name: 'Renovated Apartment',
        type: 'APARTMENT' as any,
        purchaseDate: '2026-02-01',
        purchasePrice: 160000,
        rooms: 4,
        totalArea: 80,
      }, OWNER_ID);

      expect(prisma.realEstate.findUnique).toHaveBeenCalledWith({
        where: { id: 're-1' },
        select: { portfolioId: true },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.realEstate.update).toHaveBeenCalledWith({
        where: { id: 're-1' },
        data: {
          code: 'LVIV-01',
          name: 'Renovated Apartment',
          type: 'APARTMENT',
          purchaseDate: new Date('2026-02-01'),
          purchasePrice: 160000,
          rooms: 4,
          totalArea: 80,
        },
        include: { transactions: true },
      });
    });

    it('omits purchaseDate from the update when not provided', async () => {
      prisma.realEstate.update.mockResolvedValue({ id: 're-1' });

      await service.update('re-1', { rooms: 2 }, OWNER_ID);

      expect(prisma.realEstate.update).toHaveBeenCalledWith({
        where: { id: 're-1' },
        data: {
          code: undefined,
          name: undefined,
          type: undefined,
          purchasePrice: undefined,
          rooms: 2,
          totalArea: undefined,
        },
        include: { transactions: true },
      });
    });

    it('throws NotFound when the property does not exist', async () => {
      prisma.realEstate.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { rooms: 2 }, OWNER_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.realEstate.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.update('re-1', { rooms: 2 }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.realEstate.update).not.toHaveBeenCalled();
    });
  });

  describe('getByPortfolio', () => {
    it('scopes the query to the given portfolio and orders transactions by start date desc', async () => {
      await service.getByPortfolio('p1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.realEstate.findMany).toHaveBeenCalledWith({
        where: { portfolioId: 'p1' },
        include: { transactions: { orderBy: { startDate: 'desc' } } },
      });
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.getByPortfolio('p1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.realEstate.findMany).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the property by id', async () => {
      await service.delete('re-1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.realEstate.delete).toHaveBeenCalledWith({ where: { id: 're-1' } });
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.delete('re-1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.realEstate.delete).not.toHaveBeenCalled();
    });
  });

  describe('createTransaction', () => {
    it('creates the transaction after verifying ownership via the property', async () => {
      await service.createTransaction(
        { realEstateId: 're-1', startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 500 } as any,
        OWNER_ID,
      );

      expect(prisma.realEstate.findUnique).toHaveBeenCalledWith({
        where: { id: 're-1' },
        select: { portfolioId: true },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.realEstateTransaction.create).toHaveBeenCalledWith({
        data: {
          realEstateId: 're-1',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-02-01'),
          monthlyRent: 500,
        },
      });
    });
  });

  describe('updateTransaction', () => {
    it('updates the transaction after verifying ownership via the parent property', async () => {
      await service.updateTransaction(
        'tx-1',
        { startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 600 },
        OWNER_ID,
      );

      expect(prisma.realEstateTransaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        select: { realEstate: { select: { portfolioId: true } } },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
    });

    it('throws NotFound when the transaction does not exist', async () => {
      prisma.realEstateTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTransaction('missing', { startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 600 }, OWNER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(
        service.updateTransaction('tx-1', { startDate: '2026-01-01', endDate: '2026-02-01', monthlyRent: 600 }, OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTransaction', () => {
    it('deletes the transaction after verifying ownership via the parent property', async () => {
      await service.deleteTransaction('tx-1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.realEstateTransaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-1' } });
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.deleteTransaction('tx-1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.realEstateTransaction.delete).not.toHaveBeenCalled();
    });
  });
});
