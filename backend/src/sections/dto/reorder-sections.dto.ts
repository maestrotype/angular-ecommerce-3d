
import { IsArray, IsNumber } from 'class-validator';

export class ReorderSectionsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  sectionIds: number[];
}
