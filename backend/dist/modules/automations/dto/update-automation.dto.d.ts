export declare class UpdateAutomationDto {
    name?: string;
    description?: string;
    trigger?: {
        type: 'cron' | 'manual' | 'webhook' | 'interval';
        config: Record<string, any>;
    };
    action?: {
        type: 'http' | 'openai' | 'telegram' | 'email' | 'js_script';
        config: Record<string, any>;
    };
}
//# sourceMappingURL=update-automation.dto.d.ts.map