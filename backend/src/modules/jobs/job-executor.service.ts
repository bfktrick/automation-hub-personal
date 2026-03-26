import { Injectable } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { HttpIntegrationService } from '../integrations/http-integration.service';
import { OpenAiIntegrationService } from '../integrations/openai-integration.service';
import { TelegramIntegrationService } from '../integrations/telegram-integration.service';
import { EmailIntegrationService } from '../integrations/email-integration.service';

@Injectable()
export class JobExecutorService {
  constructor(
    private logsService: LogsService,
    private httpIntegration: HttpIntegrationService,
    private openAiIntegration: OpenAiIntegrationService,
    private telegramIntegration: TelegramIntegrationService,
    private emailIntegration: EmailIntegrationService,
  ) {}

  async execute(automation: any, triggeredBy: string) {
    // Create log entry
    const log = await this.logsService.createLog(automation.id, triggeredBy);

    try {
      let result;

      // Execute based on action type
      switch (automation.action.type) {
        case 'http':
          result = await this.httpIntegration.execute(automation.action.config);
          break;
        case 'openai':
          result = await this.openAiIntegration.execute(automation.action.config);
          break;
        case 'telegram':
          result = await this.telegramIntegration.execute(automation.action.config);
          break;
        case 'email':
          result = await this.emailIntegration.execute(automation.action.config);
          break;
        case 'js_script':
          throw new Error('JS script execution not yet implemented');
        default:
          throw new Error(`Unknown action type: ${automation.action.type}`);
      }

      // Complete log with success
      await this.logsService.completeLog(log.id, 'success', result);

      return { success: true, logId: log.id, result };
    } catch (error) {
      // Complete log with error
      await this.logsService.completeLog(
        log.id,
        'error',
        null,
        error instanceof Error ? error.message : String(error),
      );

      return { success: false, logId: log.id, error: error instanceof Error ? error.message : String(error) };
    }
  }

}
