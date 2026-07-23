import { UsersController } from './users.controller';

describe('UsersController', () => {
  let service: any;
  let controller: UsersController;

  beforeEach(() => {
    service = {
      getUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new UsersController(service);
  });

  describe('getUser', () => {
    it('delegates to the service with the user id', () => {
      controller.getUser('u1');

      expect(service.getUser).toHaveBeenCalledWith('u1');
    });
  });

  describe('createUser', () => {
    it('delegates to the service with the create dto', () => {
      const dto = { username: 'vic', email: 'v@x.com', password: 'plain', role: 'USER' };

      controller.createUser(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateUser', () => {
    it('delegates to the service with the user id and update dto', () => {
      const dto = { username: 'new-name' };

      controller.updateUser('u1', dto as any);

      expect(service.update).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('deleteUser', () => {
    it('delegates to the service with the user id', () => {
      controller.deleteUser('u1');

      expect(service.delete).toHaveBeenCalledWith('u1');
    });
  });
});
