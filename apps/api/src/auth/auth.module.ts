import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PassportAuthController } from './passport-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from '../config/refresh-jwt-config';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expireIn },
    }),
    PassportModule,
    ConfigModule.forFeature(refreshJwtConfig)
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, UsersService, PrismaService, RefreshStrategy],
  controllers: [PassportAuthController],
  exports: [RefreshStrategy]
})
export class AuthModule {}
