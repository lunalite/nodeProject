"use strict";

var mongoClient = require('../../bin/mongoClient');
var db = mongoClient.getDb();
var express = require('express');
var router = express.Router();
var isLoggedIn = require('./../handler/sessionHandler').isLoggedInMiddleware;
var isAdmin = require('./../handler/sessionHandler').isAdminMiddleware;
var Util = require('../util/util');
var User = require('../../model/UserSchema');

router.use('/', /*isLoggedIn, isAdmin,*/ function (req, res, next) {
    next();
});


/* GET users listing. */
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

    db.collection('users').count({}, function (err, totalCount) {
        if (err) {
            return next(err);
        } else {
            printResponse(totalCount);
        }
    });
    function printResponse(totalCount) {
        var lastPage = parseInt(Math.ceil((totalCount - offset) / limit), 10);
        db.collection('users').find({}).limit(limit).skip(totalOffset).toArray(function (err, users) {
            if (err) {
                res.status(204).send(err);
            } else {
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
        });
    }
});

router.get('/:id', function (req, res, next) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        db.collection('users').findOne({_id: mongoClient.objectifyId(req.params.id)}, function (err, user) {
            if (err) {
                return next(err);
            } else {
                console.log(user);
                if (user) {
                    res.json({
                        _links: {
                            back: {href: "/users/"}
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
        var user = new User(
            req.body.username,
            Util.encryptPassword(passwordFromReq),
            req.body.phoneNumber,
            req.body.isAdmin ? req.body.isAdmin : false);

        user.insertOne(function (err, result) {
            if (err) {
                res.status(400).send(err);
            }
            res.status(201).send({
                user: result.value
            });
        });
    }
});

router.put('/:id', function (req, res, next) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        db.collection('users').findById(req.params.id, function (err, user) {
            if (err) {
                return next(err);
            } else {
                if (user) {
                    var updatedUser = {
                        username: req.body.username ? req.body.username : user.username,
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
    db.collection('users').remove({
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
