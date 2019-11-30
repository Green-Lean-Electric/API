const fs = require('fs');

exports.serversConfiguration = {
    simulator: {
        hostname: 'localhost',
        port: '8080'
    },
    prosumer: {
        hostname: 'localhost',
        port: '8081'
    },
    manager: {
        hostname: 'localhost',
        port: '8082'
    },
};

exports.uploadDirectory = __dirname + '\\upload\\';
if (!fs.existsSync(exports.uploadDirectory)) {
    fs.mkdir(exports.uploadDirectory, () => {});
}