import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { JobExecutorService } from './job-executor.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AutomationsModule } from '../automations/automations.module';
import { LogsModule } from '../logs/logs.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, forwardRef(() => AutomationsModule), LogsModule, IntegrationsModule],
  providers: [JobsService, JobExecutorService],
  exports: [JobsService, JobExecutorService],
})
export class JobsModule {}
