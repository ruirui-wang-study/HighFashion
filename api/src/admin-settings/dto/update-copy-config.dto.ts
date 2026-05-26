import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from "class-validator";

class CopyConfigItemDto {
  @IsString()
  key!: string;

  @IsOptional()
  value!: unknown;
}

class TemplateConfigItemDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsIn(["ACTIVE", "ARCHIVED"])
  status?: string;
}

class LocalizedCopyConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CopyConfigItemDto)
  en!: CopyConfigItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CopyConfigItemDto)
  zh!: CopyConfigItemDto[];
}

export class UpdateCopyConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CopyConfigItemDto)
  siteSettings!: CopyConfigItemDto[];

  @ValidateNested()
  @Type(() => LocalizedCopyConfigDto)
  uiCopy!: LocalizedCopyConfigDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateConfigItemDto)
  contentTemplates!: TemplateConfigItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CopyConfigItemDto)
  seoRules!: CopyConfigItemDto[];
}
