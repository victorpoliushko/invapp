import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PassportAuthController } from './passport-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

console.log(`JWT Secret: ${jwtConstants.secret}`);

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    PassportModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // })
  ],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy],
  controllers: [AuthController, PassportAuthController]
})
export class AuthModule {}
