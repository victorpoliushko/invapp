import { Type } from "class-transformer";
import { IsArray, IsDefined, IsInt, IsNumber, IsString, IsUUID, Min, ValidateNested } from "class-validator";

export class AddAssetInputDto {
  @IsString()
  @IsDefined()
  assetName: string;

    @IsString()
  @IsDefined()
  dueDate: string;

    @IsNumber()
  @IsDefined()
  quantity: number;

    @IsNumber()
  @IsDefined()
  price: number;
}
