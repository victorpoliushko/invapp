import { IsBoolean, IsOptional } from "class-validator";

export class CreateUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  receiveSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  publicPortfolio?: boolean;
}
