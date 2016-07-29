'use strict';

var mongoose = require('mongoose');
var config = require('../config/config');

process.env.NODE_ENV = 'test';

before(function (done) {
    console.log("Starting unit test...");
    console.log("Connecting to database node environment: " + process.env.NODE_ENV + " at " + config.testDb);
    function clearDB() {
        for (var i in mongoose.connection.collections) {
            console.log("remove mongoose collections...\n");
            mongoose.connection.collections[i].remove(function () {
            });
        }
        return done();
    }

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.testDb, function (err) {
            if (err) {
                console.log("error connecting");
                throw err;
            }
            console.log("Connected to testDb");
            return clearDB();
        });
    } else {
        return clearDB();
    }
});

after(function (done) {
    console.log("Test is done. Disconnecting from " + config.testDb);
    mongoose.disconnect();
    return done();
});

