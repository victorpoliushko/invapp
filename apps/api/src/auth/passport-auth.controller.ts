import { Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { StatusCodes } from 'http-status-codes';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';

@Controller('auth-v2')
export class PassportAuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  login(@Request() request) {
    if (!request.user) {
      throw new HttpException('invalid login credentials', StatusCodes.UNAUTHORIZED);
    }
    return this.authService.signIn(request.user);
  }

  @Get('profile')
  @UseGuards(PassportJwtAuthGuard)
  getProfileInfo(@Request() request) {
    return request.user;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() request) {
    return this.authService.refreshToken()request.user.id;
  }
}
