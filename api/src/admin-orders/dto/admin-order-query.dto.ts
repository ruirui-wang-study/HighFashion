import { Transform } from "class-transformer";
import { FulfillmentStatus, PaymentStatus } from "@prisma/client";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";

export class AdminOrderQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
  search?: string;

  @IsOptional()
  @IsIn(Object.values(PaymentStatus))
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsIn(Object.values(FulfillmentStatus))
  fulfillmentStatus?: FulfillmentStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
