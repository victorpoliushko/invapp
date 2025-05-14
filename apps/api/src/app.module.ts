import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SymbolsService } from './symbols/symbols.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SymbolsController } from './symbols/symbols.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { SymbolsModule } from './symbols/symbols.module';
import { MixedAssetsModule } from './mixed-assets/mixed-assets.module';
import refreshJwtConfig from './config/refresh-jwt-config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
// tmp remove
// import { GoogleAnalyticsService } from './ga4/googleAnalyticsApi.service';
// import { GoogleAnalyticsController } from './ga4/googleAnalyticsApi.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration, refreshJwtConfig] }),
    HttpModule,
    UsersModule,
    AuthModule,
    PortfoliosModule,
    SymbolsModule,
    MixedAssetsModule,
    PrometheusModule.register()
  ],
  controllers: [AppController, SymbolsController, 
    // GoogleAnalyticsController
  ],
  providers: [AppService, SymbolsService, AuthService, JwtService, UsersService, PrismaService, 
    // GoogleAnalyticsService,
     {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor
  }],
})
export class AppModule {}
