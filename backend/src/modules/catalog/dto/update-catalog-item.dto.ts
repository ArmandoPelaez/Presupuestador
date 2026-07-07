import { CatalogItemType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
const decimal = /^\d{1,12}(\.\d{1,2})?$/;
export class UpdateCatalogItemDto {
  @IsOptional() @IsEnum(CatalogItemType) type?: CatalogItemType;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) name?: string;
  @IsOptional() @Matches(decimal) unitPrice?: string;
  @IsOptional() @IsInt() @Min(0) stock?: number;
}
