import { IsArray, IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInvestStrategyDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tickers: string[];

  @IsString()
  @IsNotEmpty()
  userId: string;
}
