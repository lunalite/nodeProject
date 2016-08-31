"use strict";

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var isLoggedIn = require('./../sessionHandler').isLoggedInMiddleware;
var isAdmin = require('./../sessionHandler').isAdminMiddleware;
var Utils = require('../util/util');
var assert = require('assert');
var Promise = require('bluebird');

mongoose.Promise = Promise;

router.use('/', isLoggedIn, isAdmin, function (req, res, next) {
    next();
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    var limit = parseInt(req.query.limit ? req.query.limit : 10, 10);
    var page = parseInt(req.query.page ? req.query.page : 1, 10);
    var offset = parseInt(req.query.offset ? req.query.offset : 0, 10);
    var totalOffset = offset + limit * (page - 1);
    Users.count({}, function (err, totalCount) {
        if (err) {
            return next(err);
        } else {
            return totalCount;
        }
    }).exec()
        .then(function (totalCount) {
            Users.find(
                {},
                function (err, users) {
                    if (err) {
                        res.status(204).send(err);
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
                                    href: lastPage > 0 ? "/users?page=1" + limitQueryShow("&") + offsetQueryShow("&") : ""
                                },
                                next: {
                                    href: (page >= lastPage) ? "" : ("/users?" + (
                                        req.query.page ? pageQueryShow("next") + limitQueryShow("&") + offsetQueryShow("&") :
                                            req.query.limit ? pageQueryShow("next") + limitQueryShow("&") + offsetQueryShow("&") :
                                                req.query.offset ? pageQueryShow("next") + offsetQueryShow("&") : ""))
                                },
                                previous: {
                                    href: (page <= 1 || page > lastPage) ? "" : ("/users?" + (
                                        req.query.page ? pageQueryShow("previous") + limitQueryShow("&") + offsetQueryShow("&") :
                                            req.query.limit ? pageQueryShow("previous") + limitQueryShow("&") + offsetQueryShow("&") :
                                                req.query.offset ? pageQueryShow("previous") + offsetQueryShow("&") : ""))
                                },
                                last: {
                                    href: lastPage > 0 ? "/users?page=" + lastPage + limitQueryShow("&") + offsetQueryShow("&") : ""
                                },
                                // TODO: implement find function
                                find: {href: ""}
                            },
                            countPerPage: limit ? users.length : limit,
                            totalCount: totalCount,
                            page: page,
                            _embedded: {
                                users: users
                            }
                        });
                    }
                }
            )
                .limit(limit)
                .skip(totalOffset);
        });
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
            message: "Password is of invalid format.",
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
    } else {
        var user = new Users({
            userName: req.body.userName,
            phoneNumber: req.body.phoneNumber,
            password: Utils.encryptPassword(passwordFromReq),
            isAdmin: req.body.isAdmin ? req.body.isAdmin : false
        });
        user.save(function (err) {
            if (err) {
                res.status(400).send(err);
            }
            return new Promise(function (resolve, reject) {
                resolve(Users.update({_id: user._id},
                    {_links: {self: {href: "/users/" + user._id}}}));
            });
        }).then(function () {
            res.status(201).send({
                user: user,
                _links: {
                    self: {href: "/users/" + user._id}
                }
            });
        }).catch(function (error) {
            next(error);
        });
    }
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
