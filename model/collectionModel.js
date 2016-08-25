"use strict";

var mongoose = require('mongoose');

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
    }
}, {versionKey: false});

var Collections = mongoose.model('Collections', CollectionSchema);

module.exports = Collections;