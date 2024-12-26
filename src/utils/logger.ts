
import fs, { write } from 'fs';
export const logger = {
    outputPath: 'outputs/logs',
    writeToFile: false,
    currentZTime: new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-').replace(/T/g, '-').replace(/Z/g, ''),
    log: function (...message: any) {
        let time = new Date().toISOString();
        console.log(time + ":", ...message);
        if (logger.writeToFile) {
            _logToFile(time + ": " + message);
        }
    },
    //varargs
    error: function (...message: any) {
        let time = new Date().toISOString();
        console.error(time + ":", ...message);
        if (logger.writeToFile) {
            _logToFile(time + ": " + message);
        }
    }
}

const _logToFile = function (message: string) {
    try {
        fs.appendFileSync(logger.outputPath+"/"+logger.currentZTime+".log", message + '\n', 'utf8');
    } catch (error) {
        logger.error('Failed to write to log file:', error);
    }
}