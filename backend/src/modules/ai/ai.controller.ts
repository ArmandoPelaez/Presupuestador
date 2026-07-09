import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { seconds, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateQuoteDraftDto } from './dto/generate-quote-draft.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('quote-drafts')
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  generateQuoteDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateQuoteDraftDto,
  ) {
    return this.ai.generateQuoteDraft(user.id, dto);
  }
}
