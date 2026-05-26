import { IsArray, IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class SupplierQuoteImportPreviewDto {
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

export class SupplierQuoteImportCommitDto {
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
