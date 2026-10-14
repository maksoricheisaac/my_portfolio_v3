import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const lower = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

export class LoginDto {
  @lower()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export class VerifyOtpDto {
  @IsString()
  @MaxLength(2048)
  challenge!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code!: string;
}

export class ResendOtpDto {
  @IsString()
  @MaxLength(2048)
  challenge!: string;
}

export class ForgotPasswordDto {
  @lower()
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordDto {
  @lower()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code!: string;

  @IsString()
  @Length(12, 128)
  newPassword!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @Length(12, 128)
  newPassword!: string;
}

export class TwoFactorDto {
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  @MaxLength(128)
  password!: string;
}
