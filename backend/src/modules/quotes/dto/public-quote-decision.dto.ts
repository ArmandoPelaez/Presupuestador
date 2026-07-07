import { QuoteDecision } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class PublicQuoteDecisionDto {
  @IsEnum(QuoteDecision)
  decision!: QuoteDecision;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => String(value).trim())
  @IsString()
  @MaxLength(5000)
  comment?: string;
}
