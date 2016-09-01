'use strict';

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Logger = mongodb.Logger;
var ObjectId = mongodb.ObjectId;
var config = require('../config');
var _db;

module.exports = {
    connectToServer: function( callback ) {
        MongoClient.connect(config.db, function( err, db ) {
            _db = db;
            console.log('Connected to the database: ' + config.db);
            // Logger.setLevel('debug');
            // Logger.filter('class', ['Db']);
            return callback( err );
        } );
    },
    getDb: function() {
        return _db;
    },
    objectifyId: function(id) {
        return new ObjectId(id);
    }
};



