import { IsOptional, IsString } from "class-validator";

export class ResolveRiskFlagDto {
  @IsOptional()
  @IsString()
  note?: string;
}
