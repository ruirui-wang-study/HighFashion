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

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsString()
  dek!: string;

  @IsString()
  category!: string;

  @IsString()
  authorName!: string;

  @IsString()
  authorRole!: string;

  @IsString()
  readTime!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideSectionDto)
  sections!: GuideSectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideFaqItemDto)
  faq!: GuideFaqItemDto[];

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
