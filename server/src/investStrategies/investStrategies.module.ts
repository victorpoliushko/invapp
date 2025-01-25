import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InvestStrategy, InvestStrategySchema } from "src/schemas/investSrategy.schema";
import { InvestStrategiesController } from "./investStrategies.controller";
import { InvestStrategiesService } from "./investStrategies.service";

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: InvestStrategy.name,
      schema: InvestStrategySchema
    }])
  ],
  controllers: [InvestStrategiesController],
  providers: [InvestStrategiesService]
})
export class InvestStrategiesModule {};
