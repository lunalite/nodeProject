"use strict";

var express = require('express');
var router = express.Router();
var Users = require('../model/userModel');
var isLoggedIn = require('./session').isLoggedInMiddleware;
var debug = require('debug')('nodeProject:server');


router.use('/', isLoggedIn, function (req, res, next) {
    debug('User is authenticated at /users: ' + req.isAuthenticated());
    next();
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    var countPerPage = req.query.limit;
    var offset = req.query.offset;
    Users.find(
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
    Users.findById(req.params.id, function (err, user) {
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
    var user = new Users({
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        //TODO make password request hidden
        password: req.body.password,
        isAdmin: req.body.isAdmin
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
    Users.findById(req.params.id, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            var updatedUser = {
                userName: req.body.userName ? req.body.userName : user.userName,
                phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : user.phoneNumber,
                password: req.body.password ? req.body.password : user.password,
                isAdmin: req.body.isAdmin ? req.body.isAdmin : user.isAdmin
            };

            Users.findOneAndUpdate({_id: user._id}, updatedUser, {new: true}, function (err, dbUser) {
                if (err) {
                    res.statusCode = 400;
                    next(err);
                } else {
                    res.json({
                        _links: {
                            self: {
                                href: "/users/" + req.params.id
                            }
                        },
                        user: dbUser
                    });
                }
            });
        }
    });
});

router.delete('/:id', function (req, res, next) {
    Users.remove({
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
