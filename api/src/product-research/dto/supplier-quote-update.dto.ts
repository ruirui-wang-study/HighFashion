import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class SupplierQuoteUpdateDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  quotedUnitPriceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quotedMoq?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quotedLeadTimeDays?: number;

  @IsOptional()
  @IsString()
  quoteFileUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
