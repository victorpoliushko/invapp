import { Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, Request, Res, Response, UseGuards } from '@nestjs/common';
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
  async login(@Req() req, @Res({ passthrough: true }) res) {
    if (!req.user) {
      throw new HttpException('invalid login credentials', StatusCodes.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, expiresIn } = await this.authService.signIn(req.user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: expiresIn * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { userId: req.user.id, username: req.user.username };
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
