import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JobExecutorService } from '../jobs/job-executor.service';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => JobExecutorService))
    private jobExecutor: JobExecutorService,
  ) {}

  async executeAutomation(automationId: string, payload: any) {
    // Find the automation
    const automation = await this.prisma.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation) {
      throw new NotFoundException(`Automation with ID ${automationId} not found`);
    }

    if (!automation.isActive) {
      throw new NotFoundException(
        `Automation with ID ${automationId} is not active`,
      );
    }

    // Trigger execution asynchronously
    this.jobExecutor.execute(automation, 'webhook').catch((error) => {
      console.error(`Failed to execute automation ${automationId}:`, error);
    });

    return {
      message: 'Webhook received, execution started',
      automationId,
    };
  }
}
