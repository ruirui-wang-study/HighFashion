import { Type } from "class-transformer";
import { ContentStatus } from "@prisma/client";
import { IsArray, IsIn, IsOptional, IsString, Matches, ValidateNested } from "class-validator";

class FaqItemDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class UpdateFaqDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items!: FaqItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  itemsEn!: FaqItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  itemsZh!: FaqItemDto[];

  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;
}
