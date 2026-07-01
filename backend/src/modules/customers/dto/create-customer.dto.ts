import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimOptional = ({ value }: { value: unknown }) =>
  value === '' || value == null
    ? undefined
    : typeof value === 'string'
      ? value.trim()
      : value;

export class CreateCustomerDto {
  @Transform(({ value }: { value: unknown }) => String(value).trim())
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessName?: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxId?: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
