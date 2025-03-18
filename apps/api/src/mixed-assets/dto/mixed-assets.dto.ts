import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export enum MixedAssetsType {
  REAL_ESTATE,
  APPS
}

export class MixedAssetsDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDefined()
  @IsEnum(MixedAssetsType)
  type: MixedAssetsType;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsDefined()
  @IsNotEmpty()
  price: number;
}


