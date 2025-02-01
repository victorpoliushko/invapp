import { Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateUserSettingsDto } from "src/userSettings/dto/CreateUserSettings.dto";

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

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserSettingsDto)
  settings?: CreateUserSettingsDto;
}
