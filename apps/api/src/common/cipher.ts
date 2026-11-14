import { BadRequestException } from '@nestjs/common';

const CIPHERTEXT = /^v1:[A-Za-z0-9+/]+={0,2}:[A-Za-z0-9+/]+={0,2}$/;

export function isCiphertext(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 512 && CIPHERTEXT.test(value);
}

export function cipher(value: unknown, field: string): string {
  if (!isCiphertext(value)) throw new BadRequestException(`${field} must be encrypted on the device`);
  return value;
}

export function optionalCipher(value: unknown, field: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return cipher(value, field);
}
