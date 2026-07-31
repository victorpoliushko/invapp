import { RefreshStrategy } from './refresh.strategy';

describe('RefreshStrategy', () => {
  let authService: any;
  let strategy: RefreshStrategy;

  beforeEach(() => {
    authService = { validateRefreshToken: jest.fn() };
    strategy = new RefreshStrategy({ secret: 'refresh-secret' } as any, authService);
  });

  describe('validate', () => {
    const makeReq = (authorization: string) => ({ get: () => authorization }) as any;

    it('strips the Bearer prefix and delegates to authService.validateRefreshToken', async () => {
      authService.validateRefreshToken.mockResolvedValue({ id: 'u1', username: 'vic' });
      const req = makeReq('Bearer raw-token-123');

      const result = await strategy.validate(req, { userId: 'u1' });

      expect(authService.validateRefreshToken).toHaveBeenCalledWith('u1', 'raw-token-123');
      expect(result).toEqual({ id: 'u1', username: 'vic' });
    });

    it('trims surrounding whitespace after stripping Bearer', async () => {
      authService.validateRefreshToken.mockResolvedValue({ id: 'u1', username: 'vic' });
      const req = makeReq('Bearer   raw-token-123  ');

      await strategy.validate(req, { userId: 'u1' });

      expect(authService.validateRefreshToken).toHaveBeenCalledWith('u1', 'raw-token-123');
    });

    it('propagates errors from authService', async () => {
      authService.validateRefreshToken.mockRejectedValue(new Error('invalid token'));
      const req = makeReq('Bearer raw-token-123');

      await expect(strategy.validate(req, { userId: 'u1' })).rejects.toThrow('invalid token');
    });
  });
});
