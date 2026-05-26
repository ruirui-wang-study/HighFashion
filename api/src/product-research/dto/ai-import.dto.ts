import { IsArray, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AiImportPreviewDto {
  @IsOptional()
  @IsString()
  brandDirection?: string;

  @IsOptional()
  @IsString()
  targetMarket?: string;

  @IsOptional()
  @IsArray()
  excludedCategories?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number;
}

export class AiImportCommitDto {
  @IsOptional()
  @IsArray()
  previewItems?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  selectedIndexes?: number[];
}
