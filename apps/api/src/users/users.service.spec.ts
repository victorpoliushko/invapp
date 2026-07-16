import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let prisma: any;
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new UsersService(prisma);
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('returns the user with portfolios included', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', username: 'vic', portfolios: [] });

      const result = await service.getUser('u1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        include: { portfolios: true },
      });
      expect(result.id).toBe('u1');
    });

    it('throws 404 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser('missing')).rejects.toThrow(HttpException);
    });
  });

  describe('getUserByName', () => {
    it('looks up the user by username', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', username: 'vic' });

      const result = await service.getUserByName('vic');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'vic' } });
      expect(result.username).toBe('vic');
    });

    it('returns null when no user matches the username', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserByName('missing');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('looks up the user by email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'v@x.com' });

      const result = await service.getUserByEmail('v@x.com');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'v@x.com' } });
      expect(result.email).toBe('v@x.com');
    });
  });

  describe('findByEmail', () => {
    it('returns a UserDto for the matching user', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'v@x.com' });

      const result = await service.findByEmail('v@x.com');

      expect(result.id).toBe('u1');
    });

    it('returns null when no user matches', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.findByEmail('missing@x.com');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('returns the user matching the id', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'u1' });

      const result = await service.findOne('u1');

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: 'u1' } });
      expect(result).toEqual({ id: 'u1' });
    });

    it('propagates the error when no matching user exists', async () => {
      prisma.user.findUniqueOrThrow.mockRejectedValue(new Error('not found'));

      await expect(service.findOne('missing')).rejects.toThrow('not found');
    });
  });

  describe('create', () => {
    it('hashes the password before persisting the user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({ id: 'u1', username: 'vic', email: 'v@x.com' });

      const result = await service.create({
        username: 'vic',
        password: 'plain',
        email: 'v@x.com',
        phoneNumber: '123',
        role: 'USER' as any,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'vic',
          phoneNumber: '123',
          email: 'v@x.com',
          password: 'hashed-pw',
          role: 'USER',
        },
      });
      expect(result.id).toBe('u1');
    });
  });

  describe('update', () => {
    it('only updates username, phoneNumber and role', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', username: 'new-name' });

      await service.update('u1', {
        username: 'new-name',
        phoneNumber: '456',
        role: 'ADMIN' as any,
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { username: 'new-name', phoneNumber: '456', role: 'ADMIN' },
      });
    });
  });

  describe('updateHashedResfreshToken', () => {
    it('updates the stored hashed refresh token', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', hashedRefreshToken: 'hashed' });

      await service.updateHashedResfreshToken('u1', 'hashed');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { hashedRefreshToken: 'hashed' },
      });
    });

    it('clears the refresh token when passed null', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', hashedRefreshToken: null });

      await service.updateHashedResfreshToken('u1', null as any);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { hashedRefreshToken: null },
      });
    });
  });

  describe('delete', () => {
    it('deletes the user by id', async () => {
      prisma.user.delete.mockResolvedValue({ id: 'u1' });

      await service.delete('u1');

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });
  });
});
