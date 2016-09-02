'use strict';

var mongoClient = require('../../bin/mongoClient');
var db = mongoClient.getDb();
var express = require('express');
var router = express.Router();
var Collection = require('../../model/CollectionSchema');
var Util = require('../util/util');

/**
 * GET /collections{page, limit, offset}
 * GET collections listing
 *
 * @params =
 *  page: defines page {optional}
 *  limit: defines resources shown per page {optional}
 *  offset: defines offset from the first resource stored in dB {optional}
 */
router.get('/', function (req, res, next) {
    var limit = parseInt(req.query.limit ? req.query.limit : 10, 10);
    var page = parseInt(req.query.page ? req.query.page : 1, 10);
    var offset = parseInt(req.query.offset ? req.query.offset : 0, 10);
    var totalOffset = offset + limit * (page - 1);



    db.collection('collections').count({}, function (err, totalCount) {
        if (err) {
            return next(err);
        } else {
            printResponse(totalCount);
        }
    });
    function printResponse(totalCount) {
        var lastPage = parseInt(Math.ceil((totalCount - offset) / limit), 10);
        db.collection('collections').find({}).limit(limit).skip(totalOffset).toArray(function (err, collections) {
            if (err) {
                return next(err);
            } else {
                res.send({
                    countPerPage: limit ? collections.length : limit,
                    totalCount: totalCount,
                    page: page,
                    _embedded: {
                        collection: collections
                    },
                    _links: Util.getLink('collections', req, page, limit, offset, lastPage)
                });
            }
        });
    }
});

/**
 * GET /collections/:id
 * Get individual collection data
 *
 * @return:
 * status 200: Successful response of a collection
 * status 204: No context - no such resource is available
 * status 400: Bad request - invalid _id format
 */
router.get('/:id', Util.validateMongo_ID, function (req, res, next) {
    db.collection('collections').findOne({_id: mongoClient.objectifyId(req.params.id)},
        function (err, collection) {
            if (err) {
                return next(err);
            } else {
                if (collection) {
                    res.status(200).json({
                        collection: collection
                    });
                } else {
                    res.status(204).send();
                }
            }
        });
});


/**
 * POST /collections
 * Post and create a new collection
 *
 * @format =
 *  {
 *      "name": XXX,            {required}
 *      "description": XXX      {optional}
 *  }
 */
router.post('/', function (req, res, next) {

    //TODO: Add parser check for name
    var collection = new Collection(
        req.body.name,
        req.body.description ? req.body.description : ''
    );
    collection.insertOne(function (err, result) {
        if (err) {
            res.status(400).send({
                error: err.message
            });
        } else {
            res.status(201).send({
                collection: result.value
            });
        }
    });
});

/**
 * PUT /collections/:id
 * Update a collections that is already present
 *
 * @format =
 *  {
 *      "name": XXX,            {optional}
 *      "description": XXX      {optional}
 *  }
 */
router.put('/:id', Util.validateMongo_ID, function (req, res, next) {
    db.collection('collections').findOne({_id: mongoClient.objectifyId(req.params.id)},
        function (err, collection) {
            if (err) {
                return next(err);
            } else {
                if (collection) {
                    var updatedCollection = {
                        name: req.body.name ? req.body.name : collection.name,
                        description: req.body.description ? req.body.description : collection.description,
                        timeCreated: collection.timeCreated,
                        lastUpdated: ( req.body.description || req.body.name ) ? Date.now() : collection.lastUpdated,
                        _links: collection._links
                    };

                    db.collection('collections').findOneAndUpdate({_id: mongoClient.objectifyId(req.params.id)},
                        updatedCollection,
                        {returnOriginal: false},
                        function (err, dbCollection) {
                            if (err) {
                                return next(err);
                            } else {
                                res.json({
                                    collection: dbCollection.value
                                });
                            }
                        });
                } else {
                    res.status(204).send();
                }
            }
        });
});

/**
 * DELETE /collections/:id
 * Delete the specified collection by its :id
 *
 * @return:
 *  status 204: Successfully deleted
 *  status 400: Invalid _id
 */
router.delete('/:id', Util.validateMongo_ID, function (req, res, next) {
    db.collection('collections').findOneAndDelete({_id: mongoClient.objectifyId(req.params.id)},
        function (err, collection) {
            if (err) {
                res.status(204).send(err);
            } else {
                res.status(204).send();
            }
        });
});


module.exports = router;
