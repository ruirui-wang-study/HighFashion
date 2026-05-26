import { IsArray, IsOptional, IsString } from "class-validator";

export class AlibabaLinkImportPreviewDto {
  @IsOptional()
  @IsArray()
  links?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AlibabaLinkImportCommitDto {
  @IsOptional()
  @IsArray()
  previewItems?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  selectedIndexes?: number[];

  @IsOptional()
  @IsString()
  notes?: string;
}
