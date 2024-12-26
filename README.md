# oas-telemetry-tester
This repository contains a simple TypeScript tool to test the performance of the OAS-Telemetry package.

## Overview

The project is structured as follows: 

- `src` contains the source code of the project.
- `src/misc` contains miscellaneous code that is not directly related to the main functionality of the project, such as response examples for Docker stats or apiPecker.
- `src/testcases` contains the definitions and implementations of the test cases.
- `src/types` contains the TypeScript types used in the project.
- `src/utils` contains utility functions used in the project.
- `dist` contains the compiled JavaScript code.
- `outputs` contains the output of the tests.

There are multiple index files that can be executed with an npm script.

## Usage

Install the dependencies:

```bash
npm install
```

### Registry tests
When testing oas-tools, we needed a real production environment to test the performance of the package. We used the registry as a real production environment. The registry microservice is part of the [Governify/Bluejay infrastructure](https://docs.bluejay.governify.io/).
You must have the `governify/bluejay-infrastructure` running on your local machine. 
You must have the modified version of the registry with oas-telemetry installed.
```bash
docker pull governify/registry:env-telemetry
npm run start:registry
```

### Jaeger comparison
In these tests, we compare oas-telemetry with Jaeger. We use a Docker image of the ks-api, an Express API that resolves the knapsack problem. 

You must have the `ks-api` image. You can build it with the Dockerfile found in the oas-telemetry repository. A README can be found at [/test/performance/ks-api/dockerizedTests.md](https://github.com/oas-tools/oas-telemetry/blob/main/test/performance/ks-api/dockerizedTests.md).

```bash
npm run start:jaeger
```
