import { IsArray } from "class-validator";

export class DeleteSymbolsFromPortfolioDto {
  @IsArray()
  symbolIds: string[];
}
