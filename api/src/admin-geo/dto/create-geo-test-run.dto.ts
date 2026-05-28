import { GeoPlatform } from "@prisma/client";
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateGeoTestRunDto {
  @IsEnum(GeoPlatform)
  platform!: GeoPlatform;

  @IsOptional()
  @IsString()
  promptId?: string;

  @IsString()
  @MaxLength(240)
  prompt!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedBrands?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  citedUrls?: string[];

  @IsBoolean()
  whetherPulseGearMentioned!: boolean;

  @IsBoolean()
  whetherPulseGearCited!: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competitorBrands?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
