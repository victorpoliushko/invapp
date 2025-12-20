import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from "class-validator";
import { UserDto } from "../../users/dto/User.dto";
import { Type } from "class-transformer";
import { PortfolioAssetDto } from "./PortfolioAsset.dto";
import { TransactionsDto } from "src/transactions/dto/Transations.dto";

export class PortfolioDto {
  @IsDefined()
  @IsNotEmpty()
  id: String;

  @IsDefined()
  @IsNotEmpty()
  name: String;

  @IsDefined()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => PortfolioAssetDto)
  assets: PortfolioAssetDto[];

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => PortfolioAssetDto)
  transactions: TransactionsDto[];
}
