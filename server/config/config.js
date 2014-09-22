var path = require('path'),
    mongoose = require('mongoose');

var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
    development: {
        rootPath: rootPath,
        db: 'mongodb://localhost/eto',
        port: process.env.PORT || 3000
    },
    production:{
        rootPath: rootPath,
        db: 'mongodb://eto:1006Mongo@ds033767.mongolab.com:33767/eto',
        port: process.env.PORT || 3030
    }
}
