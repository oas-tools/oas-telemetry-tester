import axios from "axios";
import { HeapAndResponseTimesConfig, TestConfig } from "../../types";
import { checkTelemetryEndpoint, executeCommand, getCookie } from "../../utils";
import { startDockerStats, stopDockerStats } from "../../utils/dockerStats";
import { logger } from "../../utils/logger";
import { TelemetryEnabler } from "../definitions";
import { getHeapStatsAndResopnseTimes } from "../../utils/apiPecker";


export class KSTelemetryEnabler extends TelemetryEnabler {

    startApp(): Promise<void> {
        return _startApp(this.config.index);
    }
    checkAppStarted(): Promise<boolean> {
        return _checkAppStarted(this.config.baseURL);
    }
    checkTelemetryStatus(): Promise<boolean> {
        return checkTelemetryEndpoint(this.config.baseURL + "/telemetry/list", 200);
    }
    runTests(): Promise<void> {
        return _runTests(this.config);
    }
    stopApp(): Promise<void> {
        return _stopDockerContainer(this.config.index);
    }
    startTelemetry(): Promise<void> {
        return axios.get(`${this.config.baseURL}/telemetry/start`, { headers: { 'Cookie': getCookie() } });
    }
}

async function _startApp(index: string): Promise<void> {
    await _stopDockerContainer(index);
    let DOCKER_START_COMMAND = `docker run -d --name oastlm-test-ks-api -p 8080:8080 -e INDEX_SELECTOR=${index} --memory="2g" --memory-swap="2g" oastlm-test-ks-api`;
    if (index === "Jaeger") {
        let startJaegerCommand = `docker run -d --name jaeger \
        -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
        -p 5775:5775/udp \
        -p 6831:6831/udp \
        -p 6832:6832/udp \
        -p 5778:5778 \
        -p 16686:16686 \
        -p 14268:14268 \
        -p 9411:9411 \
        --memory="2g" \
        --memory-swap="2g" \
        jaegertracing/all-in-one:1.6.0`
        await executeCommand(startJaegerCommand);
    }
    await executeCommand(DOCKER_START_COMMAND);
    logger.log('Docker containers started successfully.');
    return Promise.resolve();
}

async function _checkAppStarted(baseURL: string): Promise<boolean> {
    //Polling the endpoint until it returns 200
    const MAX_SECONDS = 100;
    const INTERVAL = 1000;
    let i = 0;
    while (i < MAX_SECONDS) {
        try {
            await axios.get(baseURL);
            logger.log('App started successfully.');
            return true;
        } catch (error) {
            logger.log('Waiting for app to start...');
        }
        await new Promise(resolve => setTimeout(resolve, INTERVAL));
        i++;
    }
    return false;
}

async function _stopDockerContainer(index: string): Promise<void> {
    try {
        await executeCommand("docker rm -f oastlm-test-ks-api");
        logger.log('Docker container "oastlm-test-ks-api" stopped successfully.');
        if (index === "Jaeger") {
            let stopJaegerCommand = ``
            await executeCommand("docker rm -f jaeger");
            logger.log('Docker container "jaeger" stopped successfully.');
        }

    } catch (error) {
        logger.error('Failed to stop Docker container:', error.message);
    }
}

function myUrlBuilder(baseULR: string, problemSizeA: Number, problemSizeB: Number): string {
    return baseULR + "/api/v1/stress/" + problemSizeA + "/" + problemSizeB;
}

async function _runTests(config: TestConfig): Promise<void> {
    config.containerName = "oastlm-test-ks-api";
    await startDockerStats(config);
    if (config.index === "Jaeger") {
        let newConfig = { ...config, containerName: "jaeger" };
        startDockerStats(newConfig,false); //Skip header (already printed), do not await (Data will be misplaced)
    }
    const responseTime = config.orderOfMagnitude.secureResponseTime;
    let url = myUrlBuilder(config.baseURL, config.orderOfMagnitude.value, config.orderOfMagnitude.value);
    let runConfig: HeapAndResponseTimesConfig = { requests: config.orderOfMagnitude.requests, url, delay: responseTime };
    await getHeapStatsAndResopnseTimes(config, runConfig);
    stopDockerStats(config.containerName);
    if (config.index === "Jaeger") stopDockerStats("jaeger");
    await new Promise(resolve => setTimeout(resolve, 500));//cool down between tests
}
