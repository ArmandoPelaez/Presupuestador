import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  Matches,
} from 'class-validator';
const positive = /^(?:0*[1-9]\d*)(?:\.\d{1,4})?$|^0\.\d*[1-9]\d*$/;
const decimal = /^\d{1,12}(\.\d{1,2})?$/;
const percentage = /^(100(?:\.0{1,2})?|\d{1,2}(?:\.\d{1,2})?)$/;

export class QuoteItemDto {
  @IsOptional() @IsString() catalogItemId?: string;
  @IsString() @MaxLength(500) description!: string;
  @Matches(positive) quantity!: string;
  @IsString() @MaxLength(30) unit!: string;
  @Matches(decimal) unitPrice!: string;
  @Matches(percentage) taxRate!: string;
  @IsInt() @Min(0) position!: number;
}

export class CreateQuoteDto {
  @IsString() customerId!: string;
  @IsDateString() issueDate!: string;
  @IsOptional() @IsDateString() validUntil?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsEnum(DiscountType) discountType: DiscountType = DiscountType.NONE;
  @Matches(decimal) discountValue = '0';
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items!: QuoteItemDto[];
}
