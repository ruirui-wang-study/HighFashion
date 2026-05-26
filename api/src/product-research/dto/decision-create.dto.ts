import { IsIn, IsOptional, IsString } from "class-validator";

export class DecisionCreateDto {
  @IsOptional()
  @IsIn(["SAMPLE", "TEST", "WATCH", "APPROVE", "REJECT", "CONVERT_TO_PRODUCT"])
  decision?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
