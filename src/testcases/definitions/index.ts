import { Executable } from "../../types";


export interface TelemetryEnablerVariant {
    config: TelemetryEnablerConfig;
    startApp(): Promise<void>;
    checkAppStarted(): Promise<boolean>;
    checkTelemetryStatus(): Promise<boolean>;
    runTests(): Promise<void>;
    stopApp(): Promise<void>;
}

export interface TelemetryEnablerConfig {
    baseURL: string;
    telemetryInApp: boolean;
    concurrentUsers: number;
    requests: number;
    requestDelay: number;
    ordersOfMagnitude: number;
}

export interface TelemetryIntervalConfig {
    baseURL: string;
    telemetryInApp: boolean;
    concurrentUsers: number;
    requests: number;
    requestDelay: number;
    ordersOfMagnitude: number;
}

export interface TelemetryIntervalsVariant {
    config: TelemetryIntervalConfig;
    startApp(): Promise<void>;
    checkAppStarted(): Promise<boolean>;
    checkTelemetryStatus(): Promise<boolean>;
    runTests(): Promise<void>;
    stopApp(): Promise<void>;
    startTelemetry(): Promise<void>;
    stopTelemetry(): Promise<void>;
}


export class TelemetryEnablerRunner implements Executable {
    variant: TelemetryEnablerVariant
    constructor(variant: TelemetryEnablerVariant) {
        this.variant = variant;
    }
    run = async () => {
        await this.variant.startApp();
        await this.variant.checkAppStarted();
        await this.variant.checkTelemetryStatus();
        await this.variant.runTests();
        await this.variant.stopApp();
    }
}


export class TelemetryIntervalsRunner implements Executable {
    variant: TelemetryIntervalsVariant
    constructor(variant: TelemetryIntervalsVariant) {
        this.variant = variant;
    }
    run = async () => {
        await this.variant.startApp();
        await this.variant.checkAppStarted();
        await this.variant.checkTelemetryStatus();
        await this.variant.runTests();
        await this.variant.stopTelemetry();
        await this.variant.runTests();
        await this.variant.startTelemetry();
        await this.variant.runTests();
        await this.variant.stopApp();
    }
}
