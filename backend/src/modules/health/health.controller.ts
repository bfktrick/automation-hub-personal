import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

interface HealthResponse {
  status: string;
  timestamp: string;
  dependencies?: Record<string, unknown>;
}

@ApiTags('health')
@Controller('api/v1/health')
export class HealthController {
  @Get()
  health(): HealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('live')
  live(): HealthResponse {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  ready(): HealthResponse {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
