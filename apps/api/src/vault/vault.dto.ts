import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class VaultDto {
  @IsString()
  salt: string;

  @IsInt()
  @Min(100_000)
  @Max(10_000_000)
  iterations: number;

  @IsString()
  wrappedKey: string;

  @IsString()
  recoverySalt: string;

  @IsString()
  recoveryWrappedKey: string;
}

export class UpdatePassphraseDto {
  @IsString()
  salt: string;

  @IsInt()
  @Min(100_000)
  @Max(10_000_000)
  iterations: number;

  @IsString()
  wrappedKey: string;
}

export class ManagedKeyDto {
  @IsString()
  @Matches(/^[A-Za-z0-9+/]{43}=$/)
  key: string;
}
