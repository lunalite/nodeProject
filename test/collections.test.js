"use strict";

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var app = require('../app');
var utils = require('./utils');
var should = require('should');
var mongoose = require('mongoose');
var Collections = mongoose.model('Collections');

before(function (done) {
    console.log("Running Collections pre-test configuration...");

    var CollectionArray = [{
        name: "testProd",
        description: "This is a test production"
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


describe('Authenticated collections test', function() {
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
            .end(done);
    });

    it('GET all collections', function(done) {
        request(app)
            .get('/collections')
            .set('authorization', 'bearer ' + tokenNonAdmin)
            .expect(200, done);
    });

    it('GET collections based on page number');
    it('GET collections based on numbers per page');
    it('GET an individual collection');
    it('POST a new item successfully');
    it('POST new item without name returns error missingName.');
    it('DELETE an item successfully');
    it('PUT an item successfully');

});