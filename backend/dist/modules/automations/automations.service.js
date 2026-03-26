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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AutomationsService = class AutomationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAutomationDto) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Automation with ID ${id} not found`);
        }
        return automation;
    }
    async update(id, updateAutomationDto) {
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
    async remove(id) {
        await this.findOne(id);
        return this.prisma.automation.delete({
            where: { id },
        });
    }
    async toggleActive(id) {
        const automation = await this.findOne(id);
        return this.prisma.automation.update({
            where: { id },
            data: { isActive: !automation.isActive },
        });
    }
    async executeNow(id) {
        const automation = await this.findOne(id);
        // Create log entry
        const log = await this.prisma.executionLog.create({
            data: {
                automationId: id,
                status: 'running',
                triggeredBy: 'manual',
            },
        });
        return {
            logId: log.id,
            message: 'Execution started',
        };
    }
};
exports.AutomationsService = AutomationsService;
exports.AutomationsService = AutomationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomationsService);
//# sourceMappingURL=automations.service.js.map