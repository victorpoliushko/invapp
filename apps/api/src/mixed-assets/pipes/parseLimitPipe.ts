import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class ParseLimitPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value);
    if (isNaN(val)) {
      throw new BadRequestException('limit must be a number');
    }
    if (val <= 0) {
      throw new BadRequestException('limit must be positive');
    }
    return val;
  }
}