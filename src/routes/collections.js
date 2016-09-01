"use strict";

var mongoClient = require('../../bin/mongoClient');
var db = mongoClient.getDb();
var express = require('express');
var router = express.Router();
var isLoggedIn = require('./../handler/sessionHandler').isLoggedInMiddleware;
var isAdmin = require('./../handler/sessionHandler').isAdminMiddleware;
var Collection = require('../../model/CollectionSchema');

router.use('/', isLoggedIn, function (req, res, next) {
    next();
});


/* GET Collections listing. */
router.get('/', function (req, res, next) {
    var limit = parseInt(req.query.limit ? req.query.limit : 10, 10);
    var page = parseInt(req.query.page ? req.query.page : 1, 10);
    var offset = parseInt(req.query.offset ? req.query.offset : 0, 10);
    var totalOffset = offset + limit * (page - 1);

    var pageQueryShow = function (pageOrder) {
        if (pageOrder == "next") {
            return req.query.page ? "page=" + (page + 1) : "page=2";
        } else {
            return req.query.page ? "page=" + (page - 1) : "";
        }
    };
    var limitQueryShow = function (qualifier) {
        return req.query.limit ? qualifier + "limit=" + limit : "";
    };
    var offsetQueryShow = function (qualifier) {
        return req.query.offset ? qualifier + "offset=" + offset : "";
    };

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
                    _links: {
                        self: {href: req.originalUrl},
                        first: {
                            href: lastPage > 0 ? "/collections?page=1" + limitQueryShow("&") + offsetQueryShow("&") : ""
                        },
                        next: {
                            href: (page >= lastPage) ? "" : ("/collections?" + (
                                req.query.page ? pageQueryShow("next") + limitQueryShow("&") + offsetQueryShow("&") :
                                    req.query.limit ? pageQueryShow("next") + limitQueryShow("&") + offsetQueryShow("&") :
                                        req.query.offset ? pageQueryShow("next") + offsetQueryShow("&") :
                                            pageQueryShow("next")))
                        },
                        previous: {
                            href: (page <= 1 || page > lastPage) ? "" : ("/collections?" + (
                                req.query.page ? pageQueryShow("previous") + limitQueryShow("&") + offsetQueryShow("&") :
                                    req.query.limit ? pageQueryShow("previous") + limitQueryShow("&") + offsetQueryShow("&") :
                                        req.query.offset ? pageQueryShow("previous") + offsetQueryShow("&") : ""))
                        },
                        last: {
                            href: lastPage > 0 ? "/collections?page=" + lastPage + limitQueryShow("&") + offsetQueryShow("&") : ""
                        },
                        // TODO: implement find function
                        find: {href: "/collections?"}
                    },
                    countPerPage: limit ? collections.length : limit,
                    totalCount: totalCount,
                    page: page,
                    _embedded: {
                        collection: collections
                    }
                });
            }
        });
    }
});

router.use('/:id', function (req, res, next) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        res.status(400).send({
            message: "Please enter a valid _id",
            _links: {
                self: {href: req.originalUrl},
                back: {href: "/collections/"}
            }
        });
    }
});

router.get('/:id', function (req, res, next) {
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

router.post('/', function (req, res, next) {

    //TODO: Add parser check for name
    var collection = new Collection(
        req.body.name,
        req.body.description ? req.body.description : ""
    );

    collection.insertOne(function (err, result) {
        if (err) {
            res.status(400).send(err);
        }
        res.status(201).send({
            collection: result.value
        });
    });
});

router.put('/:id', function (req, res, next) {
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

router.delete('/:id', function (req, res, next) {
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
