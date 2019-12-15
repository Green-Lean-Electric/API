const DEFAULT_URL = 'mongodb://localhost';

let client;
function getClient() {
    if (!client) {
        return connect().then(newClient => {
            client = newClient;
            return client;
        });
    }
    return new Promise(resolve => resolve(client));
}

function connect(url) {
    const mongoClient = require('mongodb').MongoClient;
    const fullUrl = (
        url
            ? url
            : DEFAULT_URL
    );
    return mongoClient.connect(fullUrl).catch(error => console.log(error));
}

function operate(databaseName, collectionName, operation) {
    return getClient().then(client => operation(client.db(databaseName).collection(collectionName)));
}

exports.insertOne = function (databaseName, collectionName, object) {
    return operate(databaseName, collectionName, collection => collection.insertOne(object)).then(result => result.ops);
};

exports.deleteOne = function (databaseName, collectionName, object) {
    return operate(databaseName, collectionName, collection => collection.deleteOne(object)).then(result => result.ops);
};

exports.find = function (databaseName, collectionName, predicate) {
    return operate(databaseName, collectionName, collection => collection.find(predicate).toArray());
};

exports.count = function (databaseName, collectionName) {
    return operate(databaseName, collectionName, collection => collection.count());
};

exports.updateOne = function (databaseName, collectionName, object, updateOperations) {
    return operate(databaseName, collectionName, collection => collection.updateOne(object, updateOperations).then(result => result.result.nModified));
};

exports.findLast = function(databaseName, collectionName, object, column) {
    let predicate = {};
    predicate[column] = -1;
    return operate(databaseName, collectionName, collection => collection.find(object).sort(predicate).limit(1).toArray().then(results => results[0]));
};