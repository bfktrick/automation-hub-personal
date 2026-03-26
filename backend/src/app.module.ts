import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { envValidation } from './core/config/env.validation';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { LogsModule } from './modules/logs/logs.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    HealthModule,
    AutomationsModule,
    LogsModule,
    JobsModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
