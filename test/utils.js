'use strict';

var mongoose = require('mongoose');
var config = require('../config/config');

process.env.NODE_ENV = 'test';

before(function(done) {
    console.log("Starting unit test...");
    console.log("Connecting to database node environment: "+ process.env.NODE_ENV + " at "+ config.db);
    function clearDB() {
        for (var i in mongoose.connection.collections) {
            console.log("remove mongoose collections..");
            mongoose.connection.collections[i].remove(function() {});
        }
        return done();
    }

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.db, function (err) {
            if (err) {
                console.log("error connecting");
                throw err;
            }
            console.log("Connected to dB");
            return clearDB();
        });
    } else {
        return clearDB();
    }
});

after(function (done) {
    mongoose.disconnect();
    return done();
});

