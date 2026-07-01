import { CatalogItemType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
const decimal = /^\d{1,12}(\.\d{1,2})?$/;
const percentage = /^(100(?:\.0{1,2})?|\d{1,2}(?:\.\d{1,2})?)$/;
export class UpdateCatalogItemDto {
  @IsOptional() @IsEnum(CatalogItemType) type?: CatalogItemType;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(30) unit?: string;
  @IsOptional() @Matches(decimal) unitPrice?: string;
  @IsOptional() @Matches(percentage) taxRate?: string;
}
