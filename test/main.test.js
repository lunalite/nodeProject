
var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var app = require('../app');
var should = require('should');

describe('Starting Unit tests', function() {
    require('./utils.test');
    require('./unit/users.test.js');
    require('./unit/collections.test.js');
    require('./unit/general.test.js');
});