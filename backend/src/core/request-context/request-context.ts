import { AsyncLocalStorage } from 'async_hooks';

interface RequestContextData {
  requestId: string;
  [key: string]: any;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  static set(key: string, value: any) {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  static get(key: string): any {
    const store = asyncLocalStorage.getStore();
    return store?.[key];
  }

  static getAll(): RequestContextData | undefined {
    return asyncLocalStorage.getStore();
  }

  static run<T>(
    initialData: RequestContextData,
    callback: () => T,
  ): T {
    return asyncLocalStorage.run(initialData, callback);
  }
}

export function createRequestContext(): RequestContextData {
  return {
    requestId: generateRequestId(),
  };
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
