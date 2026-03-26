"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = void 0;
exports.createRequestContext = createRequestContext;
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
class RequestContext {
    static set(key, value) {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store[key] = value;
        }
    }
    static get(key) {
        const store = asyncLocalStorage.getStore();
        return store?.[key];
    }
    static getAll() {
        return asyncLocalStorage.getStore();
    }
    static run(initialData, callback) {
        return asyncLocalStorage.run(initialData, callback);
    }
}
exports.RequestContext = RequestContext;
function createRequestContext() {
    return {
        requestId: generateRequestId(),
    };
}
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=request-context.js.map