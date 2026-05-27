import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CandidateQueryDto {
  @ApiPropertyOptional()
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
  @IsIn(["SAMPLE", "TEST", "WATCH", "REJECT", "REVIEW", "APPROVE"])
  recommendedAction?: string;

  @IsOptional()
  @IsIn(["LOW", "MEDIUM", "HIGH", "BLOCKING"])
  riskSeverity?: string;

  @IsOptional()
  @IsIn(["score-desc", "score-asc", "created-desc", "created-asc", "updated-desc", "updated-asc"])
  sort?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
