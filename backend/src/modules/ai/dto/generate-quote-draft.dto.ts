import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH } from '../quote-draft.constants';

export class GenerateQuoteDraftDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(10)
  @MaxLength(AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH)
  description!: string;
}

export interface AiQuoteDraftItemDto {
  description: string;
  quantity: number;
  unit: string;
  catalogMatchId: string | null;
}

export interface GenerateQuoteDraftResponseDto {
  customerName: string;
  customerMatchId: string | null;
  items: AiQuoteDraftItemDto[];
  notes: string;
  validUntilDays: number | null;
  warnings: string[];
}
