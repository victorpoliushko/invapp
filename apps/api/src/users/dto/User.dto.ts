import { Exclude } from "class-transformer";
import { IsDefined, IsEmail, IsNotEmpty, IsString } from "class-validator";

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

  @Exclude()
  password: string;
}
