export interface LoginResponse {
  access_token: string;
  email: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    type: 'cron' | 'manual' | 'webhook' | 'interval';
    config: Record<string, any>;
  };
  action: {
    type: 'http' | 'openai' | 'telegram' | 'email' | 'js_script';
    config: Record<string, any>;
  };
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  id: string;
  automationId: string;
  status: 'running' | 'success' | 'error';
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  output?: Record<string, any>;
  error?: string;
  triggeredBy: 'cron' | 'manual' | 'webhook';
  createdAt: string;
}
