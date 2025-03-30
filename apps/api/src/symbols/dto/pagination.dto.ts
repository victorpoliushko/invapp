import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class PaginationDTO {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
