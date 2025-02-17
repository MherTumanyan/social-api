import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  age?: number;
}
