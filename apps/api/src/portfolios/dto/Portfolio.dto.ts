import { IsArray, IsDefined, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { UserDto } from "../../users/dto/User.dto";
import { Type } from "class-transformer";
import { PositionDto } from "./Position.dto";
import { Bond, RealEstate, MixedAsset } from "@prisma/client";

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
  @Type(() => PositionDto)
  stockPositions: PositionDto[];

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => PositionDto)
  cryptoPositions: PositionDto[];

  @IsOptional()
  @IsArray()
  realEstateAssets: RealEstate[];

  @IsOptional()
  @IsArray()
  bonds: Bond[];

  @IsOptional()
  @IsArray()
  mixedAssets: MixedAsset[];
}
