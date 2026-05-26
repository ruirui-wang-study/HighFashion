import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class ScoreManualAdjustmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  finalScore?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
