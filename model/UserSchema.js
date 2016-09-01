'use strict';

var db = require('../bin/mongoClient').getDb();

function UserSchema(username, password, phoneNumber, isAdmin) {
    this._username = username;
    this._password = password;
    this._phoneNumber = phoneNumber;
    this._token = "";
    this._isAdmin = isAdmin;
    this._links = {};
}

UserSchema.prototype.insertOne = function(callback) {
    db.collection('users').insertOne({
        username: this._username,
        password: this._password,
        phoneNumber: this._phoneNumber,
        token: this._token,
        isAdmin: this._isAdmin,
        _links: this._links
    }).then(function(user) {
        db.collection('users').findOneAndUpdate(
            {_id: user.ops[0]._id},
            {$set:{_links: {self: {href: "/users/" + user.ops[0]._id}}}},
            {returnOriginal: false},
            function(err, result) {
                if (err) {
                    return callback(err, null);

                } else {
                    console.log(result);
                    return callback(null, result, user.ops[0]._id);
                }
            }
        );
    }).catch(function(err) {
        return callback(err, null);
    });
};

module.exports = UserSchema;
/*module.exports = function() {
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

    mongoose.model('Users', UserSchema);
};*/
