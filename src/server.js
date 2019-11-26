const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

exports.createServer = function (staticFiles, routes, port, staticFilesDirectories) {
    if (staticFilesDirectories) {
        for (const staticFilesDirectory of staticFilesDirectories) {
            addStaticFilesFromDirectory(staticFilesDirectory, staticFiles, staticFilesDirectory);
        }
    }

    const server = http.createServer(function (req, res) {
        const reqUrl = url.parse(req.url);

        if (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            console.log('Request Type:' + req.method + ' Endpoint: ' + reqUrl.pathname);

            const route = findRoute(routes, reqUrl.pathname);
            if (route) {
                computeReply(route, req)
                    .then(reply => writeReply(reply, res))
                    .catch(error => console.error(error));
                return;
            }

            const staticFile = staticFiles[reqUrl.pathname];
            if (staticFile) {
                serveStaticFile(staticFile, res);
                return;
            }

            manageError(res);
        }
    });

    server.listen(port);
};

function computeReply(route, request) {
    const reply = route(request);
    return new Promise(resolve => resolve(reply));
}

function writeReply(response, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}

exports.getParam = function (request, paramName) {
    var query = url.parse(request.url).query;
    if (!query) return null;

    var params = query.split('&');
    for (var i = 0; i < params.length; i++) {
        var data = params[i].split('=');
        if (data[0] === paramName)
            return data[1];
    }
    return null;
};

function serveStaticFile(path, res) {
    fs.readFile(path, (error, data) => {
        if (error) {
            manageError(res);
        } else {
            res.writeHead(200);
            res.end(data);
        }
    });
}

function manageError(res) {
    res.writeHead(404);
    res.end();
}

function addStaticFilesFromDirectory(directory, staticFiles, staticFilesDirectory) {
    fs.readdir(directory, (err, files) => {
        files.forEach(file => {

            const fullPath = path.join(directory, file);

            fs.stat(fullPath, (_, stat) => {
                if (stat.isFile()) {
                    staticFiles[path.join('/', path.relative(staticFilesDirectory, fullPath)).replace(/\\/g, "/")] = fullPath;
                } else if (stat.isDirectory()) {
                    addStaticFilesFromDirectory(fullPath, staticFiles, staticFilesDirectory);
                }
            });
        });
    });
}

function findRoute(routes, path) {
    for (const route in routes) {
        if (path.startsWith(route)) {
            return routes[route];
        }
    }

    return undefined;
}