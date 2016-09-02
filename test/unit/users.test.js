'use strict';

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('should');
var config = require('../../config');
var app;
var db;
var Util = require('../../src/util/util');

/*
 ** Start of Tests
 */

describe('Running users unit test', function () {
    before(function (done) {
        app = require('../../src/app');
        db = require('../../bin/mongoClient').getDb();
        done();
    });

    describe('Unauthenticated userTest', function () {
        describe('GET /** redirection', function () {
            it('GET / should lead to /login page', function (done) {
                request(app)
                    .get('/')
                    .expect(function (res) {
                        expect(res.header['location']).to.match(/\/login/);
                    })
                    .expect(302, done);
            });

            it('GET /users should lead to /login page', function (done) {
                request(app)
                    .get('/users')
                    .expect(function (res) {
                        expect(res.header['location']).to.match(/\/login/);
                    })
                    .expect(302, done)
            });
            it('GET /collections should lead to /login page', function (done) {
                request(app)
                    .get('/collections')
                    .expect(function (res) {
                        expect(res.header['location']).to.match(/\/login/);
                    })
                    .expect(302, done)
            });
        });

        describe('POST /login/local with wrong credentials', function () {
            it('should return 401 when wrong username/password is used', function (done) {
                request(app)
                    .post('/login/local')
                    .send('username=testNamePutX')
                    .send('password=123qweQweX')
                    .expect(401, done);
            });
            it('should return 400 when username is left empty', function (done) {
                request(app)
                    .post('/login/local')
                    .send('username=')
                    .send('password=qwe123QWE')
                    .expect(400, done);
            });
            it('should return 400 when password is left empty', function (done) {
                request(app)
                    .post('/login/local')
                    .send('username=testName')
                    .send('password=')
                    .expect(400, done);
            });
        });
    });

    describe('Authenticated userTest', function () {
        var token;
        before(function adminLoginAuth(done) {
            request(app)
                .post('/login/local')
                .type('form')
                .send('username=testNamePut')
                .send('password=qwe123QWE')
                .set('Accept', 'application/json')
                .expect(function (res) {
                    should.exist(res.body.token);
                    token = res.body.token;
                })
                .expect(200, done);
        });

        describe('Authenticating bearer tokens', function () {
            it('should return bearer token not authenticated', function(done) {
                request(app)
                    .get('/login/local')
                    .set('authorization', 'bearer 1' + token)
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.message).to.match(/^.*not authenticated.*$/);
                        should.exist(res.body.remedy);
                    })
                    .expect(200, done);
            });
            it('should return add bearer string', function(done) {
                request(app)
                    .get('/login/local')
                    .set('authorization', token)
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.message).to.match(/^.*bearer.*$/);
                    })
                    .expect(200, done);
            });
            it('should return authenticated', function (done) {
               request(app)
                   .get('/login/local')
                   .set('authorization', 'bearer ' + token)
                   .expect('Content-Type', /json/)
                   .expect(function(res) {
                       res.body.message.should.equal("You are authenticated.");
                       should.exist(res.body.user.tokenStartTime);
                       should.exist(res.body.user.tokenEndTime);
                   })
                   .expect(200, done);
            });
        });

        describe('GET /users non-admin', function () {
            var tokenNonAdmin;

            before(function nonAdminLoginAuth(done) {
                request(app)
                    .post('/login/local')
                    .send('username=testName')
                    .send('password=qwe123QWE')
                    .expect(function (res) {
                        should.exist(res.body.token);
                        tokenNonAdmin = res.body.token;
                    })
                    .end(done);
            });
            it('should return unauthorized as isAdmin fails\n', function (done) {
                request(app)
                    .get('/users')
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect('Content-Type', /plain/)
                    .expect(403, done);
            });
        });

        describe('GET /users', function () {
            it('respond with json', function (done) {
                request(app)
                    .get('/users')
                    .set('authorization', 'bearer ' + token)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });

        });

        describe('POST /users', function () {
            it('should return Missing username', function (done) {
                request(app)
                    .post('/users')
                    .set('authorization', 'bearer ' + token)
                    .type('json')
                    .send({
                        username: ''
                    })
                    .expect(function (res) {
                        res.body.message.should.equal('Missing username');
                        should.exist(res.body.remedy);
                    })
                    .expect(400, done);
            });
            it('should return Missing password', function (done) {
                request(app)
                    .post('/users')
                    .set('authorization', 'bearer ' + token)
                    .type('json')
                    .send({
                        username: 'testName'
                    })
                    .expect(function (res) {
                        res.body.message.should.equal('Missing password');
                        should.exist(res.body.remedy);
                    })
                    .expect(400, done);
            });
            it('should return Password is of invalid format if failed', function (done) {
                request(app)
                    .post('/users')
                    .set('authorization', 'bearer ' + token)
                    .type('json')
                    .send({
                        username: 'testName',
                        password: '123qwe'
                    })
                    .expect(function (res) {
                        res.body.message.should.equal('Invalid Password Format');
                        should.exist(res.body.remedy);
                    })
                    .expect(400, done);
            });
            it('should POST a new user\n', function (done) {
                request(app)
                    .post('/users')
                    .set('authorization', 'bearer ' + token)
                    .type('json')
                    .send({
                        username: 'testNameX',
                        password: 'test123TEST',
                        phoneNumber: 12345678,
                        isAdmin: false
                    })
                    .expect(201, done);
            });
        });

        describe('GET /users/:id', function () {
            it('should respond with posted user\n', function (done) {
                userIdQuery('testNameX', function (err, _id) {
                    if (err) {
                        return done(err);
                    } else {
                        return request(app)
                            .get('/users/' + _id)
                            .set('authorization', 'bearer ' + token)
                            .expect('Content-Type', /json/)
                            .expect(function (res) {
                                res.body.user.username.should.equal('testNameX', 'userName is wrong');
                                res.body.user.phoneNumber.should.equal(12345678, 'phoneNumber is wrong');
                                res.body.user.password.should.equal(Util.encryptPassword('test123TEST'), 'password is wrong');
                            })
                            .expect(200, done);
                    }
                });
            });

            it('should return a status of 204 when a non-existing individual user is requested', function (done) {
                request(app)
                    .get('/users/' + '57bc4d605a3daf042376f97d')
                    .set('authorization', 'bearer ' + token)
                    .expect(204, done);
            });

            it('should return a bad request for user with status 400', function (done) {
                request(app)
                    .get('/users/' + '1fewjiofj2wefwe')
                    .set('authorization', 'bearer ' + token)
                    .expect(400, done);
            });
        });

        describe('PUT /users', function () {
            it('should update the posted user\n', function (done) {
                userIdQuery('testNamePut', function (err, _id) {
                    if (err) {
                        return done(err);
                    } else {
                        return request(app)
                            .put('/users/' + _id)
                            .set('authorization', 'bearer ' + token)
                            .type('json')
                            .send({
                                username: 'Felicia',
                                phoneNumber: 99998888
                            })
                            .expect('Content-Type', /json/)
                            .expect(function (res) {
                                res.body.user.username.should.equal('Felicia', 'userName is wrong');
                                res.body.user.phoneNumber.should.equal(99998888, 'phoneNumber is wrong');
                            })
                            .expect(200, done);
                    }
                });
            });

            it('should return a status of 204 when a non-existing individual user is requested', function (done) {
                request(app)
                    .put('/users/' + '57bc4d605a3daf042376f97d')
                    .set('authorization', 'bearer ' + token)
                    .expect(204, done);
            });

            it('should return a bad request for user with status 400', function (done) {
                request(app)
                    .put('/users/' + '1fewjiofj2wefwe')
                    .set('authorization', 'bearer ' + token)
                    .expect(400, done);
            });

        });

        describe('DELETE /users/:id', function () {
            var deletedId;
            it('should delete the posted users', function (done) {
                userIdQuery('testNameDelete', function (err, data) {
                    if (err) {
                        return done(err);
                    } else {
                        deletedId = data;
                        return request(app)
                            .delete('/users/' + data)
                            .set('authorization', 'bearer ' + token)
                            .expect(204, done);
                    }
                });
            });

            after(function () {
                it('should not be able to GET the user\n', function (done) {
                    userIdQuery('testNameDelete', function (err, data) {
                        if (err) {
                            return done(err);
                        } else {
                            return request(app)
                                .get('/users/' + deletedId)
                                .set('authorization', 'bearer ' + token)
                                .expect(204, done);
                        }
                    });
                });
            });
        });
    });


    /*
     ** Functions to increase code readability
     */
    function userIdQuery(_username, callback) {
        db.collection('users').findOne({username: _username}, function (err, user) {
            if (err) {
                callback(err, null);
            } else if (user == null) {
                callback(null, null);
            } else {
                callback(null, user._id);
            }
        });
    }

});
