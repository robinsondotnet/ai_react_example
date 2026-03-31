declare module "@adobe/aem-headless-client-js" {
  interface AEMHeadlessConfig {
    serviceURL: string;
    endpoint: string;
    auth?: string;
    headers?: Record<string, string>;
  }

  interface QueryResponse<T> {
    data: T;
    errors?: { message: string }[];
  }

  class AEMHeadless {
    constructor(config: AEMHeadlessConfig);
    runQuery<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<QueryResponse<T>>;
    runPersistedQuery<T = unknown>(path: string, variables?: Record<string, unknown>): Promise<QueryResponse<T>>;
    listPersistedQueries(configName: string): Promise<unknown>;
  }

  export default AEMHeadless;
}
