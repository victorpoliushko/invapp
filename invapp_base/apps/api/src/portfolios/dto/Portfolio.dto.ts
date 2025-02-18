import { IsDefined, IsNotEmpty, ValidateNested } from "class-validator";
import { UserDto } from "../../users/dto/User.dto";
import { Type } from "class-transformer";

export class PortfolioDto {
  @IsDefined()
  @IsNotEmpty()
  id: String;

  @IsDefined()
  @IsNotEmpty()
  name: String;

  @IsDefined()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  // symbols: SymbolDto
}
