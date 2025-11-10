import { Type } from "class-transformer";
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from "class-validator";

class AssetQuantityDto {
  @IsUUID()
  assetId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class AssetToPortfolioDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetQuantityDto)
  asset: AssetQuantityDto;
}

// {"assets":["A"],"dueDate":"2025-11-06","amount":"2","period":"","price":"3"} 