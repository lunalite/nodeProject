"use strict";

var express = require('express');
var router = express.Router();
var Collections = require('../model/collectionModel');
var isLoggedIn = require('./session').isLoggedInMiddleware;
var isAdmin = require('./session').isAdminMiddleware;


router.use('/', isLoggedIn, function (req, res, next) {
    next();
});


/* GET Collections listing. */
router.get('/', function (req, res, next) {
    var countPerPage = req.query.limit;
    var offset = req.query.offset;
    Collections.count({}, function (err, totalCount) {
        if (err) {
            return next(err);
        } else {
            return totalCount;
        }
    }).then(function (totalCount) {
        Collections.find(
            {},
            function (err, collections) {
                if (err) {
                    return next(err);
                } else {
                    res.json({
                        _links: {
                            self: {
                                href: "/collections"
                            },
                            next: {
                                href: "/collections/:_id"
                            },
                            "offset & limit": {
                                href: "/collections?limit=__&offset=__"
                            },
                            find: {
                                // TODO: implement find function
                                href: ""
                            }
                        },
                        countPerPage: countPerPage ? collections.length : countPerPage,
                        totalCount: totalCount,
                        _embedded: {
                            collection: collections
                        }
                    });
                }
            }
        )
            .limit(parseInt(countPerPage, 10))
            .skip(parseInt(offset, 10));
    });

});

router.use('/:id', function (req, res, next) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        res.status(400).send({
            message: "Please enter a valid _id",
            _links: {
                self: {
                    href: "/collections/" + req.params.id
                },
                back: {
                    href: "/collections/"
                }
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
                        self: {
                            href: "/collections/" + req.params.id
                        },
                        back: {
                            href: "/collections/"
                        }
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
                                self: {
                                    href: "/collections/" + req.params.id
                                },
                                back: {
                                    href: "/collections/"
                                }
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
