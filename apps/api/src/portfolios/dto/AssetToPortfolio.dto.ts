import {
  IsDefined,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class AddAssetInputDto {
  @ValidateIf(i => !i.assetName || i.assetId)
  @IsDefined({message: 'At least one of id or assetName must be provided'})
  @IsUUID()
  assetId?: string;

  @ValidateIf(i => !i.assetId || i.assetName)
  @IsDefined({message: 'At least one of id or assetName must be provided'})
  @IsString()
  assetName?: string;

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
