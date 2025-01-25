import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvestStrategy } from 'src/schemas/investSrategy.schema';
import { CreateInvestStrategyDto } from './dto/CreateInvestStrategyDto';

@Injectable()
export class InvestStrategiesService {
  constructor(
    @InjectModel(InvestStrategy.name)
    private investStrategyModel: Model<InvestStrategy>,
  ) {}
  create(createInvestStrategyDto: CreateInvestStrategyDto) {
    const strat = new this.investStrategyModel(createInvestStrategyDto);
    return strat.save();
  }
}
