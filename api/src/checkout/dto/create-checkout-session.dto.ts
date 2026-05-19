import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEmail, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CheckoutItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateCheckoutSessionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
