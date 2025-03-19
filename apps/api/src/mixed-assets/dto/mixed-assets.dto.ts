import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export enum MixedAssetType {
  REAL_ESTATE = "REAL_ESTATE",
  APPS = "APPS"
}

export class MixedAssetsDto {
  @IsUUID()
  id: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDefined()
  @IsEnum(MixedAssetType)
  type: MixedAssetType;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsDefined()
  @IsNotEmpty()
  price: number;
}


