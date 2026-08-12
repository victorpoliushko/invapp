/// <reference types="jest" />
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';

describe('MixedAssetsService', () => {
  const OWNER_ID = 'u1';
  const OTHER_USER_ID = 'u2';

  let prisma: any;
  let portfoliosService: any;
  let service: MixedAssetsService;

  beforeEach(() => {
    prisma = {
      mixedAsset: {
        findUnique: jest.fn().mockResolvedValue({ portfolioId: 'p1' }),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    portfoliosService = { assertOwnership: jest.fn() };
    service = new MixedAssetsService(prisma as any, portfoliosService);
  });

  describe('create', () => {
    it('coerces numeric string inputs and parses the purchase date', async () => {
      await service.create({
        portfolioId: 'p1',
        name: 'Vintage Watch',
        quantity: '1' as any,
        purchasePrice: '5000' as any,
        purchaseDate: '2026-01-01',
      }, OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.mixedAsset.create).toHaveBeenCalledWith({
        data: {
          portfolioId: 'p1',
          name: 'Vintage Watch',
          quantity: 1,
          purchasePrice: 5000,
          purchaseDate: new Date('2026-01-01'),
          currentValue: undefined,
        },
      });
    });

    it('coerces currentValue when provided', async () => {
      await service.create({
        portfolioId: 'p1',
        name: 'Vintage Watch',
        quantity: 1,
        purchasePrice: 5000,
        purchaseDate: '2026-01-01',
        currentValue: '6200' as any,
      }, OWNER_ID);

      expect(prisma.mixedAsset.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentValue: 6200 }) }),
      );
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.create({
        portfolioId: 'p1',
        name: 'Vintage Watch',
        quantity: 1,
        purchasePrice: 5000,
        purchaseDate: '2026-01-01',
      }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.mixedAsset.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('only includes fields that were provided', async () => {
      await service.update('asset-1', { quantity: 2 }, OWNER_ID);

      expect(prisma.mixedAsset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1' },
        select: { portfolioId: true },
      });
      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.mixedAsset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1' },
        data: { quantity: 2 },
      });
    });

    it('omits purchaseDate when not provided', async () => {
      await service.update('asset-1', { name: 'Renamed' }, OWNER_ID);

      const call = prisma.mixedAsset.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty('purchaseDate');
      expect(call.data).toEqual({ name: 'Renamed' });
    });

    it('parses currentValue when provided', async () => {
      await service.update('asset-1', { currentValue: 7000 }, OWNER_ID);

      expect(prisma.mixedAsset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1' },
        data: { currentValue: 7000 },
      });
    });

    it('throws NotFound when the mixed asset does not exist', async () => {
      prisma.mixedAsset.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { quantity: 2 }, OWNER_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.mixedAsset.update).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.update('asset-1', { quantity: 2 }, OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.mixedAsset.update).not.toHaveBeenCalled();
    });
  });

  describe('getByPortfolio', () => {
    it('queries mixed assets scoped to the given portfolio', async () => {
      await service.getByPortfolio('p1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.mixedAsset.findMany).toHaveBeenCalledWith({ where: { portfolioId: 'p1' } });
    });

    it('throws Forbidden when the portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.getByPortfolio('p1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.mixedAsset.findMany).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the mixed asset by id', async () => {
      await service.delete('asset-1', OWNER_ID);

      expect(portfoliosService.assertOwnership).toHaveBeenCalledWith('p1', OWNER_ID);
      expect(prisma.mixedAsset.delete).toHaveBeenCalledWith({ where: { id: 'asset-1' } });
    });

    it('throws Forbidden when the owning portfolio belongs to another user', async () => {
      portfoliosService.assertOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.delete('asset-1', OTHER_USER_ID)).rejects.toThrow(ForbiddenException);
      expect(prisma.mixedAsset.delete).not.toHaveBeenCalled();
    });
  });
});
