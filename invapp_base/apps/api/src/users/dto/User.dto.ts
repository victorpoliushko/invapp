import { Exclude } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

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

  @Exclude()
  password: string;
}
