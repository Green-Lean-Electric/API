const fs = require('fs');

exports.availableEnvironments = {
    dev: 'dev',
    prod: 'prod'
};
exports.environment = process.platform === 'win32'
    ? exports.availableEnvironments.dev
    : exports.availableEnvironments.prod;

const hostname = exports.environment === exports.availableEnvironments.dev
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

exports.uploadDirectory = __dirname + '/upload/';
if (!fs.existsSync(exports.uploadDirectory)) {
    fs.mkdir(exports.uploadDirectory, () => {
    });
}