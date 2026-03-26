"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("@nestjs/schedule/node_modules/cron");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const job_executor_service_1 = require("./job-executor.service");
let JobsService = JobsService_1 = class JobsService {
    constructor(schedulerRegistry, prisma, jobExecutor) {
        this.schedulerRegistry = schedulerRegistry;
        this.prisma = prisma;
        this.jobExecutor = jobExecutor;
        this.logger = new common_1.Logger(JobsService_1.name);
        this.registeredJobs = new Set();
    }
    async onModuleInit() {
        // Register all active cron jobs on startup
        await this.registerAllCronJobs();
    }
    async registerAllCronJobs() {
        try {
            const automations = await this.prisma.automation.findMany({
                where: {
                    isActive: true,
                },
            });
            // Filter for cron jobs in memory
            const cronAutomations = automations.filter((a) => a.trigger && typeof a.trigger === 'object' && a.trigger.type === 'cron');
            for (const automation of cronAutomations) {
                await this.registerCronJob(automation);
            }
            this.logger.log(`✅ Registered ${cronAutomations.length} cron jobs`);
        }
        catch (error) {
            this.logger.error('Failed to register cron jobs', error);
        }
    }
    async registerCronJob(automation) {
        const jobName = `automation-${automation.id}`;
        // Remove existing job if registered
        if (this.registeredJobs.has(jobName)) {
            try {
                this.schedulerRegistry.deleteCronJob(jobName);
                this.registeredJobs.delete(jobName);
            }
            catch (error) {
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
            const job = new cron_1.CronJob(schedule, async () => {
                this.logger.debug(`🔄 Executing cron job for automation ${automation.id}`);
                try {
                    const result = await this.jobExecutor.execute(automation, 'cron');
                    this.logger.debug(`✅ Automation ${automation.id} executed: ${result.success ? 'success' : 'error'}`);
                }
                catch (error) {
                    this.logger.error(`❌ Automation ${automation.id} failed:`, error);
                }
            });
            this.schedulerRegistry.addCronJob(jobName, job);
            job.start();
            this.registeredJobs.add(jobName);
            this.logger.log(`✅ Registered cron job: ${jobName} (${schedule})`);
        }
        catch (error) {
            this.logger.error(`Failed to register cron job ${jobName}:`, error);
        }
    }
    async unregisterCronJob(automationId) {
        const jobName = `automation-${automationId}`;
        try {
            this.schedulerRegistry.deleteCronJob(jobName);
            this.registeredJobs.delete(jobName);
            this.logger.log(`✅ Unregistered cron job: ${jobName}`);
        }
        catch (error) {
            this.logger.warn(`Failed to unregister job ${jobName}`);
        }
    }
    async reloadAutomation(automation) {
        // Unregister old job
        await this.unregisterCronJob(automation.id);
        // Register new job if active
        if (automation.isActive) {
            await this.registerCronJob(automation);
        }
    }
    async executeNow(automationId) {
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
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [schedule_1.SchedulerRegistry,
        prisma_service_1.PrismaService,
        job_executor_service_1.JobExecutorService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map