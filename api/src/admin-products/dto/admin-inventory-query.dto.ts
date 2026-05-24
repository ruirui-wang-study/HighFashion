import { IsIn, IsOptional, IsString } from "class-validator";

export class AdminInventoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(["all", "in", "low", "out"])
  stock?: "all" | "in" | "low" | "out";
}
