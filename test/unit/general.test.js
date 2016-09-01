"use strict";

var request = require('supertest');
var should = require('should');
var app;

describe('GET /nonExistentPages', function () {
    before(function(done) {
        app = require('../../app');
        done();
    });

    it('should return a not found page with status code 404', function (done) {
        request(app)
            .get('/a')
            .expect(404, done);
    });
    //TODO Add more nonsensical pages
});