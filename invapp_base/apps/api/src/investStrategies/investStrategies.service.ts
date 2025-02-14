import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvestStrategy } from 'src/schemas/investSrategy.schema';
import { CreateInvestStrategyDto } from './dto/CreateInvestStrategyDto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class InvestStrategiesService {
  constructor(
    @InjectModel(InvestStrategy.name)
    private investStrategyModel: Model<InvestStrategy>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  async create(createInvestStrategyDto: CreateInvestStrategyDto) {
    const { userId } = createInvestStrategyDto;
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('user not found', 404);
    const strat = new this.investStrategyModel(createInvestStrategyDto);
    const savedStrat = await strat.save();
    await user.updateOne({
      $push: {
        investStrategies: savedStrat._id
      }
    })
    return savedStrat;
  }
}
