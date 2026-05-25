import { IsArray, IsDefined, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { UserDto } from "../../users/dto/User.dto";
import { Type } from "class-transformer";
import { PortfolioAssetDto } from "./PortfolioAsset.dto";
import { RealEstate } from "@prisma/client";

export class PortfolioDto {
  @IsDefined()
  @IsNotEmpty()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => PortfolioAssetDto)
  portfolioAssets: PortfolioAssetDto[];

  @IsOptional()
  @IsArray()
  realEstateAssets: RealEstate[];
}
