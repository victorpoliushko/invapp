import { IsDefined, IsUUID } from "class-validator";

export class IdParamDto {
  @IsDefined()
  @IsUUID()
  id: string
}