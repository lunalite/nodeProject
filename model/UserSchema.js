'use strict';

var db = require('../bin/mongoClient').getDb();

function UserSchema(username, password, phoneNumber, isAdmin) {
    this._username = username;
    this._password = password;
    this._phoneNumber = phoneNumber;
    this._token = "";
    this._isAdmin = isAdmin;
    this._timeCreated = "";
    this._lastUpdated = "";
    this._links = {};
}

UserSchema.prototype.validate = function () {
    var validatedUser = {
        username: this._username,
        password: this._password,
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
    db.collection('users').insertOne(this.validate())
        .then(function (user) {
            db.collection('users').findOneAndUpdate(
                {_id: user.ops[0]._id},
                {
                    $set: {
                        timeCreated: Date.now(),
                        lastUpdated: Date.now(),
                        _links: {self: {href: "/users/" + user.ops[0]._id}}
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
};

    module.exports = UserSchema;
