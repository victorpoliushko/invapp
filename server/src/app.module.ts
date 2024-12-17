import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockService } from './stock/stock.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StockController } from './stock/stock.controller';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, StockController],
  providers: [AppService, StockService],
})
export class AppModule {}
