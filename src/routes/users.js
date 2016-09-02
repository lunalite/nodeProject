'use strict';

var mongoClient = require('../../bin/mongoClient');
var db = mongoClient.getDb();
var express = require('express');
var router = express.Router();
var isLoggedIn = require('./../handler/sessionHandler').isLoggedInMiddleware;
var isAdmin = require('./../handler/sessionHandler').isAdminMiddleware;
var Util = require('../util/util');
var User = require('../../model/UserSchema');

router.use('/', isLoggedIn, isAdmin, function (req, res, next) {
    next();
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    var limit = parseInt(req.query.limit ? req.query.limit : 10, 10);
    var page = parseInt(req.query.page ? req.query.page : 1, 10);
    var offset = parseInt(req.query.offset ? req.query.offset : 0, 10);
    var totalOffset = offset + limit * (page - 1);

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
                    countPerPage: limit ? users.length : limit,
                    totalCount: totalCount,
                    page: page,
                    _embedded: {
                        users: users
                    },
                    _links: Util.getLink('users', req, page, limit, offset, lastPage)

                });
            }
        });
    }
});

router.get('/:id', function (req, res, next) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        db.collection('users').findOne({_id: mongoClient.objectifyId(req.params.id)},
            function (err, user) {
                if (err) {
                    return next(err);
                } else {
                    // console.log(user);
                    if (user) {
                        res.json({
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
            message: 'Password is of invalid format.',
            Requirement: 'At least 8 characters; At least 1 numerical, 1 small letter, 1 capital letter',
            _links: {
                self: {
                    href: '/users/'
                },
                back: {
                    href: '/'
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
        db.collection('users').findOne({_id: mongoClient.objectifyId(req.params.id)},
            function (err, user) {
                if (err) {
                    return next(err);
                } else {
                    if (user) {
                        var updatedUser = {
                            username: req.body.username ? req.body.username : user.username,
                            password: req.body.password ? Util.encryptPassword(req.body.password) : user.password,
                            phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : user.phoneNumber,
                            token: user.token,
                            isAdmin: req.body.isAdmin ? req.body.isAdmin : user.isAdmin,
                            timeCreated: user.timeCreated,
                            lastUpdated: ( req.body.username || req.body.phoneNumber || req.body.password || req.body.isAdmin) ?
                                Date.now() : user.lastUpdated,
                            _links: user._links
                        };

                        db.collection('users').findOneAndUpdate({_id: mongoClient.objectifyId(req.params.id)},
                            updatedUser,
                            {returnOriginal: false},
                            function (err, dbUser) {
                                if (err) {
                                    res.statusCode = 400;
                                    return next(err);
                                } else {
                                    res.json({
                                        user: dbUser.value
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
    db.collection('users').findOneAndDelete({_id: mongoClient.objectifyId(req.params.id)},
        function (err, user) {
            if (err) {
                res.status(204).send(err);
            } else {
                res.status(204).send();
            }
        });
});

function enterValidId(req, res) {
    res.status(400).send({
        message: 'Please enter a valid _id',
        _links: {
            self: {
                href: '/users/' + req.params.id
            },
            back: {
                href: '/users/'
            }
        }
    });
}

module.exports = router;
