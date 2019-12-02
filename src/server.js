const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const configuration = require('./configuration');

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
                computeReply(route, req, res)
                    .then(reply => writeReply(reply, res))
                    .catch(error => console.error(error));
                return;
            }

            const staticFile = staticFiles[reqUrl.pathname];
            if (staticFile) {
                exports.serveStaticFile(staticFile, res);
                return;
            }

            manageError(res);
        }
    });

    server.listen(port);
};

function computeReply(route, request, response) {
    return exports.getParam(request).then(parameters => route(request, parameters, response));
}

function writeReply(response, res) {
    if (!response) return;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}

exports.getParam = function (request) {
    if (request.method.toLowerCase() === 'get') {
        return getParamsForGet(request);
    } else {
        return handlePostParameters(request);
    }
};

function getParamsForPost(request) {
    let data = [];
    request.on('data', chunk => {
        data.push(chunk);
    });

    return new Promise(resolve => {
        request.on('end', () => {
            resolve(data);
        });
    });
}

function getParamsForGet(request) {
    const query = url.parse(request.url).query;
    if (!query) return new Promise(resolve => resolve({}));
    const params = query.split('&');

    const data = {};
    for (let i = 0; i < params.length; i++) {
        const fields = params[i].split('=');
        data[fields[0]] = fields[1];
    }

    return new Promise(resolve => resolve(data));
}

const contentTypes = {
    // Pages components
    css: 'text/css',
    html: 'text/html',
    js: 'text/javascript',

    // Images
    ico: 'image/vnd.microsoft.icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',

    // Others:
    undefined: 'application/octet-stream'
};

function findExtension(path) {
    const pathComponents = path.split('\\');
    const fileName = pathComponents[pathComponents.length - 1];
    const fileNameComponents = fileName.split('.');
    return fileNameComponents.length > 1
        ? fileNameComponents[fileNameComponents.length - 1]
        : 'undefined';
}

exports.serveStaticFile = function (path, res) {
    const contentType = contentTypes[findExtension(path)] || contentTypes.undefined;
    exports.readFile(path)
        .then(data => {
            res.setHeader('Content-type', contentType);
            res.writeHead(200);
            res.end(data);
        })
        .catch(() => manageError(res));
};

exports.readFile = function (path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    })
};

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

/**
 * Handle a file upload and/or POST parameters.
 * Return a Promise that contains the request parameters and the path of the file if there is a file.
 * <br/>
 * Can be used with destructuring as follows:
 * handlePostParameters(request).then([fields, path]) => {...});
 *
 * @param request
 * @returns {Promise<[Object, Array || String]>}
 */
function handlePostParameters(request) {
    let incomingForm = formidable.IncomingForm();
    incomingForm.uploadDir = configuration.uploadDirectory;
    incomingForm.keepExtensions = true;

    return new Promise((resolve, reject) => {
        incomingForm.parse(request, (error, parameters, files) => {
            if (error) {
                reject(error);
            }

            const file = files.file;

            if (file) {
                const currentPath = file.path;
                const newPath = configuration.uploadDirectory + files.file.name;
                fs.rename(currentPath, newPath, () => {
                    resolve([parameters, newPath])
                });
            } else {
                resolve(parameters);
            }
        });
    });
}

exports.sendEmail = function(){
    const sendmail = require('sendmail')();

    sendmail({
        from: 'no-reply@yourdomain.com',
        to: 'borghinoemilie@laposte.net',
        subject: 'test sendmail',
        html: 'Mail of test sendmail ',
      }, function(err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
};