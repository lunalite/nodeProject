'use strict';

var db = require('../bin/mongoClient').getDb();

function CollectionSchema(name, description) {
    this._name = name;
    this._description = description;
    this._timeCreated = "";
    this._lastUpdated = "";
    this._links = {};
}

CollectionSchema.prototype.validate = function () {
    if (!this._name) {
        return new Error('missingName');
    }
    var validatedCollection = {
        name: this._name,
        description: this._description,
        timeCreated: this._timeCreated,
        lastUpdated: this._lastUpdated,
        _links: this._links
    };
    return validatedCollection;
};

CollectionSchema.prototype.insertOne = function (database, callback) {
    if (typeof(database) != 'function') {
        db = database;
    } else {
        callback = database;
    }
    var validatedCollection = this.validate();
    if (validatedCollection instanceof Error) {
        return callback(validatedCollection, null);
    }
    db.collection('collections').insertOne(validatedCollection)
        .then(function (collection) {
            db.collection('collections').findOneAndUpdate(
                {_id: collection.ops[0]._id},
                {$set: {_links: {
                    timeCreated: Date.now(),
                    lastUpdated: Date.now(),
                    self: {href: "/collections/" + collection.ops[0]._id}}}},
                {returnOriginal: false},
                function (err, result) {
                    if (err) {
                        return callback(err, null);

                    } else {
                        return callback(null, result, collection.ops[0]._id);
                    }
                }
            );
        }).catch(function (err) {
        return callback(err, null);
    });
};

module.exports = CollectionSchema;
