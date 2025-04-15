import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  hashedRefreshToken?: string;
}
