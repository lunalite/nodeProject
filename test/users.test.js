"use strict";

var request = require('supertest');
var assert = require('chai').assert;
var app = require('../app');
var utils = require('./utils');
var should = require('should');
var User = require('../model/userModel');

describe('Array', function () {
    it('should start empty', function (done) {
        var arr = [];
        assert.equal(arr.length, 0, 'Array length was not 0');
        done();
    });
});

describe('GET /', function () {
    it('should respond with hal format', function (done) {
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
    it('should contain the right HAL format', function(done) {
        request(app)
            .get('/users')
            .set('Accept', 'application/json')
            .expect(function(res) {
                res.body._links.self.href.should.equal("/users");
                res.body._links.next.href.should.equal("/users/:_id");
                res.body.find.href.should.equal("");
                (typeof(res.body.totalCount)).should.equal("number");
            })
            .end(done);
    })
});

describe('Users: models', function () {
    describe('#create()', function () {
        it('should create a new User', function (done) {
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

