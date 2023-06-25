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
import CsvToJson from './main.js';
import http from 'http';
import path from 'path';
function sendResponse(res, status, data, headers) {
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
const server = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let items = [];
    const headers = ['Content-Type', 'application/json'];
    if (typeof req.url === 'string') {
        items = req.url.split('/');
    }
    if (req.method === 'POST' && items[1] === 'exports') {
        try {
            yield CsvToJson(items[2]);
            const data = { message: 'CSV files are converted and saved.' };
            sendResponse(res, 200, data, headers);
        }
        catch (err) {
            console.error('Error converting CSV files:', err);
            const data = { error: 'Failed to convert CSV files.' };
            sendResponse(res, 500, data, headers);
        }
    }
    else if (req.method === 'GET' && items[1] === 'files') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if (typeof req.url === 'string') {
            if (items.length === 3 && req.url.startsWith('/files/')) {
                const filename = items[2];
                const filePath = path.join('./converted', filename);
                try {
                    const data = yield readFile(filePath, 'utf-8');
                    const jsonData = JSON.parse(data);
                    sendResponse(res, 200, jsonData);
                }
                catch (err) {
                    const data = { error: 'File not found.' };
                    sendResponse(res, 404, data);
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
        const data = { error: 'Route not found.' };
        sendResponse(res, 404, data);
    }
}));
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
// npm run build
// npm start
