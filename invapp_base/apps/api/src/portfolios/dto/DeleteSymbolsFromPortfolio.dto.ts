import { IsArray, IsDefined, IsNotEmpty, IsUUID } from "class-validator";

export class DeleteSymbolsFromPortfolioDto {
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  @IsArray()
  symbolIds: string[];
}
