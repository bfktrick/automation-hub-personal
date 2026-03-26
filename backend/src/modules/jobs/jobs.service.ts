import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from '@nestjs/schedule/node_modules/cron';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JobExecutorService } from './job-executor.service';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);
  private registeredJobs = new Set<string>();

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private prisma: PrismaService,
    private jobExecutor: JobExecutorService,
  ) {}

  async onModuleInit() {
    // Register all active cron jobs on startup
    await this.registerAllCronJobs();
  }

  private async registerAllCronJobs() {
    try {
      const automations = await this.prisma.automation.findMany({
        where: {
          isActive: true,
        },
      });

      // Filter for cron jobs in memory
      const cronAutomations = automations.filter(
        (a) => a.trigger && typeof a.trigger === 'object' && (a.trigger as any).type === 'cron',
      );

      for (const automation of cronAutomations) {
        await this.registerCronJob(automation);
      }

      this.logger.log(`✅ Registered ${cronAutomations.length} cron jobs`);
    } catch (error) {
      this.logger.error('Failed to register cron jobs', error);
    }
  }

  async registerCronJob(automation: any) {
    const jobName = `automation-${automation.id}`;

    // Remove existing job if registered
    if (this.registeredJobs.has(jobName)) {
      try {
        this.schedulerRegistry.deleteCronJob(jobName);
        this.registeredJobs.delete(jobName);
      } catch (error) {
        this.logger.warn(`Failed to unregister job ${jobName}`);
      }
    }

    // Only register cron jobs
    if (automation.trigger?.type !== 'cron') {
      return;
    }

    const schedule = automation.trigger?.config?.schedule;
    if (!schedule) {
      this.logger.warn(`Automation ${automation.id} has no cron schedule`);
      return;
    }

    try {
      const job = new CronJob(schedule, async () => {
        this.logger.debug(`🔄 Executing cron job for automation ${automation.id}`);
        try {
          const result = await this.jobExecutor.execute(automation, 'cron');
          this.logger.debug(`✅ Automation ${automation.id} executed: ${result.success ? 'success' : 'error'}`);
        } catch (error) {
          this.logger.error(`❌ Automation ${automation.id} failed:`, error);
        }
      });

      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();
      this.registeredJobs.add(jobName);
      this.logger.log(`✅ Registered cron job: ${jobName} (${schedule})`);
    } catch (error) {
      this.logger.error(`Failed to register cron job ${jobName}:`, error);
    }
  }

  async unregisterCronJob(automationId: string) {
    const jobName = `automation-${automationId}`;

    try {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.registeredJobs.delete(jobName);
      this.logger.log(`✅ Unregistered cron job: ${jobName}`);
    } catch (error) {
      this.logger.warn(`Failed to unregister job ${jobName}`);
    }
  }

  async reloadAutomation(automation: any) {
    // Unregister old job
    await this.unregisterCronJob(automation.id);

    // Register new job if active
    if (automation.isActive) {
      await this.registerCronJob(automation);
    }
  }

  async executeNow(automationId: string) {
    const automation = await this.prisma.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation) {
      throw new Error(`Automation ${automationId} not found`);
    }

    return this.jobExecutor.execute(automation, 'manual');
  }

  getRegisteredJobs() {
    return {
      count: this.registeredJobs.size,
      jobs: Array.from(this.registeredJobs),
    };
  }
}
