import { IsDefined, IsNotEmpty, IsNumber, IsOptional, Max, Min } from "class-validator";

export class CreatePortfolioDto {
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  goal?: number;
}
