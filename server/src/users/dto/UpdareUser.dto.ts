import { IsDefined, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  // @IsDefined()
  // @IsNotEmpty()
  // @IsString()
  // id: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}