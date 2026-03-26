import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramIntegrationService {
  constructor(private config: ConfigService) {}

  async execute(config: any) {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      throw new Error('Telegram credentials not configured (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)');
    }

    const { message } = config;
    if (!message) {
      throw new Error('Telegram integration requires message');
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(`Telegram API error: ${error.description || 'Unknown error'}`);
      }

      const data = await response.json() as any;
      return {
        messageId: data.result?.message_id,
        chatId: data.result?.chat?.id,
        text: message,
        sent: true,
      };
    } catch (error) {
      throw new Error(`Telegram request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
