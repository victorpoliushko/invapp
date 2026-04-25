import { IsArray, IsDefined, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AssetDto } from "../../assets/dto/Asset.dto";
import { TransactionsDto } from "src/transactions/dto/Transations.dto";

export class PortfolioAssetDto {
  @IsDefined()
  portfolioId: string;

  @IsDefined()
  assetId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  avgBuyPrice?: number;

  @ValidateNested()
  @Type(() => AssetDto)
  asset: AssetDto;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => TransactionsDto)
  transactions: TransactionsDto[];
}
