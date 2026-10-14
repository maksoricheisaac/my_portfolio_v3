import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

const lower = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

export class SetupTokenDto {
  @IsString()
  @MaxLength(128)
  token!: string;
}

export class SetupEmailDto extends SetupTokenDto {
  @lower()
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class SetupCompleteDto extends SetupEmailDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsString()
  @Length(12, 128)
  password!: string;

  /** Signed challenge returned by /setup/email/send (required when SMTP is configured). */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  challenge?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code?: string;

  @IsBoolean()
  twoFactor!: boolean;

  @IsBoolean()
  importProjects!: boolean;

  @IsBoolean()
  indexable!: boolean;

  @IsString() @MaxLength(70) siteTitleFr!: string;
  @IsString() @MaxLength(70) siteTitleEn!: string;
  @IsString() @MaxLength(170) descriptionFr!: string;
  @IsString() @MaxLength(170) descriptionEn!: string;
}
