import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class InvestStrategy {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  tickers: string[];
}

export const InvestStrategySchema = SchemaFactory.createForClass(InvestStrategy);
