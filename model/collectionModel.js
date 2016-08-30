"use strict";
var mongoose2 = require('mongoose');
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));

var CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'missingName']
    },
    description: {
      type: String
    },
    timeCreated: {
        type: Date,
        default: Date.now
    },
    _links: {
        type: Object
    }
}, {versionKey: false});

var Collections = mongoose.model('Collections', CollectionSchema);

module.exports = Collections;