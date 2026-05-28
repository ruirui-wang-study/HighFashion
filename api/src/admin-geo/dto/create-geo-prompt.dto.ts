import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateGeoPromptDto {
  @IsString()
  @MaxLength(240)
  prompt!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
