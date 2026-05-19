import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  useCase?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @IsIn(["best", "newest", "price-asc", "price-desc"])
  sort?: "best" | "newest" | "price-asc" | "price-desc";
}
