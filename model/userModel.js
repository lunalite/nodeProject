"use strict";

var mongoose = require('mongoose');
var debug = require('debug')('nodeProject:server');

var UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'emptyUserName'],
        validate: {
            validator: function (v) {
                return (/[a-zA-Z]{0,10}/).test(v);
            },
            message: "invalidUserName"
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
}, { versionKey: false });

/*
 ** This pre-hook will assert incoming requests and send an error if its not valid.
 *//*
 UserSchema.pre('save', function (next) {
 "use strict";
 var self = this;
 var errJson = {"error": []};

 if (this.phone === 'undefined') {
 errJson.error.push("missingPhone");
 }

 debug(JSON.stringify(errJson));
 //var err = new Error('userSchemaError');
 //next(err);
 });*/
var User = mongoose.model('User', UserSchema);

module.exports = User;