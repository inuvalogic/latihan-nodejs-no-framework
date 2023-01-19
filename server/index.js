const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const server = {};

const baseDir = path.join(__dirname, '../');

const mimeTypes = {
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.css': 'text/css',
    '.js': 'text/javascript',
};

server.getContentType = url => {
    let contentType = 'application/octet-stream';

    const extname = path.extname(url);

    for (let key in mimeTypes) {
        if (mimeTypes.hasOwnProperty(key)) {
            if (extname === key) {
                contentType = mimeTypes[key];
            }
        }
    }
    return contentType;
};

server.serveStaticContent = (pathname, response) => {
    const contentType = server.getContentType(pathname);
    response.setHeader('Content-Type', contentType);
    fs.readFile(`${baseDir}${pathname}`, (error, data) => {
        if (!error) {
            response.writeHead(200);
            response.end(data);
        } else {
            response.writeHead(404);
            response.end('404 - File Not Found');
        }
    });
};

let allowedPaths = {};

server.getAllowedDynamicPath = path => {
    for (const key in allowedPaths) {
        if (allowedPaths.hasOwnProperty(key)) {
            if (path === key) {
                return path;
            }
        }
    }
    return false;
};

server.serveDynamicContent = (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const method = request.method.toLowerCase();
    const parsedUrl = url.parse(request.url, true);
    const { pathname, query } = parsedUrl;

    let buffer = [];

    request.on('error', error => {
        console.log('Error Occurred', error);
        response.writeHead(500);
        response.end('Error occurred while processing HTTP request', error);
    });

    request.on('data', chunk => {
        buffer.push(chunk);
    });

    request.on('end', () => {
        buffer = Buffer.concat(buffer);

        const responseData = {
            method,
            pathname,
            query,
            buffer,
        };

        const handler = allowedPaths[pathname];

        handler(responseData, (statusCode = 200, data = {}) => {
            response.writeHead(statusCode);
            response.end(data);
        });
    });
};

const httpServer = http.createServer((request, response) => {
    let pathName = url.parse(request.url, false).pathname;

    const dynamicPath = server.getAllowedDynamicPath(pathName);

    if (dynamicPath) {
        server.serveDynamicContent(request, response);
    } else {
        const extensionName = path.extname(pathName);
    
        pathName = extensionName === undefined || extensionName === '' ? `${pathName}/index.html` : pathName;

        server.serveStaticContent(pathName, response);
    }
});

server.setAllowedPaths = paths => {
    allowedPaths = paths;
};

server.init = (port = 3000, host = '127.0.0.1') => {
    httpServer.listen(port, () => {
        console.log(`Server berjalan di http://${host}:${port}`);
    });
};

module.exports = server;
