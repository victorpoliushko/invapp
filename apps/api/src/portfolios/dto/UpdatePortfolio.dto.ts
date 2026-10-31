import { IsIn, IsOptional, IsString, ValidateIf } from "class-validator";
import { SUPPORTED_CURRENCIES } from "../../fx/currencies";

export class UpdatePortfolioDto {
  // @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsIn(SUPPORTED_CURRENCIES)
  displayCurrency?: string | null;
}
