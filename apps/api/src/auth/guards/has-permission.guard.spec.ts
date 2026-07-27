import { ExecutionContext, HttpException } from '@nestjs/common';
import { HasPermissionGuard } from './has-permission.guard';

describe('HasPermissionGuard', () => {
  let reflector: any;
  let guard: HasPermissionGuard;

  const makeContext = (user: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as any;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new HasPermissionGuard(reflector);
  });

  it('allows access when the handler requires no permission', () => {
    reflector.get.mockReturnValue(undefined);

    const result = guard.canActivate(makeContext({ permissions: [] }));

    expect(result).toBe(true);
  });

  it('allows access when the user has the required permission', () => {
    reflector.get.mockReturnValue('portfolios:delete');

    const result = guard.canActivate(makeContext({ permissions: ['portfolios:delete'] }));

    expect(result).toBe(true);
  });

  it('throws Forbidden when the user lacks the required permission', () => {
    reflector.get.mockReturnValue('portfolios:delete');

    expect(() => guard.canActivate(makeContext({ permissions: ['portfolios:read'] }))).toThrow(
      HttpException,
    );
  });
});
