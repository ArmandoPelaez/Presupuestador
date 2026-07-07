import { CatalogItemType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const decimal = /^\d{1,12}(\.\d{1,2})?$/;

export class CreateCatalogItemDto {
  @IsEnum(CatalogItemType) type!: CatalogItemType;
  @Transform(({ value }: { value: unknown }) => String(value).trim())
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
  @Transform(({ value }: { value: unknown }) => String(value))
  @Matches(decimal, {
    message: 'unitPrice debe ser un importe no negativo con hasta 2 decimales',
  })
  unitPrice!: string;
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt({ message: 'stock debe ser un número entero' })
  @Min(0, { message: 'stock no puede ser negativo' })
  stock!: number;
}
