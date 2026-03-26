import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiIntegrationService {
  constructor(private config: ConfigService) {}

  async execute(config: any) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt, model = 'gpt-4o-mini', maxTokens = 100, temperature = 0.7 } = config;

    if (!prompt) {
      throw new Error('OpenAI integration requires prompt');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json() as any;
      const responseText = data.choices?.[0]?.message?.content || '';

      return {
        model,
        prompt,
        response: responseText,
        usage: data.usage,
      };
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
