const http = require('http');
const url = require('url');

exports.createServer = function(routes, port) {
    const server = http.createServer(function (req, res) {
        const reqUrl = url.parse(req.url);

        if (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            console.log('Request Type:' + req.method + ' Endpoint: ' + reqUrl.pathname);

            const route = routes[reqUrl.pathname];
            if (route) {
                computeReply(route, req)
                    .then(reply => writeReply(reply, res))
                    .catch(error => console.error(error));
            } else {
                // TODO: add an error message
            }
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