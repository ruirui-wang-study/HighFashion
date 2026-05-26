import { IsIn, IsOptional, IsString } from "class-validator";

export class CandidateQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(["NEW", "RESEARCHING", "WATCH", "SAMPLE", "TEST", "APPROVED", "REJECTED", "HIGH_RISK_REVIEW"])
  status?: string;

  @IsOptional()
  @IsIn(["MANUAL", "AI_GENERATED", "CSV", "ALIBABA_LINK", "SUPPLIER_QUOTE"])
  source?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  targetMarket?: string;

  @IsOptional()
  @IsIn(["SAMPLE", "TEST", "WATCH", "REJECT", "REVIEW"])
  recommendedAction?: string;

  @IsOptional()
  @IsIn(["LOW", "MEDIUM", "HIGH", "BLOCKING"])
  riskSeverity?: string;

  @IsOptional()
  @IsIn(["score-desc", "score-asc", "created-desc", "created-asc", "updated-desc", "updated-asc"])
  sort?: string;
}
