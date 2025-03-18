import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { MixedAssetsType } from "./mixed-assets.dto";

export class CreateMixedAssetDto {
  @IsUUID()
  id: string;

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
