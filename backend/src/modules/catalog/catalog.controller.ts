import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

@Controller('catalog-items')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly service: CatalogService) {}
  @Get() list(
    @CurrentUser() u: AuthenticatedUser,
    @Query() q: CatalogQueryDto,
  ) {
    return this.service.list(u.id, q);
  }
  @Post() create(
    @CurrentUser() u: AuthenticatedUser,
    @Body() d: CreateCatalogItemDto,
  ) {
    return this.service.create(u.id, d);
  }
  @Get(':id') get(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.service.get(u.id, id);
  }
  @Patch(':id') update(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() d: UpdateCatalogItemDto,
  ) {
    return this.service.update(u.id, id, d);
  }
  @Delete(':id') deactivate(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.service.deactivate(u.id, id);
  }
}
