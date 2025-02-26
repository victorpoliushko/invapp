import { Type } from "class-transformer";
import { IsArray, IsDefined, IsInt, IsNotEmpty, IsString, IsUUID, Min, ValidateNested } from "class-validator";

class SymbolQuantityDto {
  @IsUUID()
  symbolId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddSymbolToPortfolioDto {
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymbolQuantityDto)
  symbols: SymbolQuantityDto[];
}
