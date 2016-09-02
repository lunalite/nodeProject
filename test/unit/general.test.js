"use strict";

var request = require('supertest');
var should = require('should');
var app;

describe('Running general unit tests', function () {
    var tokenNonAdmin;

    before(function nonAdminLoginAuth(done) {
        app = require('../../src/app');
        request(app)
            .post('/login/local')
            .send('username=testName')
            .send('password=qwe123QWE')
            .expect(function (res) {
                should.exist(res.body.token);
                tokenNonAdmin = res.body.token;
            })
            .expect(200, done);
    });

    describe('GET /nonExistentPages', function () {
        it('should return a not found page with status code 404', function (done) {
            request(app)
                .get('/usersX')
                .expect(function (res) {
                    res.body.message.should.equal("Page Not Found");
                    should.exist(res.body.remedy);
                })
                .expect(404, done);
        });
        //TODO Add more nonsensical pages
    });

    describe('HTTP requests', function () {
        describe('GET /', function () {
            it('should respond with halson format\n', function (done) {
                request(app)
                    .get('/')
                    .set('authorization', 'bearer ' + tokenNonAdmin)
                    .expect('Content-Type', /json/)
                    .expect(function (res) {
                        res.body._links.self = '/';
                        res.body._links.users = '/users';
                        res.body._links.collections = '/collections';
                    })
                    .expect(200, done);
            });
        });

    });
});