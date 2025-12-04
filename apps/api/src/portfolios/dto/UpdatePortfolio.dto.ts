import { IsString, IsUUID } from "class-validator";

export class UpdatePortfolioDto {
  @IsUUID()
  id: string;
  
  @IsString()
  name: string;
}
