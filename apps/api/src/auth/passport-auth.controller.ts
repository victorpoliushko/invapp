import { Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { StatusCodes } from 'http-status-codes';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { jwtConstants } from './constants';

@Controller('auth-v2')
export class PassportAuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  login(@Request() request) {
    if (!request.user) {
      throw new HttpException('invalid login credentials', StatusCodes.UNAUTHORIZED);
    }
    return this.authService.signIn(request.user);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  refreshToken(@Req() request) {
    return this.authService.refreshToken({ userId: request.user.id, username: request.user.username });
  }

  @UseGuards(PassportJwtAuthGuard)
  @Post('signout')
  signOut(@Req() request) {
    this.authService.signOut(request.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {

  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.signIn({ userId: req.user.id, username: req.user.givenName});
    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 15)
    });
    
    res.redirect(`http://localhost:5173`);
  }
}
