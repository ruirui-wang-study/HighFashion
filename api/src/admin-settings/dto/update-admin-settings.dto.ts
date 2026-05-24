import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEmail, IsInt, IsOptional, IsString, IsUrl, Max, Min } from "class-validator";

export class UpdateAdminSettingsDto {
  @IsUrl({ require_tld: false, require_protocol: true })
  storefrontUrl!: string;

  @IsEmail()
  supportEmail!: string;

  @IsString()
  checkoutCurrency!: string;

  @IsString()
  timezone!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  shippingCountries!: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  defaultFulfillmentSlaDays!: number;

  @IsOptional()
  @IsString()
  returnsPolicyUrl?: string | null;

  @IsBoolean()
  orderAutoFulfill!: boolean;

  @IsString()
  primaryPaymentProvider!: string;

  @IsBoolean()
  stripeAutomaticPaymentMethods!: boolean;

  @IsOptional()
  @IsString()
  paymentFailureMessage?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(72)
  adminSessionTtlHours!: number;

  @IsBoolean()
  auditLoggingEnabled!: boolean;
}
