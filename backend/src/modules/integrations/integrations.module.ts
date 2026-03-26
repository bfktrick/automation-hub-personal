import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpIntegrationService } from './http-integration.service';
import { OpenAiIntegrationService } from './openai-integration.service';
import { TelegramIntegrationService } from './telegram-integration.service';
import { EmailIntegrationService } from './email-integration.service';

@Module({
  imports: [HttpModule],
  providers: [
    HttpIntegrationService,
    OpenAiIntegrationService,
    TelegramIntegrationService,
    EmailIntegrationService,
  ],
  exports: [
    HttpIntegrationService,
    OpenAiIntegrationService,
    TelegramIntegrationService,
    EmailIntegrationService,
  ],
})
export class IntegrationsModule {}
