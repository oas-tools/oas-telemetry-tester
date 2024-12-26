import * as http from 'http';
import * as fs from 'fs';
import { ArrayConfig, flattenObject } from '.';
import { logger } from './logger';

let statsData: any[] = []; // Array to store the streamed metrics
let activeRequests = {};

function getContainerId(name: string): string {
    return name; // Docker stats works with container name
}
function startStreamingDockerStats(configColums: {
    printableProperties?: string[],
    containerName: string,
    [key: string]: any
}, addHeader: boolean): void {
    logger.log('Starting to stream Docker stats...');
    const options: http.RequestOptions = {
        socketPath: '/var/run/docker.sock',
        path: `/containers/${configColums.containerName}/stats?stream=true`,
        method: 'GET',
    };
    logger.log('Checking OS...' + process.env.CURRENT_OS);
    if (process.env.CURRENT_OS == 'windows') {
        logger.log('Windows OS detected, changing socketPath to host and port');
        delete options.socketPath;
        options.host = 'localhost';
        options.port = 2375;
    }
    let flattenColumns = flattenObject(configColums, { arrays: ArrayConfig.SKIP });
    let printableObject = { ...flattenColumns }
    if (configColums.printableProperties) {
        printableObject = {};
        configColums.printableProperties.forEach((prop) => {
            printableObject[prop] = flattenColumns[prop];
        });
    }

    logger.log('Making request to Docker API... for container:', configColums.containerName, "with id:", getContainerId(configColums.containerName));
    let req = http.request(options, (res) => {
        res.on('data', (chunk) => {
            logger.log('Received stats data...');
            try {
                const stats = JSON.parse(chunk.toString());
                const timestamp = new Date().toISOString();
                // This could be missing in iteration 0: precpu_stats.system_cpu_usage,precpu_stats.online_cpus 
                if (stats.precpu_stats?.system_cpu_usage === undefined) stats.precpu_stats.system_cpu_usage = 0;
                if (stats.precpu_stats?.online_cpus === undefined) stats.precpu_stats.online_cpus = 0;
                const data = {
                    timestamp: timestamp,
                    containerName: configColums.containerName,
                    ...printableObject,
                    cpu_stats: stats.cpu_stats,
                    memory_stats: stats.memory_stats,
                    precpu_stats: stats.precpu_stats,
                };
                const flattenData = flattenObject(data, { arrays: ArrayConfig.SKIP });
                // statsData.push(flattenData);
                if (addHeader) {
                    const headers = Object.keys(flattenData);
                    const headerLine = headers.join(',');
                    addLineToCsvFile('outputs/docker-stats.csv', headerLine);
                    addHeader = false;
                }
                const line = Object.keys(flattenData).map((key: string) => flattenData[key]).join(',');
                addLineToCsvFile('outputs/docker-stats.csv', line);

            } catch (error) {
                logger.error('Error parsing stats data:', error);
            }
        });
    });

    activeRequests[configColums.containerName] = req;
    req.on('error', (e) => {
        logger.error(`Problem with request: ${e.message}`);
    });

    req.end();
}

function addLineToCsvFile(filePath: string, line: string) {
    try {
        fs.appendFileSync(filePath, line + '\n', 'utf8');
    } catch (error) {
        logger.error('Failed to add line to CSV file:', error);
    }
}

function saveMetricsCsv(filePath: string = 'outputs/stats') {
    // append date to the file name
    const date = new Date().toISOString().replace(/:/g, '-');
    filePath += `-${date}.csv`; // Append .csv extension to the file path

    try {
        const csvLines: string[] = [];

        if (statsData.length > 0) {
            // Extract the headers dynamically from the first object
            const headers = Object.keys(statsData[0]);
            csvLines.push(headers.join(',')); // Add the header line

            // Iterate over each object in statsData to create data rows
            statsData.forEach((stat) => {
                const values = headers.map((header) => stat[header]); // Map headers to corresponding values
                csvLines.push(values.join(',')); // Add the data row
            });
        }

        // Write all lines to the CSV file
        fs.writeFileSync(filePath, csvLines.join('\n'), 'utf8');
        logger.log(`Metrics saved to CSV at ${filePath}`);
    } catch (error) {
        logger.error('Failed to save metrics to CSV:', error);
    }
}

export async function startDockerStats(configColums: {
    printableProperties?: string[],
    containerName: string,
    [key: string]: any
},addHeader=true): Promise<void> {
    statsData = [];
    startStreamingDockerStats(configColums,addHeader);
    //return await 0.5 seconds to allow the streaming to start
    setTimeout(() => { }, 500);
    return Promise.resolve();
}

export function stopDockerStats(containerName: string): void {
    let req = activeRequests[containerName];
    if (req) {
        req.destroy(); // Properly abort the request
        // saveMetricsCsv('outputs/docker-stats-autosave');
        logger.log("Streaming stopped and metrics saved.");
        delete activeRequests[containerName];
    }
}
