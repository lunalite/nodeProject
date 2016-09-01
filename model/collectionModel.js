"use strict";

var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));

module.exports = function () {
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

    mongoose.model('Collections', CollectionSchema);
};
