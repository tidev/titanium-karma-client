/**
 * Karma unit test runner client for Titanium
 */
interface KarmaClient {
    baseUrl: string;
    startEmitted: boolean;
    config: { [k: string]: any }

    connect(): void;
    executeTestRun(config: any): void;
}

export default KarmaClient;