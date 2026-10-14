import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const oneLine = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim() : value,
  );

export class ContactDto {
  @oneLine() @IsString() @Length(2, 100) name!: string;
  @trim() @IsEmail() @MaxLength(254) email!: string;
  @oneLine() @IsOptional() @IsString() @MaxLength(150) subject?: string;
  @trim() @IsString() @Length(10, 5000) message!: string;
  @IsOptional() @IsIn(['fr', 'en']) lang?: 'fr' | 'en';
  /** Honeypot: real visitors never fill it. */
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class UpdateMessageDto {
  @IsOptional() @IsIn(['NEW', 'READ', 'ARCHIVED', 'SPAM']) status?:
    'NEW' | 'READ' | 'ARCHIVED' | 'SPAM';
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
}

export class ReplyDto {
  @trim() @IsString() @Length(2, 10_000) body!: string;
}
