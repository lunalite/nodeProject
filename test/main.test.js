"use strict";
/*
 ** main test file that calls for all other unit tests within the ./unit folder
 */

var config = require('../config');
var assert = require('assert');
var should = require('should');
var mongoClient = require('../bin/mongoClient');
var db;
var User = require('../model/UserSchema');

describe('Starting Unit tests', function () {
    /*
     ** before hook for connecting to mongodb and adding user data
     */
    before(function (done) {
        mongoClient.connectToServer(function (err) {
            if (err) {
                throw err;
            }
            console.log('connected to mongoDB\n');
            db = mongoClient.getDb();
            createUser(done);

        });

        function createUser(done) {
            var userArray = [new User("testName", "qwe123QWE", 11111111, false),
                new User("testNamePut", "qwe123QWE", 11223344, true),
                new User("testNameDelete", "qwe123QWE", 22331122, true)];

            userArray.forEach(function (user) {
                user.insertOne(db, function (err) {
                    if (err) {
                        return done(err);
                    }
                });
            });
            return done(null);
        }
    });

    require('./unit/general.test.js');
    require('./unit/users.test.js');
    require('./unit/collections.test.js');

    after(function (done) {
        db.collections(function (err, collection) {
            collection.forEach(function(_collection) {
                db.dropCollection(_collection.s.name, function(err) {
                    if (err) {
                        return done(err);
                    }
                });
            });
            console.log('End of tests... Closing db');
            db.close();
            return done(null);
        });
    });

});