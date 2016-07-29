"use strict";

var express = require('express');
var router = express.Router();
var User = require('../model/userModel');
var debug = require('debug')('nodeProject:server');

/* GET users listing. */
router.get('/', function (req, res, next) {
    var countPerPage = req.query.limit;
    var offset = req.query.offset;
    User.find(
        {},
        function (err, users) {
            if (err) {
                res.status(204).send(err);
            } else {
                res.json({
                    _links: {
                        self: {
                            href: "/users"
                        },
                        next: {
                            href: "/users/:_id"
                        }
                    },
                    find: {
                        // TODO: implement find function
                        href: ""
                    },
                    count: countPerPage,
                    totalCount: users.length,
                    _embedded: {
                        user: users
                    }
                });
            }
        }
    )
        .limit(parseInt(countPerPage, 10))
        .skip(parseInt(offset, 10));
});

router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            res.statusCode = 204;
            debug(err);
            res.send();
        } else {
            res.json({
                _links: {
                    self: {
                        href: "/users/" + req.params.id
                    }
                },
                user: user
            });
        }
    });
});

router.post('/', function (req, res, next) {
    var user = new User({
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        //TODO make password request hidden
        password: req.body.password
    });
    debug("Post: " + user);
    user.save(function (err) {
        if (err) {
            res.statusCode = 400;
            next(err);
        } else {
            res.status(201).send(user);
        }
    });
});

router.put('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            user.userName = req.body.userName;
            user.phoneNumber = req.body.phoneNumber;
            user.save(function (err) {
                if (err) {
                    res.statusCode = 400;
                    next(err);
                } else {
                    res.json({
                        _links: {
                            self: {
                                href: "/users/"+req.params.id
                            }
                        },
                        user: user
                    });
                }
            });
        }
    });
});

router.delete('/:id', function (req, res, next) {
    User.remove({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            res.status(204).send();
            debug("DELETE " + user);
        }
    });
});

module.exports = router;
