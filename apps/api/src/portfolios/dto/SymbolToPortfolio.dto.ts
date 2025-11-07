import { Type } from "class-transformer";
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from "class-validator";

class SymbolQuantityDto {
  @IsUUID()
  symbolId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class SymbolToPortfolioDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymbolQuantityDto)
  symbols: SymbolQuantityDto[];
}

// {"symbols":["A"],"dueDate":"2025-11-06","amount":"2","period":"","price":"3"} 