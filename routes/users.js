"use strict";

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var isLoggedIn = require('./session').isLoggedInMiddleware;
var isAdmin = require('./session').isAdminMiddleware;
var Utils = require('../utils');

router.use('/', isLoggedIn, isAdmin, function (req, res, next) {
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
                        },
                        back: {
                            href: "/users/"
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
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        Users.findById(req.params.id, function (err, user) {
            if (err) {
                return next(err);
            } else {
                if (user) {
                    res.json({
                        _links: {
                            self: {
                                href: "/users/" + req.params.id
                            },
                            back: {
                                href: "/users/"
                            }
                        },
                        user: user
                    });
                } else {
                    res.status(204).send();
                }
            }
        });
    } else {
        enterValidId(req, res);
    }
});

router.post('/', function (req, res, next) {
    var passwordFromReq = req.body.password;
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    var passwordCheck = passwordRegex.exec(passwordFromReq);
    if (!passwordCheck) {
        return res.status(400).send({
            message:"Password is of invalid format.",
            Requirement: "At least 8 characters; At least 1 numerical, 1 small letter, 1 capital letter",
            _links: {
                self: {
                    href: "/users/"
                },
                back: {
                    href: "/"
                }
            }
        });
    }

    var user = new Users({
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        password: Utils.encryptPassword(passwordFromReq),
        isAdmin: req.body.isAdmin ? req.body.isAdmin : false
    });
    user.save(function (err) {
        if (err) {
            res.statusCode = 400;
            res.send(err);
        } else {
            res.status(201).send(user);
        }
    });
});

router.put('/:id', function (req, res, next) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        Users.findById(req.params.id, function (err, user) {
            if (err) {
                return next(err);
            } else {
                if (user) {
                    var updatedUser = {
                        userName: req.body.userName ? req.body.userName : user.userName,
                        phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : user.phoneNumber,
                        password: req.body.password ? req.body.password : user.password,
                        isAdmin: req.body.isAdmin ? req.body.isAdmin : user.isAdmin
                    };

                    Users.findOneAndUpdate({_id: user._id}, updatedUser, {new: true}, function (err, dbUser) {
                        if (err) {
                            res.statusCode = 400;
                            return next(err);
                        } else {
                            res.json({
                                _links: {
                                    self: {
                                        href: "/users/" + req.params.id
                                    },
                                    back: {
                                        href: "/users/"
                                    }
                                },
                                user: dbUser
                            });
                        }
                    });
                } else {
                    res.status(204).send();
                }
            }
        });
    } else {
        enterValidId(req, res);
    }
});

router.delete('/:id', function (req, res, next) {
    Users.remove({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            res.status(204).send();
        }
    });
});

function enterValidId(req, res) {
    res.status(400).send({
        message: "Please enter a valid _id",
        _links: {
            self: {
                href: "/users/" + req.params.id
            },
            back: {
                href: "/users/"
            }
        }
    });
}

module.exports = router;
