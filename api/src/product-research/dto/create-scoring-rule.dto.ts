import { IsBoolean, IsNotEmptyObject, IsOptional, IsString } from "class-validator";

export class CreateScoringRuleDto {
  @IsString()
  version!: string;

  @IsNotEmptyObject()
  weights!: Record<string, number>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
