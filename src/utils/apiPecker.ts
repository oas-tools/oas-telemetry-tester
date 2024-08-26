import { run } from 'apipecker';
import fs from 'fs';
import axios from 'axios';
import { HeapStats, ApiPeckerResults } from '../types';



export const runTests = async function (config: any): Promise<void> {
    const { concurrentUsers, requests, delay, problemSize, urlBuilder } = config;

    axios.get(config.baseURL + "/heapStats").then((response) => {
        const heapStatsBefore: HeapStats = response.data;
        return new Promise((resolve, reject) => {
            run({
                concurrentUsers,
                iterations: requests,
                delay: delay,
                verbose: true,
                urlBuilder,
                resultsHandler: (results: any) => myResultsHandler(results, heapStatsBefore, config).then(resolve).catch(reject),
            });
        });
    }).catch((error) => {
        console.log("Error getting heapStats before: " + error.message);
    });
}


async function myResultsHandler(results: ApiPeckerResults, heapStatsBefore: HeapStats, config: { baseURL: string; testname: string; concurrentUsers: any; requests: any; delay: any; problemSize: any; }) : Promise<void> {
    let heapStatsAfter;
    axios.get(config.baseURL + "/heapStats").then((response) => {
        heapStatsAfter = response.data;
        const timestamp = new Date().toISOString();
        const line = `"${config.testname}",${config.concurrentUsers},${config.requests},${config.delay},${config.problemSize},${results.summary.count},${results.summary.min},${results.summary.max},${results.summary.mean},${results.summary.std},${heapStatsBefore.total_heap_size},${heapStatsBefore.total_heap_size_executable},${heapStatsBefore.total_physical_size},${heapStatsBefore.total_available_size},${heapStatsBefore.used_heap_size},${heapStatsBefore.heap_size_limit},${heapStatsBefore.malloced_memory},${heapStatsBefore.peak_malloced_memory},${heapStatsBefore.does_zap_garbage},${heapStatsBefore.number_of_native_contexts},${heapStatsBefore.number_of_detached_contexts},${heapStatsBefore.total_global_handles_size},${heapStatsBefore.used_global_handles_size},${heapStatsBefore.external_memory},${heapStatsAfter.total_heap_size},${heapStatsAfter.total_heap_size_executable},${heapStatsAfter.total_physical_size},${heapStatsAfter.total_available_size},${heapStatsAfter.used_heap_size},${heapStatsAfter.heap_size_limit},${heapStatsAfter.malloced_memory},${heapStatsAfter.peak_malloced_memory},${heapStatsAfter.does_zap_garbage},${heapStatsAfter.number_of_native_contexts},${heapStatsAfter.number_of_detached_contexts},${heapStatsAfter.total_global_handles_size},${heapStatsAfter.used_global_handles_size},${heapStatsAfter.external_memory},${timestamp}\n`;

        fs.writeFileSync("output.csv", line, { flag: 'a+' });
        console.log("Finished " + config.testname);
        Promise.resolve();
    }).catch((error) => {
        console.log("Error getting heapStats after: " + error.message);
        Promise.reject();
    });
}



//Heap stats headers csv: total_heap_size,total_heap_size_executable,total_physical_size,total_available_size,used_heap_size,heap_size_limit,malloced_memory,peak_malloced_memory,does_zap_garbage,number_of_native_contexts,number_of_detached_contexts,total_global_handles_size,used_global_handles_size,external_memory
//Heap after headers csv: total_heap_size_after,total_heap_size_executable_after,total_physical_size_after,total_available_size_after,used_heap_size_after,heap_size_limit_after,malloced_memory_after,peak_malloced_memory_after,does_zap_garbage_after,number_of_native_contexts_after,number_of_detached_contexts_after,total_global_handles_size_after,used_global_handles_size_after,external_memory_after
