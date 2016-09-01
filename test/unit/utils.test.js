'use strict';

var mongoose = require('mongoose');
var config = require('../../config');
var Utils = require('../../src/util/util');
var assert = require('assert');
var should = require('should');

describe('Beginning utils testing', function () {

    /*
     ** before hook for connecting to mongodb and adding user data
     */
    before(function (done) {
        mongoose.connect(config.testDb);
        mongoose.connection.on('connected', function () {
            console.log("Connected to database node environment: " + process.env.NODE_ENV + " at " + config.testDb);
        });
        mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
            done(err);
        });

        mongoose.connection.on('open', function (err) {

            console.log("Running Users pre-test configuration...");
            mongoose.connection.db.listCollections().toArray(function (err, names) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(mongoose.connection.readyState);
                    names.forEach(function (entity, index, array) {
                        mongoose.connection.db.dropCollection(entity.name);
                    });
                    return createUser(done);
                }
            });
        });

    });

    /*
     ** Ensure that the connection to mongodb is done
     */
    it('should connect to mongodb', function (done) {
        should.equal(mongoose.connection.readyState, 1);
        done();
    });
});

after(function (done) {
    console.log("\nTest is done. Disconnecting from " + config.testDb);
    mongoose.disconnect();
    return done();
});

/*
* createUser function
*
* @params done {function} for callback of done to the before hook
*
 */
function createUser(done) {
    console.log('creating users...');
    var userArray = [{
        userName: "testName",
        password: Utils.encryptPassword("qwe123QWE"),
        phoneNumber: 11111111,
        isAdmin: 0
    }, {
        userName: "testNamePut",
        password: Utils.encryptPassword("qwe123QWE"),
        phoneNumber: 11223344,
        isAdmin: 1
    }, {
        userName: "testNameDelete",
        password: Utils.encryptPassword("qwe123QWE"),
        phoneNumber: 22331122,
        isAdmin: 1
    }];
    var Users = mongoose.model('Users');
    Users.create(userArray, function (err, createdUsers) {
        if (err) {
            return done(err);
        } else {
            return done(null);
        }
    });
}
