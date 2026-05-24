import { IsIn, IsOptional, IsString } from "class-validator";
import { ProductStatus } from "@prisma/client";

export class AdminProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(Object.values(ProductStatus))
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(["all", "in", "low", "out"])
  stock?: "all" | "in" | "low" | "out";
}
