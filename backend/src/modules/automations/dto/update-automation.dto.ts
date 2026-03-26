import { IsString, IsObject, IsOptional } from 'class-validator';

export class UpdateAutomationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  trigger?: {
    type: 'cron' | 'manual' | 'webhook' | 'interval';
    config: Record<string, any>;
  };

  @IsOptional()
  @IsObject()
  action?: {
    type: 'http' | 'openai' | 'telegram' | 'email' | 'js_script';
    config: Record<string, any>;
  };
}
