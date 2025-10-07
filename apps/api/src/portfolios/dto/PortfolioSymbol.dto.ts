import { IsDefined, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { SymbolDto } from "../../symbols/dto/Symbol.dto";

export class PortfolioSymbolDto {
  @IsDefined()
  portfolioId: string;

  @IsDefined()
  symbolId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  avgBuyPrice?: number;

  @ValidateNested()
  @Type(() => SymbolDto)
  symbols: SymbolDto;
}
