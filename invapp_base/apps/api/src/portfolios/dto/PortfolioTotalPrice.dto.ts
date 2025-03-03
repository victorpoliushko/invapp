import { IsDefined, IsEnum, IsNotEmpty, ValidateNested } from "class-validator";

enum Currency {
  USD,
  EUR
}

export class PortfolioTotalPriceDto {
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
