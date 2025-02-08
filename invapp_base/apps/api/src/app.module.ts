import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockService } from './stock/stock.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StockController } from './stock/stock.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
// import { InvestStrategiesModule } from './investStrategies/investStrategies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HttpModule,
    UsersModule,
    // UsersSettingsModule,
    AuthModule,
    // InvestStrategiesModule,
    // MongooseModule.forRoot('mongodb://admin:password@localhost:27017/invapp?authSource=admin')
  ],
  controllers: [AppController, StockController, AuthController],
  providers: [AppService, StockService, AuthService, JwtService, UsersService, PrismaService],
})
export class AppModule {}
