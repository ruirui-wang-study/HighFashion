import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class TestLaunchUpsertDto {
  @IsOptional()
  @IsString()
  landingPageUrl?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  channelDetail?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  adSpendCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  impressions?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  clicks?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  productViews?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  addToCart?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  beginCheckout?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  purchases?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  revenueCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  refunds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  customerFeedbackScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  refundRiskScore?: number;

  @IsOptional()
  @IsString()
  customerFeedbackSummary?: string;

  @IsOptional()
  @IsIn(["PLANNED", "RUNNING", "COMPLETED", "STOPPED"])
  status?: string;

  @IsOptional()
  @IsString()
  startedAt?: string;

  @IsOptional()
  @IsString()
  endedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
