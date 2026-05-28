import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { PaymentMethodCode, ShippingFeeMode, TaxMode } from "@prisma/client";

class TaxRuleInputDto {
  @IsString()
  countryCode!: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  postalCodePattern?: string;

  @IsString()
  currency!: string;

  @IsEnum(TaxMode)
  taxMode!: TaxMode;

  @IsInt()
  @Min(0)
  @Max(10000)
  rateBps!: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class ShippingRuleInputDto {
  @IsString()
  countryCode!: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsString()
  currency!: string;

  @IsEnum(ShippingFeeMode)
  feeMode!: ShippingFeeMode;

  @IsOptional()
  @IsInt()
  @Min(0)
  flatFeeMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  freeOverMinor?: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  etaMinDays?: number;

  @IsOptional()
  @IsInt()
  etaMaxDays?: number;
}

class PaymentRuleInputDto {
  @IsString()
  countryCode!: string;

  @IsString()
  currency!: string;

  @IsEnum(PaymentMethodCode)
  method!: PaymentMethodCode;

  @IsOptional()
  @IsInt()
  @Min(0)
  minAmountMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxAmountMinor?: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpsertCommerceRuleSetDto {
  @IsOptional()
  @IsString()
  ruleSetId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TaxRuleInputDto)
  taxRules!: TaxRuleInputDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShippingRuleInputDto)
  shippingRules!: ShippingRuleInputDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentRuleInputDto)
  paymentRules!: PaymentRuleInputDto[];
}
