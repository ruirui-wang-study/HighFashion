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

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items!: FaqItemDto[];

  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;
}
