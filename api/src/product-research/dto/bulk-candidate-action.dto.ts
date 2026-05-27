import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class BulkCandidateActionDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
