import { HttpException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

jest.mock('bcrypt');
jest.mock('argon2');

describe('AuthService', () => {
  let userService: any;
  let jwtService: any;
  let service: AuthService;

  beforeEach(() => {
    userService = {
      getUserByEmail: jest.fn(),
      updateHashedResfreshToken: jest.fn(),
      getUser: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    service = new AuthService(userService, jwtService, { expiresIn: '7d' } as any);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('returns userId and username when credentials are valid', async () => {
      userService.getUserByEmail.mockResolvedValue({ id: 'u1', username: 'vic', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser({ email: 'v@x.com', password: 'plain' });

      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(result).toEqual({ userId: 'u1', username: 'vic' });
    });

    it('throws 404 when the user does not exist', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(service.validateUser({ email: 'missing@x.com', password: 'plain' })).rejects.toThrow(
        HttpException,
      );
    });

    it('throws 403 when the password does not match', async () => {
      userService.getUserByEmail.mockResolvedValue({ id: 'u1', username: 'vic', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser({ email: 'v@x.com', password: 'wrong' })).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('generateToken', () => {
    it('signs an access token and a refresh token with the user payload', async () => {
      jwtService.signAsync.mockResolvedValueOnce('access-tok').mockResolvedValueOnce('refresh-tok');

      const result = await service.generateToken({ userId: 'u1', username: 'vic' });

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { userId: 'u1', username: 'vic' },
        { expiresIn: expect.anything() },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { userId: 'u1', username: 'vic' },
        { expiresIn: '7d' },
      );
      expect(result).toEqual({ accessToken: 'access-tok', refreshToken: 'refresh-tok' });
    });
  });

  describe('signIn', () => {
    it('stores the hashed refresh token and returns tokens with user info', async () => {
      jwtService.signAsync.mockResolvedValueOnce('access-tok').mockResolvedValueOnce('refresh-tok');
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-refresh');

      const result = await service.signIn({ userId: 'u1', username: 'vic' });

      expect(argon2.hash).toHaveBeenCalledWith('refresh-tok');
      expect(userService.updateHashedResfreshToken).toHaveBeenCalledWith('u1', 'hashed-refresh');
      expect(result).toMatchObject({ accessToken: 'access-tok', refreshToken: 'refresh-tok', userId: 'u1', username: 'vic' });
    });

    it('wraps token generation failures in an InternalServerErrorException', async () => {
      jwtService.signAsync.mockRejectedValue(new Error('signing failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.signIn({ userId: 'u1', username: 'vic' })).rejects.toThrow(
        'Token generation failed',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('refreshToken', () => {
    it('rotates tokens and persists the new hashed refresh token', async () => {
      jwtService.signAsync.mockResolvedValueOnce('access-tok-2').mockResolvedValueOnce('refresh-tok-2');
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-refresh-2');

      const result = await service.refreshToken({ userId: 'u1', username: 'vic' });

      expect(userService.updateHashedResfreshToken).toHaveBeenCalledWith('u1', 'hashed-refresh-2');
      expect(result.accessToken).toBe('access-tok-2');
    });
  });

  describe('validateRefreshToken', () => {
    it('returns the user id and username when the refresh token matches', async () => {
      userService.getUser.mockResolvedValue({ username: 'vic', hashedRefreshToken: 'hashed' });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateRefreshToken('u1', 'raw-token');

      expect(argon2.verify).toHaveBeenCalledWith('hashed', 'raw-token');
      expect(result).toEqual({ id: 'u1', username: 'vic' });
    });

    it('throws Unauthorized when the user has no stored refresh token', async () => {
      userService.getUser.mockResolvedValue({ username: 'vic', hashedRefreshToken: null });

      await expect(service.validateRefreshToken('u1', 'raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when the user does not exist', async () => {
      userService.getUser.mockResolvedValue(null);

      await expect(service.validateRefreshToken('u1', 'raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when the token does not match', async () => {
      userService.getUser.mockResolvedValue({ username: 'vic', hashedRefreshToken: 'hashed' });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.validateRefreshToken('u1', 'wrong-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('clears the stored refresh token for the user', async () => {
      await service.signOut('u1');

      expect(userService.updateHashedResfreshToken).toHaveBeenCalledWith('u1', null);
    });
  });

  describe('validateJwtUser', () => {
    it('returns the current user shape when the user exists', async () => {
      userService.findOne.mockResolvedValue({ id: 'u1', username: 'vic', role: 'ADMIN' });

      const result = await service.validateJwtUser('u1');

      expect(result).toEqual({ id: 'u1', name: 'vic', role: 'ADMIN' });
    });

    it('throws 404 when the user does not exist', async () => {
      userService.findOne.mockResolvedValue(null);

      await expect(service.validateJwtUser('missing')).rejects.toThrow(HttpException);
    });
  });

  describe('validateGoogleUser', () => {
    it('returns the existing user when found by email', async () => {
      userService.getUserByEmail.mockResolvedValue({ id: 'u1', email: 'v@x.com' });

      const result = await service.validateGoogleUser({ email: 'v@x.com' } as any);

      expect(userService.create).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'u1', email: 'v@x.com' });
    });

    it('creates a new user when none is found by email', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({ id: 'u2', email: 'new@x.com' });

      const result = await service.validateGoogleUser({ email: 'new@x.com' } as any);

      expect(userService.create).toHaveBeenCalledWith({ email: 'new@x.com' });
      expect(result).toEqual({ id: 'u2', email: 'new@x.com' });
    });
  });
});
