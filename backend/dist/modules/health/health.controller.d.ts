interface HealthResponse {
    status: string;
    timestamp: string;
    dependencies?: Record<string, unknown>;
}
export declare class HealthController {
    health(): HealthResponse;
    live(): HealthResponse;
    ready(): HealthResponse;
}
export {};
//# sourceMappingURL=health.controller.d.ts.map