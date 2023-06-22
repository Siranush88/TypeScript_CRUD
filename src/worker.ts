import { parentPort } from 'worker_threads';
import fs from 'fs';
import csv from 'csv-parser';
import { writeFile } from 'fs/promises';
import { JSONData } from './modules/types.js';


function parseCSV(filePath:string) {

    const startTime = new Date();
    let count = 0;

    const pathChunk = filePath.split('\\')
    const fileName = pathChunk[1].replace(".csv", ".json");

    const results:JSONData[] = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data:JSONData) => {
            count++;
            results.push(data);
        })
        .on('end', () => {
            const endTime = new Date();
            const duration = endTime.valueOf() - startTime.valueOf();
            writeFile(`./converted/${fileName}`, JSON.stringify(results, undefined, 2), 'utf-8')
            parentPort.postMessage({ count, duration });
        })
}

parentPort.on('message', message => {
    let filePath = message;
    let result = parseCSV(filePath);
})

