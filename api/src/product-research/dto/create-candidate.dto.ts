import { IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class CreateCandidateDto {
  @IsString()
  productName!: string;

  @IsOptional()
  @IsString()
  chineseName?: string;

  @IsOptional()
  @IsString()
  slugSuggestion?: string;

  @IsString()
  category!: string;

  @IsString()
  targetMarket!: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  useCase?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  brandAngle?: string;

  @IsOptional()
  @IsString()
  positioningSummary?: string;

  @IsOptional()
  @IsString()
  alibabaKeywords?: string;

  @IsOptional()
  @IsIn(["MANUAL", "AI_GENERATED", "CSV", "ALIBABA_LINK", "SUPPLIER_QUOTE"])
  source?: "MANUAL" | "AI_GENERATED" | "CSV" | "ALIBABA_LINK" | "SUPPLIER_QUOTE";

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsObject()
  rawImportData?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  aiDraftPayload?: Record<string, unknown>;
}
