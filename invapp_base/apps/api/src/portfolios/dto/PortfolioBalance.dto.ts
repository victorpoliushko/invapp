import { IsDefined, IsEnum, IsNotEmpty, ValidateNested } from "class-validator";

export enum Currency {
  USD,
  EUR
}

export class PortfolioBalanceDto {
  @IsDefined()
  @IsNotEmpty()
  id: String;

  @IsDefined()
  @IsNotEmpty()
  name: String;

  price?: Number;
  
  @IsEnum(Currency)
  currency?: Currency;
}
