import { OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JobExecutorService } from './job-executor.service';
export declare class JobsService implements OnModuleInit {
    private schedulerRegistry;
    private prisma;
    private jobExecutor;
    private readonly logger;
    private registeredJobs;
    constructor(schedulerRegistry: SchedulerRegistry, prisma: PrismaService, jobExecutor: JobExecutorService);
    onModuleInit(): Promise<void>;
    private registerAllCronJobs;
    registerCronJob(automation: any): Promise<void>;
    unregisterCronJob(automationId: string): Promise<void>;
    reloadAutomation(automation: any): Promise<void>;
    executeNow(automationId: string): Promise<{
        success: boolean;
        logId: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        logId: string;
        error: string;
        result?: undefined;
    }>;
    getRegisteredJobs(): {
        count: number;
        jobs: string[];
    };
}
//# sourceMappingURL=jobs.service.d.ts.map