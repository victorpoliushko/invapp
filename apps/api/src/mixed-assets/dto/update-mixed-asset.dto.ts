import { PartialType } from '@nestjs/mapped-types';
import { CreateMixedAssetDto } from './create-mixed-asset.dto';

export class UpdateMixedAssetDto extends PartialType(CreateMixedAssetDto) {}
