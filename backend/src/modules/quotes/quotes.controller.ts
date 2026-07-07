import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PdfService } from './pdf.service';
import { QuotesService } from './quotes.service';
import { QuoteShareLinkService } from './quote-share-link.service';
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(
    private readonly quotes: QuotesService,
    private readonly pdf: PdfService,
    private readonly shares: QuoteShareLinkService,
  ) {}
  @Get() list(@CurrentUser() u: AuthenticatedUser, @Query() q: QuoteQueryDto) {
    return this.quotes.list(u.id, q);
  }
  @Post() async create(
    @CurrentUser() u: AuthenticatedUser,
    @Body() dto: CreateQuoteDto,
  ) {
    const quote = await this.quotes.create(u.id, dto);
    const activeShare = await this.shares.generateForOwner(u.id, quote.id);
    return { ...quote, activeShare };
  }
  @Post(':id/share')
  share(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    return this.shares.generateForOwner(u.id, id);
  }
  @Post(':id/share/copied')
  async copiedShare(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const quote = await this.quotes.get(u.id, id);
    if (quote.status === 'DRAFT') await this.quotes.markSentIfDraft(u.id, id);
    return this.get(u, id);
  }
  @Get(':id') async get(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const quote = await this.quotes.get(u.id, id);
    const activeShare = await this.shares.getForOwner(u.id, id);
    return { ...quote, activeShare };
  }
  @Patch(':id') update(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotes.update(u.id, id, dto);
  }
  @Delete(':id') remove(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.quotes.remove(u.id, id);
  }
  @Patch(':id/status') status(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.quotes.updateStatus(u.id, id, dto.status);
  }
  @Get(':id/pdf') async download(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const quote = await this.quotes.get(u.id, id);
    const buffer = await this.pdf.generate(u.id, quote);
    if (quote.status === 'DRAFT') await this.quotes.markSentIfDraft(u.id, id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="presupuesto-${quote.number}.pdf"`,
    );
    response.send(buffer);
  }
}
