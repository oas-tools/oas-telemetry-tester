import dotenv from 'dotenv';
dotenv.config();// Load environment variables from .env file
import { TelemetryEnablerRunner } from "./testcases/definitions";
import { registryTelemetryEnablerImpl } from "./testcases/implementations/registry";
import { TestCaseConfig } from "./types";
import { runTestCase } from "./utils";


const configTC001: TestCaseConfig = {
    fixed: {
        baseURL: "http://localhost:5400",
        repeatTestCount: 5,
        concurrentUsers: 1,
        requests: 200,
        requestDelay: 5000
    },
    combinations: {
        telemetryInApp: [true, false],
        ordersOfMagnitude: [1, 10, 100]
    }
}


//TC-001 Registry works for linux only (see implementation)
runTestCase(configTC001, new TelemetryEnablerRunner(registryTelemetryEnablerImpl));