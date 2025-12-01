import { IsString } from "class-validator";

export class DeleteAssetsFromPortfolioDto {
  @IsString()
  assetId: string;
}
