const fs = require('fs');

const hostname = process.platform === 'win32'
    ? 'localhost'
    : '145.239.75.80';

exports.serversConfiguration = {
    simulator: {
        hostname: hostname,
        port: '8080'
    },
    prosumer: {
        hostname: hostname,
        port: '8081'
    },
    manager: {
        hostname: hostname,
        port: '8082'
    },
};

exports.uploadDirectory = __dirname + '\\upload\\';
if (!fs.existsSync(exports.uploadDirectory)) {
    fs.mkdir(exports.uploadDirectory, () => {
    });
}