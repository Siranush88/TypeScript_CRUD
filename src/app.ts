import { readdir, readFile, unlink } from 'fs/promises';
import CsvToJson from './main.js';
import http, {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import { MessageData, ErrorData } from './interfaces/types.js';

function sendResponse(res:ServerResponse, status:number, data?: MessageData | ErrorData | string, headers?: string[]):void {
    res.statusCode = status;
  
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
      }
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
  
    res.end(data);
  }

const PORT = 3000;

const server = http.createServer( async (req:IncomingMessage , res:ServerResponse) => {

    let items:string[] = [];  

    const headers = ['Content-Type', 'application/json'];

    if(typeof req.url === 'string') {
         items = req.url.split('/');
    }

    if (req.method === 'POST' && items[1] === 'exports') {
        try {
            await CsvToJson(items[2]);

            const data = { message: 'CSV files are converted and saved.' };
            sendResponse(res, 200, data, headers);

        } catch (err) {
            console.error('Error converting CSV files:', err);

            const data = { error: 'Failed to convert CSV files.' };
            sendResponse(res, 500, data, headers);
        }
    } else if (req.method === 'GET' && items[1] === 'files') {
    
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
     
        if (typeof req.url === 'string') {
            if (items.length === 3 && req.url.startsWith('/files/')) {
                const filename = items[2];
                const filePath = path.join('./converted', filename);
                try {
                    const data = await readFile(filePath, 'utf-8');
                    const jsonData = JSON.parse(data);
                    sendResponse(res, 200, jsonData);
                } catch (err) {
                    const data = { error: 'File not found.' }
                    sendResponse(res, 404, data);
                }
            } else {
                const jsonFileArray = await readdir('./converted')
                res.end(JSON.stringify(jsonFileArray));
            }
        }
    } else if (req.method === 'DELETE' && items[1] === 'files') {
        const filename = items[2];
        const filePath = path.join('./converted', filename);
        try {
            await unlink(filePath);
            console.log(`File "${filename}" deleted successfully.`);
        } catch (err) {
            console.error(`Error deleting file "${filename}":`, err);
        }
    } else {
        const data = { error: 'Route not found.' };
        sendResponse(res, 404, data);
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})


// npm run build
// npm start
