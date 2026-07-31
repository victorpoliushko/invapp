import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let authService: any;
  let strategy: GoogleStrategy;

  beforeEach(() => {
    const config = {
      clientID: 'client-id',
      clientSecret: 'client-secret',
      callbackURL: 'http://localhost/callback',
    };
    authService = { validateGoogleUser: jest.fn() };
    strategy = new GoogleStrategy(config as any, authService);
  });

  describe('validate', () => {
    it('builds the user payload from the Google profile and calls done with the result', async () => {
      authService.validateGoogleUser.mockResolvedValue({ id: 'u1', email: 'v@x.com' });
      const profile = {
        name: { givenName: 'Vic' },
        emails: [{ value: 'v@x.com' }],
      };
      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(authService.validateGoogleUser).toHaveBeenCalledWith({
        username: 'Vic',
        email: 'v@x.com',
        role: 'USER',
        password: '',
      });
      expect(done).toHaveBeenCalledWith(null, { id: 'u1', email: 'v@x.com' });
    });
  });
});
