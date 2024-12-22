import dotenv from 'dotenv';
dotenv.config();// Load environment variables from .env file
import { TestCaseConfig, orderOfMagnitude } from "./types";
import { runTestCase } from "./utils";
import { KSTelemetryEnabler } from './testcases/implementations/ks-api';
import { logger } from './utils/logger';


const ordersOfMagnitude: orderOfMagnitude[] = [
    {
        value: 2,
        name: "small",
        estimatedResponseTime: 1,
        secureResponseTime: 200,
        requests: 200
        
    },
    {
        value: 6000,
        name: "medium",
        estimatedResponseTime: 10,
        secureResponseTime: 200,
        requests: 200
    },
    {
        value: 88000,
        name: "large",
        estimatedResponseTime: 100,
        secureResponseTime: 200,
        requests: 200
    }
]

//flattened properites of the config object to be printed in the csv
let printableProperties = ["testname","repeatTestCount","index", "orderOfMagnitude.name", "orderOfMagnitude.value","orderOfMagnitude.estimatedResponseTime","orderOfMagnitude.secureResponseTime", "baseURL", "concurrentUsers",];

//order of the parameters matters for the csv output header
const ksApiConfig: TestCaseConfig = {
    fixed: {
        testname: "Jaeger Comparison",
        baseURL: "http://localhost:8080",
        repeatTestCount: 3,
        concurrentUsers: 1,
        printableProperties: printableProperties,
    },
    combinations: {
        index: [ //Different index.js executed in the ks-api container
            "Telemetry", // oas-telemetry package
            "", //ks-api without telemetry
            "Jaeger", //Jaeger using open-telemetry + jaeger all-in-one
            // "TelemetryRouterLast", //No improvement detected
            // "TelemetryDisabled", 
            // "TelemetryNoAuth",  //No improvement detected
            // "Db", // Debugging purposes, see oas-telemetry/test/performance/ for more info
        ], 
        orderOfMagnitude: ordersOfMagnitude 
    },
}


// logger.writeToFile = true;

//TC-001 Registry works for linux only (see implementation)
async function runTests() {

    await runTestCase(new KSTelemetryEnabler(), ksApiConfig);
}
runTests();