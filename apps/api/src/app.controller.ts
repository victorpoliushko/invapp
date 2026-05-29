import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly httpService: HttpService,
  ) {}

  @Public()
  @Get('geo/location')
  async getLocation(@Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '';
    const isLocal = !ip || ip === '127.0.0.1' || ip === '::1';
    const url = isLocal
      ? 'http://ip-api.com/json/'
      : `http://ip-api.com/json/${ip}`;
    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return { country_name: data.country, city: data.city };
    } catch {
      return { country_name: null, city: null };
    }
  }
}
