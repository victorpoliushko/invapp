import { BadRequestException } from '@nestjs/common';
import { ParseLimitPipe } from './parseLimitPipe';

describe('ParseLimitPipe', () => {
  let pipe: ParseLimitPipe;

  beforeEach(() => {
    pipe = new ParseLimitPipe();
  });

  it('parses a valid numeric string into a number', () => {
    expect(pipe.transform('10', {} as any)).toBe(10);
  });

  it('truncates a decimal string to an integer', () => {
    expect(pipe.transform('10.9', {} as any)).toBe(10);
  });

  it('throws BadRequestException when the value is not a number', () => {
    expect(() => pipe.transform('abc', {} as any)).toThrow(BadRequestException);
  });

  it('throws BadRequestException when the value is zero', () => {
    expect(() => pipe.transform('0', {} as any)).toThrow(BadRequestException);
  });

  it('throws BadRequestException when the value is negative', () => {
    expect(() => pipe.transform('-5', {} as any)).toThrow(BadRequestException);
  });
});
