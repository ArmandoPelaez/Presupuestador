import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { seconds, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PublicQuoteDecisionDto } from './dto/public-quote-decision.dto';
import { QuoteShareLinkService } from './quote-share-link.service';

@Controller('public/quotes')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: seconds(60) } })
export class PublicQuotesController {
  constructor(private readonly shares: QuoteShareLinkService) {}

  @Get(':token')
  get(@Param('token') token: string) {
    return this.shares.getPublicQuote(token);
  }

  @Post(':token/decision')
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  decide(@Param('token') token: string, @Body() dto: PublicQuoteDecisionDto) {
    return this.shares.submitDecision(token, dto.decision, dto.comment);
  }
}
