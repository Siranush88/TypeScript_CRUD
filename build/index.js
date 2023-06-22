var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import { Worker } from 'worker_threads';
import { readdir } from 'fs/promises';
export default function CsvToJson(directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        // const directoryPath = process.argv[2];
        // if (process.argv.length < 3) {
        //   console.error('Not given the path to the folder')
        //   process.exit(1)
        // }
        const csvFilesArray = yield readdir(directoryPath);
        let numThreads = 0;
        let x = 0;
        if (csvFilesArray.length <= 10) {
            numThreads = csvFilesArray.length;
        }
        else {
            numThreads = 10;
        }
        const filesPerThread = Math.ceil(csvFilesArray.length / numThreads);
        for (let i = 0; i < numThreads; i++) {
            const worker = new Worker('./build/worker.js');
            ++x;
            worker.on('online', () => {
                const start = i * filesPerThread;
                const end = (i + 1) * filesPerThread;
                for (let j = start; j < end && j < csvFilesArray.length; j++) {
                    const csvFilePath = path.join(directoryPath, csvFilesArray[j]);
                    worker.postMessage(csvFilePath);
                }
            });
            worker.on('message', (message) => {
                const { count, duration } = message;
                console.log(`Parsing ${csvFilesArray[i]} took ${duration} milliseconds to read ${count} lines`);
            });
        }
    });
}
