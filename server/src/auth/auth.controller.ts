import { Body, Controller, HttpCode, HttpStatus, NotImplementedException, Post } from '@nestjs/common';
import { AuthInput, AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() input: AuthInput) {
    return this.authService.authenticate(input);
  }
}
