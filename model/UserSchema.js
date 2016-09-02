'use strict';

var db = require('../bin/mongoClient').getDb();
var Util = require('../src/util/util');

function UserSchema(username, password, phoneNumber, isAdmin) {
    this._username = username;
    this._password = password;
    this._phoneNumber = phoneNumber;
    this._token = '';
    this._isAdmin = isAdmin ? isAdmin : false;
    this._timeCreated = '';
    this._lastUpdated = '';
    this._links = {};
}

UserSchema.prototype.validate = function () {
    if (!this._username) {
        var errUser = new Error('Missing username');
        errUser.status = 400;
        errUser.remedy = {
            1: 'Check JSON request of username key existence.'
        };
        return errUser;
    }
    if (!this._password) {
        var errPass = new Error('Missing password');
        errPass.status = 400;
        errPass.remedy = {
            1: 'Check JSON request of password key existence.'
        };
        return errPass;
    }
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    var passwordCheck = passwordRegex.exec(this._password);
    if (!passwordCheck) {
        var errPassFormat = new Error('Invalid Password Format');
        errPassFormat.status = 400;
        errPassFormat.remedy = {
            1: 'At least 8 characters; At least 1 numerical, 1 small letter, 1 capital letter.'
        };
        return errPassFormat;
    }

    var validatedUser = {
        username: this._username,
        password: Util.encryptPassword(this._password),
        phoneNumber: this._phoneNumber,
        token: this._token,
        isAdmin: this._isAdmin,
        timeCreated: this._timeCreated,
        lastUpdated: this._lastUpdated,
        _links: this._links
    };
    return validatedUser;
};

UserSchema.prototype.insertOne = function (database, callback) {
    if (typeof(database) !== 'function') {
        db = database;
    } else {
        callback = database;
    }
    var validatedUser = this.validate();
    if (validatedUser instanceof Error) {
        return callback(validatedUser, null);
    } else {
        db.collection('users').insertOne(validatedUser)
            .then(function (user) {
                db.collection('users').findOneAndUpdate(
                    {_id: user.ops[0]._id},
                    {
                        $set: {
                            timeCreated: Date.now(),
                            lastUpdated: Date.now(),
                            _links: {self: {href: '/users/' + user.ops[0]._id}}
                        }
                    },
                    {returnOriginal: false},
                    function (err, result) {
                        if (err) {
                            return callback(err, null);

                        } else {
                            return callback(null, result, user.ops[0]._id);
                        }
                    }
                );
            }).catch(function (err) {
            return callback(err, null);
        });
    }
};

module.exports = UserSchema;
