import { MixedAssetsController } from './mixed-assets.controller';

describe('MixedAssetsController', () => {
  let service: any;
  let controller: MixedAssetsController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    controller = new MixedAssetsController(service);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to the service with the create dto', () => {
      const dto = { title: 'Vintage Watch', type: 'APPS', quantity: 1, price: 5000 };

      controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('delegates to the service with the parsed limit', () => {
      controller.findAll(10);

      expect(service.findAll).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('delegates to the service with the id from the param dto', () => {
      controller.findOne({ id: 'm1' });

      expect(service.findOne).toHaveBeenCalledWith('m1');
    });
  });

  describe('update', () => {
    it('delegates to the service with the id and update dto', () => {
      const dto = { title: 'Updated Name' };

      controller.update('m1', dto as any);

      expect(service.update).toHaveBeenCalledWith('m1', dto);
    });
  });

  describe('remove', () => {
    it('delegates to the service with the id', () => {
      controller.remove('m1');

      expect(service.remove).toHaveBeenCalledWith('m1');
    });
  });
});
