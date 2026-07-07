import { QuoteStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
export class UpdateStatusDto {
  @IsEnum(QuoteStatus) status!: QuoteStatus;
}
