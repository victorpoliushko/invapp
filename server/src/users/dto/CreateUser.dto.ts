import { IsDefined, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @IsDefined()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;
}