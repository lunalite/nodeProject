'use strict';

var mongoose = require('mongoose');
var config = require('../config/config');
var Users = mongoose.model('Users');

before(function (done) {
    console.log("Starting unit test...");
    console.log("Connecting to database node environment: " + process.env.NODE_ENV + " at " + config.testDb);

    function clearDB() {
        for (var i in mongoose.connection.collections) {
            console.log("remove mongoose collections...\n");
            mongoose.connection.collections[i].remove(function () {
            });
        }
    }

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.testDb, function (err) {
            if (err) {
                console.log("error connecting");
                throw err;
            }
        }).then(function() {
            console.log("Connected to testDb");
        }).then(function userAddDB() {
            console.log("Running Users pre-test configuration...");

            var userArray = [{
                userName: "testName",
                password: "qwe123QWE",
                phoneNumber: 99664433,
                isAdmin: 0
            }, {
                userName: "testNamePut",
                password: "qwe123QWE",
                phoneNumber: 11223344,
                isAdmin: 1
            }, {
                userName: "testNameDelete",
                password: "qwe123QWE",
                phoneNumber: 22331122,
                isAdmin: 1
            }];
            Users.create(userArray, function (err, createdUsers) {
                if (err) {
                    return done(err);
                } else {
                    return done(null);
                }
            });
        });
    }
});

after(function (done) {
    console.log("\nTest is done. Disconnecting from " + config.testDb);
    mongoose.disconnect();
    return done();
});

