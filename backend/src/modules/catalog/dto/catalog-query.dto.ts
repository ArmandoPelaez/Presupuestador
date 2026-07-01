import { CatalogItemType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CatalogQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(CatalogItemType) type?: CatalogItemType;
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
