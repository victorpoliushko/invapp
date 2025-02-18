import { IsDefined, IsNotEmpty } from "class-validator";

export class CreatePortfolioDto {
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  userId: string;
}
