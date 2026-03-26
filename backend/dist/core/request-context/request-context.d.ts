interface RequestContextData {
    requestId: string;
    [key: string]: any;
}
export declare class RequestContext {
    static set(key: string, value: any): void;
    static get(key: string): any;
    static getAll(): RequestContextData | undefined;
    static run<T>(initialData: RequestContextData, callback: () => T): T;
}
export declare function createRequestContext(): RequestContextData;
export {};
//# sourceMappingURL=request-context.d.ts.map