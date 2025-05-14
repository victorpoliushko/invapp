// tmp remove

// import { Injectable, Logger } from '@nestjs/common';
// import { BetaAnalyticsDataClient } from '@google-analytics/data';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class GoogleAnalyticsService {
//   private logger = new Logger(GoogleAnalyticsService.name);
//   private analyticsDataClient: BetaAnalyticsDataClient;
//   private propertyId: string;

//   constructor(private configService: ConfigService) {
//     this.analyticsDataClient = new BetaAnalyticsDataClient({
//       credentials: JSON.parse(this.configService.get<string>('GA4_CREDENTIALS')),
//     });
//     this.propertyId = this.configService.get<string>('GA4_PROPERTY_ID');
//   }

//   async getReport(): Promise<any> {
//     try {
//       const [response] = await this.analyticsDataClient.runRealtimeReport({
//         property: `properties/${this.propertyId}`,
//         dimensions: [
//           {
//             name: 'pageTitle',
//           },
//         ],
//         metrics: [
//           {
//             name: 'activeUsers',
//           },
//         ],
//       });
//       this.logger.log('GA4 Realtime Report Data:', response);
//       return response;
//     } catch (error) {
//       this.logger.error('Error fetching GA4 Realtime Report:', error);
//       throw error;
//     }
//   }
// }
