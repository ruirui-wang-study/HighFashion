import { ContentStatus } from "@prisma/client";
import { IsIn, IsObject, IsOptional, IsString, Matches } from "class-validator";

export class UpdateStaticPageDto {
  @IsIn(["ABOUT", "FIT_GUIDE", "HOME_PAGE"])
  pageKey!: "ABOUT" | "FIT_GUIDE" | "HOME_PAGE";

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

  @IsObject()
  content!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  contentEn?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  contentZh?: Record<string, unknown> | null;

  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;
}
