"use strict";

var mongoose = require('mongoose');
var debug = require('debug')('nodeProject:server');

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
    password: {
        type: String,
        required: [true, 'emptyPassword'],
        validate: {
            validator: function (v) {
                return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/).test(v);
            },
            message: "invalidPassword"
        }
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
    timeCreated: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false});

var User = mongoose.model('User', UserSchema);

module.exports = User;