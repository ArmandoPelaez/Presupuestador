import { Module } from '@nestjs/common';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { openAiClientProvider } from './openai-client.provider';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ThrottlerModule.forRoot([{ ttl: seconds(60), limit: 10 }]),
  ],
  controllers: [AiController],
  providers: [AiService, openAiClientProvider],
  exports: [AiService],
})
export class AiModule {}
