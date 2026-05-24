import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from "class-validator";
import { ProductStatus } from "@prisma/client";

class AdminProductImageInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  url!: string;

  @IsString()
  alt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class AdminProductVariantInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  sku!: string;

  @IsString()
  color!: string;

  @IsString()
  size!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  compareAtPriceCents?: number | null;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weightGrams?: number | null;

  @Type(() => Boolean)
  @IsBoolean()
  active!: boolean;
}

export class UpsertAdminProductDto {
  @IsString()
  title!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  category!: string;

  @IsString()
  shortDescription!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  canonicalUrl?: string | null;

  @IsOptional()
  @IsString()
  ogImageUrl?: string | null;

  @IsOptional()
  @IsString()
  badge?: string | null;

  @IsArray()
  @IsString({ each: true })
  benefits!: string[];

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsArray()
  @IsString({ each: true })
  useCases!: string[];

  @Type(() => Boolean)
  @IsBoolean()
  bundleEligible!: boolean;

  @IsIn(Object.values(ProductStatus))
  status!: ProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminProductImageInputDto)
  images!: AdminProductImageInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminProductVariantInputDto)
  variants!: AdminProductVariantInputDto[];
}

export type AdminProductImageInput = AdminProductImageInputDto;
export type AdminProductVariantInput = AdminProductVariantInputDto;
