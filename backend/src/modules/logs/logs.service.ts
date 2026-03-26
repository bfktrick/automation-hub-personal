import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(automationId?: string, status?: string, limit = 50, offset = 0) {
    const where: any = {};
    if (automationId) where.automationId = automationId;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      this.prisma.executionLog.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.executionLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.executionLog.findUnique({
      where: { id },
      include: {
        automation: true,
      },
    });

    if (!log) {
      throw new NotFoundException(`Execution log with ID ${id} not found`);
    }

    return log;
  }

  async createLog(automationId: string, triggeredBy: string) {
    return this.prisma.executionLog.create({
      data: {
        automationId,
        status: 'running',
        triggeredBy,
      },
    });
  }

  async completeLog(id: string, status: 'success' | 'error', output?: any, error?: string) {
    const log = await this.findOne(id);
    const startedAt = new Date(log.startedAt);
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    return this.prisma.executionLog.update({
      where: { id },
      data: {
        status,
        finishedAt,
        durationMs,
        output: output || null,
        error: error || null,
      },
    });
  }

  async cleanup(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.executionLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
