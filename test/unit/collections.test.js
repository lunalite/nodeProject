"use strict";

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var app = require('../../app');
var should = require('should');
var mongoose = require('mongoose');
var Collections = mongoose.model('Collections');

describe('Running collections unit test', function() {
    before(function (done) {
        console.log("Running Collections pre-test configuration...");

        var CollectionArray = [{
            name: "testProd",
            description: "This is a test production"
        }, {
            name: "deleteProd",
            description: "This prod is gonna be deleted"
        }];
        Collections.create(CollectionArray, function (err, CollectionArray) {
            if (err) {
                return preTestComplete(err);
            } else {
                return preTestComplete(null);
            }
        });
        function preTestComplete(err) {
            console.log("Collections pre-test configuration done...");
            done(err);
        }
    });


    describe('Authenticated collections test', function () {
        var tokenNonAdmin;

        before(function nonAdminLoginAuth(done) {
            request(app)
                .post("/login/local")
                .send("username=testName")
                .send("password=qwe123QWE")
                .expect(function (res) {
                    should.exist(res.body.token);
                    tokenNonAdmin = res.body.token;
                })
                .expect(200, done);
        });

        describe('GET /collections', function () {
            it('should return all collections', function (done) {
                request(app)
                    .get('/collections')
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });
        });

        describe('GET /collections/:id', function () {
            it('should return an individual collection', function (done) {
                collectionsIdQuery("testProd", function (err, _id) {
                    if (err) {
                        return done(err);
                    } else {
                        request(app)
                            .get('/collections/' + _id)
                            .set('authorization', 'bearer ' + tokenNonAdmin)
                            .expect(200, done);
                    }
                });
            });

            it('should return a status of 204 when a non-existing individual collection is requested', function (done) {
                request(app)
                    .get('/collections/' + "57bc4d605a3daf042376f97d")
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect(204, done);
            });

            it('should return a bad request for collection with status 400', function (done) {
                request(app)
                    .get('/collections/' + "1fewjiofj2wefwe")
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect(400, done);
            });
        });

        describe('POST /collections/:id', function () {
            it('should create a new item successfully with just the name', function (done) {
                request(app)
                    .post('/collections')
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .send({
                        name: "testProd2"
                    })
                    .expect(function (res) {
                        res.body.name.should.equal("testProd2");
                    })
                    .expect(201, done);
            });

            it('should create a new item successfully with both name and description', function (done) {
                request(app)
                    .post('/collections')
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .send({
                        name: "testProd2",
                        description: "This is a testprod2"
                    })
                    .expect(function (res) {
                        res.body.name.should.equal("testProd2");
                        res.body.description.should.equal("This is a testprod2");
                    })
                    .expect(201, done);
            });

            it('should returns error missingName when name is missing.', function (done) {
                request(app)
                    .post('/collections')
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect(function (res) {
                        res.body.errors.name.message.should.equal("missingName");
                    })
                    .expect(400, done);
            });
        });

        describe('DELETE /collections/:id', function () {
            var deletedId;
            it('should delete an item successfully returning 204', function (done) {
                collectionsIdQuery("testProd2", function (err, data) {
                    if (err) {
                        return done(err);
                    } else {
                        deletedId = data;
                        return request(app)
                            .delete('/collections/' + data)
                            .set('authorization', 'bearer ' + tokenNonAdmin)
                            .expect(204, done);
                    }
                });
            });
            after(function() {
                it('should not be able to GET the collection\n', function (done) {
                    collectionsIdQuery("testProd2", function (err, data) {
                        if (err) {
                            return done(err);
                        } else {
                            console.log(data);
                            return request(app)
                                .get('/collections/' + deletedId)
                                .set('collections', 'bearer ' + tokenNonAdmin)
                                .expect(204, done);
                        }
                    });
                });
            });

        });

        describe('PUT /collections/:id', function () {
            it('should update the collection successfully', function (done) {
                collectionsIdQuery("testProd", function (err, _id) {
                    if (err) {
                        return done(err);
                    } else {
                        request(app)
                            .put('/collections/' + _id)
                            .set('authorization', 'bearer ' + tokenNonAdmin)
                            .set('Content-Type', 'application/json')
                            .send({
                                name: "Felicia",
                                description: "This is a girl"
                            })
                            .expect('Content-Type', /json/)
                            .expect(function (res) {
                                res.body.collection.name.should.equal("Felicia", "wrong name");
                                res.body.collection.description.should.equal("This is a girl", "wrong Description");
                            })
                            .expect(200, done);
                    }
                });
            });

            it('should return a status of 204 when a non-existing individual collection is requested', function (done) {
                request(app)
                    .put('/collections/' + "57bc4d605a3daf042376f97d")
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect(204, done);
            });

            it('should return a bad request for collection with status 400', function (done) {
                request(app)
                    .put('/collections/' + "1fewjiofj2wefwe")
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect(400, done);
            });
        });
    });

    function collectionsIdQuery(_name, callback) {
        Collections.findOne({name: _name})
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

});
