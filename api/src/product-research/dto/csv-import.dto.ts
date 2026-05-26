import { IsArray, IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class CsvImportPreviewDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsArray()
  rows?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsObject()
  mapping?: Record<string, string>;
}

export class CsvImportCommitDto {
  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsArray()
  rows?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsIn(["merge", "skip", "create_anyway"])
  action?: "merge" | "skip" | "create_anyway";
}
