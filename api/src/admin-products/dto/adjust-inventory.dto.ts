import { Type } from "class-transformer";
import { IsInt, IsString } from "class-validator";

export class AdjustInventoryDto {
  @IsString()
  variantId!: string;

  @Type(() => Number)
  @IsInt()
  quantityDelta!: number;

  @IsString()
  reason!: string;
}
