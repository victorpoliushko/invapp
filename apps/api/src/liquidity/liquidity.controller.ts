import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';
import { LiquidityService } from './liquidity.service';

@Controller('users')
export class LiquidityController {
  constructor(private liquidityService: LiquidityService) {}

  @Get(':userId/liquidity')
  @UseGuards(AuthGuard('jwt'))
  getUserLiquidity(@Param('userId') userId: string, @GetUser() user: User) {
    if (userId !== user.id) {
      throw new ForbiddenException(
        "You do not have access to this user's liquidity summary",
      );
    }
    return this.liquidityService.getUserLiquidity(userId);
  }
}
