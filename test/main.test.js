
var request = require('supertest');
var assert = require('chai').assert;
var expect = require('chai').expect;
var app = require('../app');
var utils = require('./utils');
var should = require('should');
var mongoose = require('mongoose');

describe('Starting Unit tests', function() {
    require('./unit/users.test.js');
    require('./unit/collections.test.js');
    require('./unit/utils.test.js');
});