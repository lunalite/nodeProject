"use strict";

var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('should');
var mongoose = require('mongoose');

describe('GET /nonExistentPages', function() {
    before(function(done) {
        var app = require('../../app');
        done();
    });
    it('should return a not found page with status code 404', function(done) {
        request(app)
            .get('/a')
            .expect(404, done);
    });
    //TODO Add more nonsensical pages
});