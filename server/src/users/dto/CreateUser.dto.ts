import { IsDefined, IsNotEmpty, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @IsDefined()
  @IsNotEmpty()
  password: string;
}