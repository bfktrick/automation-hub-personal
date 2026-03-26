import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
export declare class AutomationsController {
    private automationsService;
    constructor(automationsService: AutomationsService);
    create(createAutomationDto: CreateAutomationDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trigger: import("@prisma/client/runtime/library").JsonValue;
        action: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastRunAt: Date | null;
        lastRunStatus: string | null;
    }>;
    findAll(): Promise<({
        logs: {
            error: string | null;
            status: string;
            id: string;
            createdAt: Date;
            automationId: string;
            startedAt: Date;
            finishedAt: Date | null;
            durationMs: number | null;
            output: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredBy: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trigger: import("@prisma/client/runtime/library").JsonValue;
        action: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastRunAt: Date | null;
        lastRunStatus: string | null;
    })[]>;
    findOne(id: string): Promise<{
        logs: {
            error: string | null;
            status: string;
            id: string;
            createdAt: Date;
            automationId: string;
            startedAt: Date;
            finishedAt: Date | null;
            durationMs: number | null;
            output: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredBy: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trigger: import("@prisma/client/runtime/library").JsonValue;
        action: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastRunAt: Date | null;
        lastRunStatus: string | null;
    }>;
    update(id: string, updateAutomationDto: UpdateAutomationDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trigger: import("@prisma/client/runtime/library").JsonValue;
        action: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastRunAt: Date | null;
        lastRunStatus: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trigger: import("@prisma/client/runtime/library").JsonValue;
        action: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastRunAt: Date | null;
        lastRunStatus: string | null;
    }>;
    toggleActive(id: string): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trigger: import("@prisma/client/runtime/library").JsonValue;
        action: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastRunAt: Date | null;
        lastRunStatus: string | null;
    }>;
    executeNow(id: string): Promise<{
        logId: string;
        message: string;
    }>;
}
//# sourceMappingURL=automations.controller.d.ts.map