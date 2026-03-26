import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { JobExecutorService } from '../jobs/job-executor.service';

@Injectable()
export class AutomationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => JobExecutorService))
    private jobExecutor: JobExecutorService,
  ) {}

  async create(createAutomationDto: CreateAutomationDto) {
    return this.prisma.automation.create({
      data: {
        name: createAutomationDto.name,
        description: createAutomationDto.description,
        trigger: createAutomationDto.trigger,
        action: createAutomationDto.action,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.automation.findMany({
      include: {
        logs: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
      include: {
        logs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!automation) {
      throw new NotFoundException(`Automation with ID ${id} not found`);
    }

    return automation;
  }

  async update(id: string, updateAutomationDto: UpdateAutomationDto) {
    const automation = await this.findOne(id);

    return this.prisma.automation.update({
      where: { id },
      data: {
        name: updateAutomationDto.name || automation.name,
        description: updateAutomationDto.description || automation.description,
        trigger: updateAutomationDto.trigger || automation.trigger,
        action: updateAutomationDto.action || automation.action,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.automation.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const automation = await this.findOne(id);

    return this.prisma.automation.update({
      where: { id },
      data: { isActive: !automation.isActive },
    });
  }

  async executeNow(id: string) {
    const automation = await this.findOne(id);

    // Trigger execution asynchronously
    let logId: string;
    this.jobExecutor.execute(automation, 'manual').then((result) => {
      logId = result.logId;
    }).catch((error) => {
      console.error(`Failed to execute automation ${id}:`, error);
    });

    // Return immediately with a message that execution has started
    // The actual execution happens in the background
    return {
      message: 'Execution started',
    };
  }
}
