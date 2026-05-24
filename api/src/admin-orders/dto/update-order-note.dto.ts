import { IsString, MinLength } from "class-validator";

export class UpdateOrderNoteDto {
  @IsString()
  @MinLength(1)
  note!: string;
}
