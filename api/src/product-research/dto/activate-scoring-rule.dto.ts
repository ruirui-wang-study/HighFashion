import { IsBoolean, IsOptional } from "class-validator";

export class ActivateScoringRuleDto {
  @IsOptional()
  @IsBoolean()
  recalculateExisting?: boolean;
}
