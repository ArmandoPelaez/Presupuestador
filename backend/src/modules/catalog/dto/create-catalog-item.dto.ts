import { CatalogItemType } from '@prisma/client';
import { Transform } from 'class-transformer';
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

export class CreateCatalogItemDto {
  @IsEnum(CatalogItemType) type!: CatalogItemType;
  @Transform(({ value }: { value: unknown }) => String(value).trim())
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @Transform(({ value }: { value: unknown }) => String(value).trim())
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  unit!: string;
  @Transform(({ value }: { value: unknown }) => String(value))
  @Matches(decimal, {
    message: 'unitPrice debe ser un importe no negativo con hasta 2 decimales',
  })
  unitPrice!: string;
  @Transform(({ value }: { value: unknown }) => String(value))
  @Matches(percentage, { message: 'taxRate debe estar entre 0 y 100' })
  taxRate!: string;
}
