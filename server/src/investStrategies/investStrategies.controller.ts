import { Body, Controller, Inject, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateInvestStrategyDto } from "./dto/CreateInvestStrategyDto";
import { InvestStrategiesService } from "./investStrategies.service";

@Controller('invest-strategies')
export class InvestStrategiesController {
  constructor(private investStrategyService: InvestStrategiesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createInvestStrategyDto: CreateInvestStrategyDto) {
    return this.investStrategyService.create(createInvestStrategyDto);
  }
}
