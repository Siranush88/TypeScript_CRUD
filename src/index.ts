import path from 'path';
import { Worker } from 'worker_threads';
import { readdir } from 'fs/promises';
import {Message} from './interfaces/types.js';

export default async function CsvToJson(directoryPath:string):Promise<void> {

const csvFilesArray = await readdir(directoryPath);

const numThreads = csvFilesArray.length <= 10 ? csvFilesArray.length : 10

const filesPerThread:number = Math.ceil(csvFilesArray.length / numThreads);

for (let i = 0; i < numThreads; i++) {
  const worker = new Worker('./build/worker.js');
  worker.on('online', ():void => {
    const start = i * filesPerThread;
    const end = (i + 1) * filesPerThread;
    
    for (let j = start; j < end && j < csvFilesArray.length; j++) {
      const csvFilePath = path.join(directoryPath, csvFilesArray[j]);
      worker.postMessage(csvFilePath);
    }
  });

  worker.on('message', (message:Message):void => {
    const { count, duration } = message;
    console.log(`Parsing ${ csvFilesArray[i]} took ${duration} milliseconds to read ${count} lines`);
  });
}

}
