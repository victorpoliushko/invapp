import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let authService: any;
  let strategy: JwtStrategy;

  beforeEach(() => {
    authService = { validateJwtUser: jest.fn() };
    strategy = new JwtStrategy(authService);
  });

  describe('validate', () => {
    it('delegates to authService.validateJwtUser with the payload userId', async () => {
      authService.validateJwtUser.mockResolvedValue({ id: 'u1', name: 'vic', role: 'USER' });

      const result = await strategy.validate({ userId: 'u1', username: 'vic' });

      expect(authService.validateJwtUser).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ id: 'u1', name: 'vic', role: 'USER' });
    });

    it('propagates errors from authService', async () => {
      authService.validateJwtUser.mockRejectedValue(new Error('not found'));

      await expect(strategy.validate({ userId: 'missing' })).rejects.toThrow('not found');
    });
  });
});
