import { GeoRecommendationStatus } from "@prisma/client";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateGeoRecommendationDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  query?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  pagePath?: string;

  @IsString()
  recommendation!: string;

  @IsString()
  recommendationType!: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: GeoRecommendationStatus;
}
