import { Role } from "@prisma/client";
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SUPPORTED_CURRENCIES } from "../../fx/currencies";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  hashedRefreshToken?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  defaultCurrency?: string;
}
