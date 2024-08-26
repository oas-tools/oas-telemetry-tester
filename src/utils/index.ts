import { CombinableParameters } from '../types'; // Adjust the path as necessary
import { exec, ExecException } from 'child_process';
import axios from 'axios';

export const executeCommand = (command:string) => {
    return new Promise((resolve, reject) => {
        exec(command, (error: ExecException | null, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                resolve(stderr);
            }
            resolve(stdout);
        });
    });
}

export const checkTelemetryEndpoint = async (URL:string,expectedStatus:number) => {
    try {
        const response = await axios.get(URL);
        if (response.status !== expectedStatus) {
            throw new Error(`Expected status ${expectedStatus} but got ${response.status}`);
        }
        return true;
    } catch (error: Error | any) {
        throw new Error(`Error checking telemetry endpoint: ${error.message}`);
    }
};

/**
 * 
 * @param parameters An object with keys as parameter names and values as arrays of possible values
 * @returns An array of objects with keys as parameter names and values as the selected values
 */
export function generateCombinations(parameters: { [key:string]: any , combinations: CombinableParameters}): any[] { 
    let variations : any[]= [];
    _generateCombinations(parameters.combinations, 0, {}, variations);
    return variations.map((variation) => {
        return {...parameters.fixed, ...variation};
    });
}

function _generateCombinations(parameters: any, index: number, current: any, variations: any){
    if(index == Object.keys(parameters).length){
        variations.push(current);
        return;
    }
    let key = Object.keys(parameters)[index];
    let values = parameters[key];
    for(let i = 0; i < values.length; i++){
        let newCurrent = {...current};
        newCurrent[key] = values[i];
        _generateCombinations(parameters, index + 1, newCurrent, variations);
    }
}