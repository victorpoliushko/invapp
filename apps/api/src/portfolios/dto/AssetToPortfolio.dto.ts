import {
  IsDefined,
  IsNumber,
  IsString,
} from 'class-validator';

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
