import { TelemetryEnablerRunner } from "./testcases/definitions";
import { RegistryTelemetryEnablerVariant } from "./testcases/implementations/registry";
import { Executable } from "./types";
import { generateCombinations } from "./utils";


const configTC001: any = {
    fixed: {
        concurrentUsers: 1,
        requests: 200,
        requestDelay: 5000
    },
    combinations: {
        telemetryInApp: [true, false],
        ordersOfMagnitude: [1, 10, 100]
    }
}
const variants = generateCombinations(configTC001);

// //Run tests registry app
// variants.forEach((variant: any) => {

//     let registryTC001Config = variant;
//     const registryVariant = new RegistryTelemetryEnablerVariant(registryTC001Config);

//     const registryTC001: Executable = new TelemetryEnablerRunner(registryVariant);
//     registryTC001.run();
// });