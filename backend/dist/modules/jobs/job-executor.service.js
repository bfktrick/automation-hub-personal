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
exports.JobExecutorService = void 0;
const common_1 = require("@nestjs/common");
const logs_service_1 = require("../logs/logs.service");
let JobExecutorService = class JobExecutorService {
    constructor(logsService) {
        this.logsService = logsService;
    }
    async execute(automation, triggeredBy) {
        // Create log entry
        const log = await this.logsService.createLog(automation.id, triggeredBy);
        try {
            let result;
            // Execute based on action type
            switch (automation.action.type) {
                case 'http':
                    result = await this.executeHttpAction(automation.action.config);
                    break;
                case 'openai':
                    result = await this.executeOpenAiAction(automation.action.config);
                    break;
                case 'telegram':
                    result = await this.executeTelegramAction(automation.action.config);
                    break;
                case 'email':
                    result = await this.executeEmailAction(automation.action.config);
                    break;
                case 'js_script':
                    result = await this.executeJsScriptAction(automation.action.config);
                    break;
                default:
                    throw new Error(`Unknown action type: ${automation.action.type}`);
            }
            // Complete log with success
            await this.logsService.completeLog(log.id, 'success', result);
            return { success: true, logId: log.id, result };
        }
        catch (error) {
            // Complete log with error
            await this.logsService.completeLog(log.id, 'error', null, error instanceof Error ? error.message : String(error));
            return { success: false, logId: log.id, error: error instanceof Error ? error.message : String(error) };
        }
    }
    async executeHttpAction(config) {
        const { url, method = 'GET', headers, body } = config;
        if (!url)
            throw new Error('HTTP action requires URL');
        const response = await fetch(url, {
            method,
            headers: headers || {},
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return { status: response.status, data };
    }
    async executeOpenAiAction(config) {
        // Placeholder - requires OPENAI_API_KEY env var
        const { prompt } = config;
        if (!prompt)
            throw new Error('OpenAI action requires prompt');
        // TODO: Implement actual OpenAI call
        return { message: 'OpenAI action queued (not yet implemented)', prompt };
    }
    async executeTelegramAction(config) {
        // Placeholder - requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
        const { message } = config;
        if (!message)
            throw new Error('Telegram action requires message');
        // TODO: Implement actual Telegram call
        return { message: 'Telegram message queued (not yet implemented)', content: message };
    }
    async executeEmailAction(config) {
        // Placeholder
        const { to, subject, body } = config;
        if (!to || !subject)
            throw new Error('Email action requires to and subject');
        // TODO: Implement actual email sending
        return { message: 'Email queued (not yet implemented)', to, subject };
    }
    async executeJsScriptAction(config) {
        // Placeholder - security risk, handle carefully
        const { script } = config;
        if (!script)
            throw new Error('JS action requires script');
        // TODO: Implement safe sandbox for JS execution
        return { message: 'JS script execution not yet implemented', script };
    }
};
exports.JobExecutorService = JobExecutorService;
exports.JobExecutorService = JobExecutorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], JobExecutorService);
//# sourceMappingURL=job-executor.service.js.map