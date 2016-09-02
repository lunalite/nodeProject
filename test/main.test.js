"use strict";
/*
 ** main test file that calls for all other unit tests within the ./unit folder
 */

var config = require('../config');
var Utils = require('../src/util/util');
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
            db.createCollection('users', function () {
                db.createCollection('collections', function () {
                    createUser(done);
                });
            });
        });

        function createUser(done) {
            var userArray = [new User("testName", "qwe123QWE", 11111111, false),
                new User("testNamePut", "qwe123QWE", 11223344, true),
                new User("testNameDelete", "qwe123QWE", 22331122, true)];
            for (var i = 0; i < userArray.length; i++) {
                userArray[i].insertOne(db, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                });
            }
            return done(null);
        }
    });

    require('./unit/general.test.js');
    require('./unit/users.test.js');
    require('./unit/collections.test.js');

    after(function (done) {
        db.dropCollection('users', function (err, res) {
            if (err) {
                return done(err);
            }
            db.dropCollection('collections', function (err, res) {
                if (err) {
                    return done(err);
                }
                console.log('End of tests... Closing db');
                db.close();

                return done(null);
            });
        });
    });

});