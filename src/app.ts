import { readdir, readFile, unlink } from 'fs/promises';
import CsvToJson from './main.js';
import http from 'http';
import path from 'path';
import { Request, Response } from './interfaces/types.js';

const PORT = 3000;

const server = http.createServer();
server.on('request', async (req:Request, res:Response) => {
    let items:string[] = [];  
    if(typeof req.url === 'string') {
         items = req.url.split('/');
    }

    if (req.method === 'POST' && items[1] === 'exports') {
        try {
            await CsvToJson(items[2]);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json'); 
            res.end('CSV files are converted and saved.');
        } catch (err) {
            console.error('Error converting CSV files:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to convert CSV files.' }));
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

                    res.statusCode = 200;
                    res.end(JSON.stringify(jsonData));
                } catch (err) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'File not found.' }));
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
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Route not found.' }));
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})


// npm run build
// npm start
