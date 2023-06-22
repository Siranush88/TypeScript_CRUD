var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readdir, readFile, unlink } from 'fs/promises';
import CsvToJson from './index.js';
import http from 'http';
import path from 'path';
const PORT = 3000;
const server = http.createServer();
server.on('request', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let items = [];
    if (typeof req.url === 'string') {
        items = req.url.split('/');
    }
    if (req.method === 'POST' && items[1] === 'exports') {
        try {
            yield CsvToJson(items[2]);
            // res.writeHead(200, { 'Content-Type': 'application/json' })
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'CSV files are converted and saved.' }));
        }
        catch (err) {
            console.error('Error converting CSV files:', err);
            // res.writeHead(500, { 'Content-Type': 'application/json' });
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to convert CSV files.' }));
        }
    }
    else if (req.method === 'GET' && items[1] === 'files') {
        // res.writeHead(200, { 'Content-Type': 'application/json' })
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if (typeof req.url === 'string') {
            if (items.length === 3 && req.url.startsWith('/files/')) {
                const filename = items[2];
                const filePath = path.join('./converted', filename);
                try {
                    const data = yield readFile(filePath, 'utf-8');
                    const jsonData = JSON.parse(data);
                    res.statusCode = 200;
                    res.end(JSON.stringify(jsonData));
                }
                catch (err) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'File not found.' }));
                }
            }
            else {
                const jsonFileArray = yield readdir('./converted');
                res.end(JSON.stringify(jsonFileArray));
            }
        }
    }
    else if (req.method === 'DELETE' && items[1] === 'files') {
        const filename = items[2];
        const filePath = path.join('./converted', filename);
        try {
            yield unlink(filePath);
            console.log(`File "${filename}" deleted successfully.`);
        }
        catch (err) {
            console.error(`Error deleting file "${filename}":`, err);
        }
    }
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Route not found.' }));
    }
}));
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
