import { Module } from '@nestjs/common';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PdfService } from './pdf.service';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { QuoteShareLinkService } from './quote-share-link.service';
import { PublicQuotesController } from './public-quotes.controller';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ThrottlerModule.forRoot([{ ttl: seconds(60), limit: 30 }]),
  ],
  controllers: [QuotesController, PublicQuotesController],
  providers: [QuotesService, PdfService, QuoteShareLinkService],
  exports: [QuoteShareLinkService],
})
export class QuotesModule {}
