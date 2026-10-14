import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const CATEGORIES = [
  'saas',
  'entrepreneurship',
  'impact',
  'infra',
] as const;
export const STATUSES = [
  'stabilizing',
  'development',
  'concept',
  'designdev',
  'studio',
  'professional',
] as const;
export const VISUALS = [
  'marketplace',
  'studio',
  'pos',
  'sports',
  'maintenance',
  'pipeline',
] as const;
export const DOMAINS = ['fullstack', 'devops'] as const;

const emptyToNull = () =>
  Transform(({ value }) =>
    value === '' || value === undefined ? null : value,
  );

const url = { protocols: ['https', 'http'], require_protocol: true };

export class CreateProjectDto {
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, digits and dashes',
  })
  @MaxLength(80)
  slug!: string;

  @IsString() @MinLength(1) @MaxLength(120) title!: string;

  @IsBoolean() published!: boolean;
  @IsBoolean() featured!: boolean;
  @IsInt() @Min(0) @Max(10_000) sortOrder!: number;

  @IsIn(CATEGORIES) category!: (typeof CATEGORIES)[number];
  @IsIn(STATUSES) status!: (typeof STATUSES)[number];
  @IsIn(VISUALS) visual!: (typeof VISUALS)[number];
  @IsIn(DOMAINS) domain!: (typeof DOMAINS)[number];
  @IsBoolean() confidential!: boolean;
  @IsBoolean() stackPlanned!: boolean;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  stack!: string[];

  @IsString() @MaxLength(160) taglineFr!: string;
  @IsString() @MaxLength(160) taglineEn!: string;
  @IsString() @MaxLength(1000) summaryFr!: string;
  @IsString() @MaxLength(1000) summaryEn!: string;
  @IsString() @MaxLength(2000) problemFr!: string;
  @IsString() @MaxLength(2000) problemEn!: string;
  @IsString() @MaxLength(2000) contributionFr!: string;
  @IsString() @MaxLength(2000) contributionEn!: string;

  @IsString() @MaxLength(200_000) contentFr!: string;
  @IsString() @MaxLength(200_000) contentEn!: string;

  @emptyToNull() @IsOptional() @IsUrl(url) @MaxLength(500) liveUrl?:
    string | null;
  @emptyToNull() @IsOptional() @IsUrl(url) @MaxLength(500) repoUrl?:
    string | null;
  @emptyToNull() @IsOptional() @IsUrl(url) @MaxLength(500) siteUrl?:
    string | null;

  @emptyToNull() @IsOptional() @IsString() @MaxLength(40) coverId?:
    string | null;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsObject()
  @IsOptional()
  details?: Record<string, unknown> | null;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  related!: string[];

  @emptyToNull() @IsOptional() @IsString() @MaxLength(70) seoTitleFr?:
    string | null;
  @emptyToNull() @IsOptional() @IsString() @MaxLength(70) seoTitleEn?:
    string | null;
  @emptyToNull() @IsOptional() @IsString() @MaxLength(170) seoDescriptionFr?:
    string | null;
  @emptyToNull() @IsOptional() @IsString() @MaxLength(170) seoDescriptionEn?:
    string | null;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ReorderDto {
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}
