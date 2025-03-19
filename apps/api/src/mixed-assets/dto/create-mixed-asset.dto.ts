import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { MixedAssetType } from "./mixed-assets.dto";

export class CreateMixedAssetDto {
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
