import axios from "axios";
import { checkTelemetryEndpoint, executeCommand } from "../../utils";
import { runTests } from "../../utils/apiPecker";
import { TelemetryEnablerConfig, TelemetryEnablerVariant, TelemetryIntervalConfig, TelemetryIntervalsVariant } from "../definitions";

function myUrlBuilder(config: { problemSize: number; baseURL: any; agreementId: any; }) {
    //problemSize is hours. Start date is a year ago, end date is start date + problemSize (in hours)
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString();
    const endDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 + 1000 * 60 * 60 * config.problemSize).toISOString();
    return `${config.baseURL}/agreements/${config.agreementId}/guarantees?from=${startDate}&to=${endDate}&newPeriodsFromGuarantees=false`;
}


export class RegistryTelemetryEnablerVariant implements TelemetryEnablerVariant {
    constructor(config: TelemetryEnablerConfig){
        this.config = config;
    }
    config: TelemetryEnablerConfig;
    startApp(): Promise<void> {
        return _startApp(this.config.telemetryInApp);
    }
    checkAppStarted(): Promise<boolean> {
        return _checkAppStarted(this.config.baseURL);
    }
    checkTelemetryStatus(): Promise<boolean> {
        return checkTelemetryEndpoint(this.config.baseURL + "/telemetry", 200);
    }
    runTests(): Promise<void> {
        return runTests(this.config);
    }
    stopApp(): Promise<void> {
        return Promise.resolve(); //Docker start updates the app. Stopping is not necessary.
    }
}

export class RegistryTelemetryIntervalVariant implements TelemetryIntervalsVariant {
    constructor(config: TelemetryIntervalConfig){
        this.config = config;
    }
    config: TelemetryIntervalConfig;
    startApp(): Promise<void> {
        return _startApp(this.config.telemetryInApp);
    }
    checkAppStarted(): Promise<boolean> {
        return _checkAppStarted(this.config.baseURL);
    }
    checkTelemetryStatus(): Promise<boolean> {
        return checkTelemetryEndpoint(this.config.baseURL + "/telemetry", 200);
    }
    runTests(): Promise<void> {
        let requests = this.config.requests/3;
        let config = {...this.config, requests};
        return runTests(config);
    }
    startTelemetry(): Promise<void> {
        return axios.post(`${this.config.baseURL}/telemetry/start`);
    }
    stopTelemetry(): Promise<void> {
        return axios.post(`${this.config.baseURL}/telemetry/stop`);
    }
    stopApp(): Promise<void> {
        return Promise.resolve(); //Docker start updates the app. Stopping is not necessary.
    }

}




async function _startApp(telemetryInApp:boolean): Promise<void> {
    const dockerfilePath= "../../bluejay/bluejay-infrastructure/docker-bluejay/docker-compose.yaml" 
    const envPath= "../../bluejay/bluejay-infrastructure/.env"
    const DOCKER_START_COMMAND = `set NEW_RELIC_LICENSE_KEY="" && set TELEMETRY_ENABLED=${telemetryInApp} && docker-compose -f ${dockerfilePath} --env-file ${envPath} up -d bluejay-registry`;

    await executeCommand(DOCKER_START_COMMAND);
    console.log('Docker containers started successfully.');

}

async function _checkAppStarted(baseURL:string): Promise<boolean> {
    const response = await axios.get(baseURL);
    return response.status === 200;
}


