"use strict";

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'emptyUserName'],
        validate: {
            validator: function (v) {
                return (/[a-zA-Z]{0,20}/).test(v);
            },
            message: "invalidUserName"
        }
    },
    token: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'emptyPassword']
    },
    phoneNumber: {
        type: Number,
        required: [true, 'emptyPhoneNumber'],
        validate: {
            validator: function (v) {
                return (/\d{8}/).test(v);
            },
            message: "invalidPhoneNumber"
        }
    },
    isAdmin: {
        type: Boolean
    },
    timeCreated: {
        type: Date,
        default: Date.now
    },
    _links: {
        type: Object
    }
}, {versionKey: false});

var Users = mongoose.model('Users', UserSchema);

module.exports = Users;