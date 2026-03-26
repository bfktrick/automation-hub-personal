import { LogsService } from '../logs/logs.service';
export declare class JobExecutorService {
    private logsService;
    constructor(logsService: LogsService);
    execute(automation: any, triggeredBy: string): Promise<{
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
    private executeHttpAction;
    private executeOpenAiAction;
    private executeTelegramAction;
    private executeEmailAction;
    private executeJsScriptAction;
}
//# sourceMappingURL=job-executor.service.d.ts.map