import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let reflector: any;
  let guard: RolesGuard;

  const makeContext = (user: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as any;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector);
  });

  it('allows access when the handler has no roles metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(makeContext({ role: 'USER' }));

    expect(result).toBe(true);
  });

  it('allows access when the user role is included in the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'EDITOR']);

    const result = guard.canActivate(makeContext({ role: 'EDITOR' }));

    expect(result).toBe(true);
  });

  it('denies access when the user role is not included in the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'EDITOR']);

    const result = guard.canActivate(makeContext({ role: 'USER' }));

    expect(result).toBe(false);
  });
});
