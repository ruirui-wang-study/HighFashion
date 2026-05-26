import { Type } from "class-transformer";
import { ContentStatus } from "@prisma/client";
import { IsArray, IsIn, IsOptional, IsString, Matches, ValidateNested } from "class-validator";

class GuideSectionDto {
  @IsString()
  heading!: string;

  @IsString()
  body!: string;
}

class GuideFaqItemDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

class GuideCollectionLinkDto {
  @IsString()
  title!: string;

  @IsString()
  path!: string;
}

export class UpsertGuideDto {
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

  @IsString()
  dek!: string;

  @IsOptional()
  @IsString()
  dekEn?: string | null;

  @IsOptional()
  @IsString()
  dekZh?: string | null;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  categoryEn?: string | null;

  @IsOptional()
  @IsString()
  categoryZh?: string | null;

  @IsString()
  authorName!: string;

  @IsString()
  authorRole!: string;

  @IsOptional()
  @IsString()
  authorRoleEn?: string | null;

  @IsOptional()
  @IsString()
  authorRoleZh?: string | null;

  @IsString()
  readTime!: string;

  @IsOptional()
  @IsString()
  readTimeEn?: string | null;

  @IsOptional()
  @IsString()
  readTimeZh?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideSectionDto)
  sections!: GuideSectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideSectionDto)
  sectionsEn!: GuideSectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideSectionDto)
  sectionsZh!: GuideSectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideFaqItemDto)
  faq!: GuideFaqItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideFaqItemDto)
  faqEn!: GuideFaqItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideFaqItemDto)
  faqZh!: GuideFaqItemDto[];

  @IsArray()
  @IsString({ each: true })
  relatedProducts!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideCollectionLinkDto)
  relatedCollections!: GuideCollectionLinkDto[];

  @IsArray()
  @IsString({ each: true })
  relatedGuides!: string[];

  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;
}
