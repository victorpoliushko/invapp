import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let authService: any;
  let strategy: LocalStrategy;

  beforeEach(() => {
    authService = { validateUser: jest.fn() };
    strategy = new LocalStrategy(authService);
  });

  describe('validate', () => {
    it('returns the userId and username when credentials are valid', async () => {
      authService.validateUser.mockResolvedValue({ userId: 'u1', username: 'vic' });

      const result = await strategy.validate('v@x.com', 'plain');

      expect(authService.validateUser).toHaveBeenCalledWith({ email: 'v@x.com', password: 'plain' });
      expect(result).toEqual({ userId: 'u1', username: 'vic' });
    });

    it('throws when no password is provided', async () => {
      // Bug: the guard calls getReasonPhrase('Please provide the password') — that
      // function expects a StatusCode, not a message, so it throws its own internal
      // Error ("Status code does not exist: ...") instead of the intended HttpException.
      await expect(strategy.validate('v@x.com', '')).rejects.toThrow(
        'Status code does not exist: Please provide the password',
      );
      expect(authService.validateUser).not.toHaveBeenCalled();
    });

    it('throws Unauthorized when authService returns no user', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('v@x.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});
