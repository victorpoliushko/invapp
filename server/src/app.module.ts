import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockService } from './stock/stock.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StockController } from './stock/stock.controller';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HttpModule,
    UsersModule,
    AuthModule,
    MongooseModule.forRoot('mongodb://admin:password@localhost:27017/invapp?authSource=admin')
  ],
  controllers: [AppController, StockController, AuthController],
  providers: [AppService, StockService, AuthService, JwtService],
})
export class AppModule {}
