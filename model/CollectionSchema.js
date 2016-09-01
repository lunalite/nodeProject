'use strict';

var db = require('../bin/mongoClient').getDb();

function CollectionSchema(name, description) {
    this._name = name;
    this._description = description;
    this._timeCreated = "";
    this._lastUpdated = "";
    this._links = {};
}

CollectionSchema.prototype.insertOne = function(callback) {
    db.collection('collections').insertOne({
        name: this._name,
        description: this._description,
        timeCreated: Date.now(),
        lastUpdated: Date.now(),
        _links: this._links
    }).then(function(collection) {
        db.collection('collections').findOneAndUpdate(
            {_id: collection.ops[0]._id},
            {$set:{_links: {self: {href: "/collections/" + collection.ops[0]._id}}}},
            {returnOriginal: false},
            function(err, result) {
                if (err) {
                    return callback(err, null);

                } else {
                    console.log(result);
                    return callback(null, result, collection.ops[0]._id);
                }
            }
        );
    }).catch(function(err) {
        return callback(err, null);
    });
};

module.exports = CollectionSchema;
