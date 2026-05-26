import { IsArray, IsOptional, IsString } from "class-validator";

export class BulkCandidateActionDto {
  @IsOptional()
  @IsArray()
  ids?: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}
