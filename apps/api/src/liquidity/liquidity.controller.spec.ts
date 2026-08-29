import { ForbiddenException } from '@nestjs/common';
import { LiquidityController } from './liquidity.controller';

describe('LiquidityController', () => {
  const user = { id: 'u1' } as any;

  let service: any;
  let controller: LiquidityController;

  beforeEach(() => {
    service = { getUserLiquidity: jest.fn() };
    controller = new LiquidityController(service);
  });

  describe('getUserLiquidity', () => {
    it('delegates to the service when the requested userId matches the authenticated user', async () => {
      const summary = { byType: {}, liquid: {}, illiquid: {} };
      service.getUserLiquidity.mockResolvedValue(summary);

      const result = await controller.getUserLiquidity('u1', user);

      expect(service.getUserLiquidity).toHaveBeenCalledWith('u1');
      expect(result).toBe(summary);
    });

    it('throws Forbidden when the requested userId does not match the authenticated user', () => {
      expect(() => controller.getUserLiquidity('someone-else', user)).toThrow(
        ForbiddenException,
      );
      expect(service.getUserLiquidity).not.toHaveBeenCalled();
    });
  });
});
