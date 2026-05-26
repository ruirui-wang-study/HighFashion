import { ContentStatus } from "@prisma/client";
import { IsArray, IsIn, IsOptional, IsString, Matches } from "class-validator";

export class UpdateCollectionLandingDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  titleEn?: string | null;

  @IsOptional()
  @IsString()
  titleZh?: string | null;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  pathname!: string;

  @IsOptional()
  @IsString()
  scenario?: string | null;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoTitleEn?: string | null;

  @IsOptional()
  @IsString()
  seoTitleZh?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  seoDescriptionEn?: string | null;

  @IsOptional()
  @IsString()
  seoDescriptionZh?: string | null;

  @IsOptional()
  @IsString()
  intro?: string | null;

  @IsOptional()
  @IsString()
  introEn?: string | null;

  @IsOptional()
  @IsString()
  introZh?: string | null;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  useCase?: string | null;

  @IsArray()
  @IsString({ each: true })
  relatedGuideSlugs!: string[];

  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;
}
