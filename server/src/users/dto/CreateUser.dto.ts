import { IsDefined, IsNotEmpty, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsDefined()
  @IsUUID()
  @IsNotEmpty()
  username: string;

  @IsDefined()
  @IsNotEmpty()
  password: string;
}