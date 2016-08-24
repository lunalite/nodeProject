"use strict";

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var app = require('../../app');
var utils = require('./../utils');
var should = require('should');
var mongoose = require('mongoose');

describe('GET /nonExistentPages', function() {
    it('should return a not found page with status code 404', function(done) {
        request(app)
            .get('/a')
            .expect(function(res) {
                console.log("This is the res body:" + JSON.stringify(res.body));
                console.log("This is the res:" + JSON.stringify(res));
                res.body.message.should.equal("Not Found");
            })
            .expect(404, done);
    });
    //TODO Add more nonsensical pages
});