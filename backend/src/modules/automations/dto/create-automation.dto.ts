import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateAutomationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  trigger: {
    type: 'cron' | 'manual' | 'webhook' | 'interval';
    config: Record<string, any>;
  };

  @IsObject()
  action: {
    type: 'http' | 'openai' | 'telegram' | 'email' | 'js_script';
    config: Record<string, any>;
  };
}
