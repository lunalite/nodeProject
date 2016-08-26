"use strict";

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Collections = require('../model/collectionModel');
var isLoggedIn = require('./session').isLoggedInMiddleware;
var isAdmin = require('./session').isAdminMiddleware;
var Promise = require('bluebird');

mongoose.Promise = Promise;

router.use('/', isLoggedIn, function (req, res, next) {
    next();
});


/* GET Collections listing. */
router.get('/', function (req, res, next) {
    var limit = parseInt(req.query.limit ? req.query.limit : 10, 10);
    var page = parseInt(req.query.page ? req.query.page : 1, 10);
    var offset = parseInt(req.query.offset ? req.query.offset : 0, 10);
    var totalOffset = offset + limit * (page - 1);
    Collections.count({}, function (err, totalCount) {
        if (err) {
            return next(err);
        } else {
            return totalCount;
        }
    }).exec()
        .then(function (totalCount) {
            Collections.find(
                {},
                function (err, collections) {
                    if (err) {
                        return next(err);
                    } else {
                        var lastPage = parseInt(Math.ceil((totalCount - offset) / limit), 10);
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
                                            req.query.offset ? pageQueryShow("next") + offsetQueryShow("&") : ""))
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
                                find: {href: ""}
                            },
                            countPerPage: limit ? collections.length : limit,
                            totalCount: totalCount,
                            page: page,
                            _embedded: {
                                collection: collections
                            }
                        });
                    }
                }
            )
                .limit(limit)
                .skip(totalOffset);
        });

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
    Collections.findById(req.params.id, function (err, collection) {
        if (err) {
            return next(err);
        } else {
            if (collection) {
                res.status(200).json({
                    _links: {
                        self: {href: req.originalUrl},
                        back: {href: "/collections/"}
                    },
                    collection: collection
                });
            } else {
                res.status(204).send();
            }
        }
    });
});

router.post('/', function (req, res, next) {
    var collection = new Collections({
        name: req.body.name,
        description: req.body.description
    });
    collection.save(function (err) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(201).send(collection);
        }
    });
});

router.put('/:id', function (req, res, next) {
    Collections.findById(req.params.id, function (err, collection) {
        if (err) {
            return next(err);
        } else {
            if (collection) {
                var updatedCollection = {
                    name: req.body.name ? req.body.name : collection.name,
                    description: req.body.description ? req.body.description : collection.description,
                };

                Collections.findOneAndUpdate({_id: collection._id}, updatedCollection, {new: true}, function (err, dbCollection) {
                    if (err) {
                        return next(err);
                    } else {
                        res.json({
                            _links: {
                                self: {href: req.originalUrl},
                                back: {href: "/collections/"}
                            },
                            collection: dbCollection
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
    Collections.remove({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            res.status(204).send();
        }
    });
});


module.exports = router;
