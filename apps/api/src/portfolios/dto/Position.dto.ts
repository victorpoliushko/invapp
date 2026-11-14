import { IsArray, IsDefined, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AssetDto } from "../../assets/dto/Asset.dto";
import { TransactionsDto } from "src/transactions/dto/Transations.dto";

export class PositionDto {
  @IsDefined()
  portfolioId: string;

  @IsDefined()
  assetId: string;

  @IsString()
  quantity: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  avgBuyPrice?: string;

  @ValidateNested()
  @Type(() => AssetDto)
  asset: AssetDto;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => TransactionsDto)
  transactions: TransactionsDto[];
}
