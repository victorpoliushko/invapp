import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [AuthService, UsersService],
  controllers: [AuthController]
})
export class AuthModule {}
