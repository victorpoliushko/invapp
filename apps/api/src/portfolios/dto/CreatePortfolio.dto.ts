import { IsDefined, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePortfolioDto {
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  goal?: string;
}
