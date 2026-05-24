import { Transform } from "class-transformer";
import { IsIn, IsInt } from "class-validator";

export class AdminSeoQueryDto {
  @Transform(({ value }) => Number(value ?? 7))
  @IsInt()
  @IsIn([7, 30, 90])
  days = 7;
}
