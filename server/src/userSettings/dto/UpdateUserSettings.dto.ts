import { IsBoolean, IsOptional } from "class-validator";

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  receiveSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  publicPortfolio?: boolean;
}
