"use strict";

var request = require('supertest');
var assert = require('chai').assert;
var app = require('../app');
var utils = require('./utils');
var should = require('should');
var User = require('../model/userModel');

before(function (done) {
    console.log("\nRunning pre-test configuration...\n");

    var userArray = [{
        userName: "testName",
        phoneNumber: 99664433
    }, {
        userName: "testNamePut",
        phoneNumber: 11223344
    }, {
        userName: "testNameDelete",
        phoneNumber: 22331122
    }];

    User.create(userArray, function (err, createdUsers) {
        if (err) {
            return preTestComplete(err);
        } else {
            console.log(createdUsers);
            return preTestComplete(null);
        }
    });
    function preTestComplete(err) {
        console.log("\n\npre-test configuration done...\n\n");
        done(err);
    }
});

/*
** Start of Tests
 */
describe('HTTP requests', function () {
    describe('GET /', function () {
        it('should respond with hal format\n', function (done) {
            request(app)
                .get('/')
                .expect('Content-Type', /json/)
                .expect(function (res) {
                    res.body._links["self"] = "/";
                })
                .expect(200, done);
        });
    });

    describe('GET /users', function () {
        it('respond with json', function (done) {
            request(app)
                .get('/users')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        })
        it('should contain the right HAL format\n', function (done) {
            request(app)
                .get('/users')
                .set('Accept', 'application/json')
                .expect(function (res) {
                    res.body._links.self.href.should.equal("/users");
                    res.body._links.next.href.should.equal("/users/:_id");
                    res.body.find.href.should.equal("");
                    (typeof(res.body.totalCount)).should.equal("number");
                    //TODO add more
                })
                .end(done);
        })
    });


    describe('POST /users', function () {
        it('should POST a new user\n', function (done) {
            request(app)
                .post('/users')
                .send({
                    userName: "test-Name",
                    phoneNumber: 12345678
                })
                .expect(201, done);
        })
    });

    describe('GET /users/:id', function () {
        it('should respond with posted user\n', function (done) {
            userIdQuery("test-Name", function (err, data) {
                if (err) {
                    return done(err);
                } else {
                    return request(app)
                        .get('/users/' + data)
                        .expect('Content-Type', /json/)
                        .expect(function (res) {
                            res.body._links.self.href.should.equal("/users/" + data, "_links/self/href is wrong");
                            res.body.user.userName.should.equal("test-Name", "userName is wrong");
                            res.body.user.phoneNumber.should.equal(12345678, "phoneNumber is wrong");
                        })
                        .expect(200, done);
                }
            });
        })
    });

    describe('PUT /users', function () {
        it('should update the posted user\n', function (done) {
            userIdQuery("testNamePut", function (err, data) {
                if (err) {
                    return done(err);
                } else {
                    return request(app)
                        .put('/users/' + data)
                        .send({
                            userName: "Felicia",
                            phoneNumber: 99998888
                        })
                        .expect('Content-Type', /json/)
                        .expect(function (res) {
                            res.body._links.self.href.should.equal("/users/" + data, "_links/self/href is wrong");
                            res.body.user.userName.should.equal("Felicia", "userName is wrong");
                            res.body.user.phoneNumber.should.equal(99998888, "phoneNumber is wrong");
                        })
                        .expect(200, done);
                }
            });
        })
    });

    describe('DELETE /users/:id', function () {
        var deletedId;
        it('should delete the posted users', function (done) {
            userIdQuery("testNameDelete", function (err, data) {
                if (err) {
                    return done(err);
                } else {
                    deletedId = data;
                    return request(app)
                        .delete('/users/' + data)
                        .expect(204, done);
                }
            });
        })
        it('should not be able to GET the user\n', function(done) {
            userIdQuery("testNameDelete", function(err, data) {
               if (err) {
                   return done(err);
               } else {
                   return request(app)
                       .get('/users/' + deletedId)
                       .expect(200, done);
               }
            });
        })
    });
});


describe('Users: models', function () {
    describe('#create()', function () {
        it('should create a new User\n', function (done) {
            var user = {
                userName: 'test Name',
                phoneNumber: 99664433
            };
            User.create(user, function (err, createdUser) {
                should.not.exist(err);
                createdUser.userName.should.equal('test Name');
                createdUser.phoneNumber.should.equal(99664433);
                done();
            });
        });
    });
});

/*
** Functions to increase code readability
 */
function userIdQuery(_userName, callback) {
    User.findOne({userName: _userName})
        .exec(function (err, user) {
            if (err) {
                callback(err, null);
            } else if (user == null) {
                callback(null, null);
            } else {
                callback(null, user._id);
            }
        });
}