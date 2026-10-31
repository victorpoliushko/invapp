import { Controller, Get } from '@nestjs/common';
import { FxService } from './fx.service';
import { SUPPORTED_CURRENCIES } from './currencies';

@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Get('rates')
  async getRates() {
    const { base, date, rates } = await this.fxService.getRates();
    const supported = Object.fromEntries(SUPPORTED_CURRENCIES.map((c) => [c, rates[c]]));
    return { base, date, rates: supported, currencies: SUPPORTED_CURRENCIES };
  }
}
