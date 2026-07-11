import { MixedAssetsService } from './mixed-assets.service';

describe('MixedAssetsService', () => {
  let prisma: any;
  let service: MixedAssetsService;

  beforeEach(() => {
    prisma = {
      mixedAssets: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirstOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new MixedAssetsService(prisma);
  });

  describe('create', () => {
    it('creates a mixed asset from the dto', async () => {
      const dto = { title: 'Vintage Watch', type: 'APPS', quantity: 1, price: 5000 };
      prisma.mixedAssets.create.mockResolvedValue({ id: 'm1', ...dto });

      const result = await service.create(dto as any);

      expect(prisma.mixedAssets.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: 'm1', ...dto });
    });
  });

  describe('findAll', () => {
    it('limits results to the given count', async () => {
      prisma.mixedAssets.findMany.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);

      const result = await service.findAll(2);

      expect(prisma.mixedAssets.findMany).toHaveBeenCalledWith({ take: 2 });
      expect(result).toHaveLength(2);
    });

    it('returns an empty array when there are no mixed assets', async () => {
      prisma.mixedAssets.findMany.mockResolvedValue([]);

      const result = await service.findAll(10);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the mixed asset matching the id', async () => {
      prisma.mixedAssets.findFirstOrThrow.mockResolvedValue({ id: 'm1', name: 'Vintage Watch' });

      const result = await service.findOne('m1');

      expect(prisma.mixedAssets.findFirstOrThrow).toHaveBeenCalledWith({ where: { id: 'm1' } });
      expect(result.id).toBe('m1');
    });

    it('propagates the error when no matching asset exists', async () => {
      prisma.mixedAssets.findFirstOrThrow.mockRejectedValue(new Error('not found'));

      await expect(service.findOne('missing')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('updates the mixed asset with the given fields', async () => {
      prisma.mixedAssets.update.mockResolvedValue({ id: 'm1', title: 'Updated Name' });

      const result = await service.update('m1', { title: 'Updated Name' } as any);

      expect(prisma.mixedAssets.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { title: 'Updated Name' },
      });
      expect(result.title).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('deletes the asset and returns the remaining list', async () => {
      prisma.mixedAssets.delete.mockResolvedValue({ id: 'm1' });
      prisma.mixedAssets.findMany.mockResolvedValue([{ id: 'm2' }]);

      const result = await service.remove('m1');

      expect(prisma.mixedAssets.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
      expect(prisma.mixedAssets.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([{ id: 'm2' }]);
    });
  });
});
