import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = 'has-permision';

export function HasPermission(permision: string) {
  return SetMetadata(PERMISSION_KEY, permision);
}
