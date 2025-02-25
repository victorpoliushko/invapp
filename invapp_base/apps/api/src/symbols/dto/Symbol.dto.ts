import { DataSource } from "@prisma/client";
import { IsDefined, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class SymbolDto {
  @IsDefined()
  @IsNotEmpty()
  id: string
  
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  exchange: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(DataSource)
  dataSource: DataSource;
}
