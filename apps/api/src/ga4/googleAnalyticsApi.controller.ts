import { Controller, Get } from '@nestjs/common';
import { GoogleAnalyticsService } from './googleAnalyticsApi.service';

@Controller('analytics')
export class GoogleAnalyticsController {
  constructor(private readonly ga4Service: GoogleAnalyticsService) {}

  @Get('realtime')
  async getRealtimeData(): Promise<any> {
    return this.ga4Service.getReport();
  }
}
