import { Role } from "@prisma/client";
import { Exclude } from "class-transformer";
import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class UserDto {
  @IsDefined()
  @IsNotEmpty()
  id: string
  
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @IsEmail()
  email: string;

  @IsString()
  hashedRefreshToken?: string;

  @Exclude()
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
