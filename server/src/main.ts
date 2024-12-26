import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StockService } from './stock/stock.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.enableCors(); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
