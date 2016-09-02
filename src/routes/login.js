'use strict';

var express = require('express');
var router = express.Router();
var passport = require('../controller/passportController');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var mongoClient = require('../../bin/mongoClient');
var db = mongoClient.getDb();

router.get('/', function (req, res, next) {
    res.json({
        message: 'Please log in through the local page',
        _links: {
            self: {href: req.originalUrl},
            next: {href: '/login/local'},
            back: {href: '/'}
        }
    });
});

router.get('/local', function (req, res, next) {
    if (req.header('authorization')) {
        var regex = /bearer /;
        var secondCheck = req.header('authorization').split(regex);
        if (secondCheck[1]) {
            db.collection('users').findOne({token: secondCheck[1]}, function (err, user) {
                if (err) {
                    next(err);
                } else if (!user) {
                    return res.json({
                        message: 'bearer token is not authenticated. Please try again.',
                        remedy: {
                            1: "Double check the token you have copied.",
                            2: "Login again via POST /login/local"
                        }
                    });
                } else {
                    jwt.verify(secondCheck[1], config.secret, function (err, decoded) {
                        if (err) {
                            return next(err, {message: 'Expired jwt'});
                        } else {
                            return res.json({
                                message: 'You are authenticated.',
                                user: {
                                    _id: decoded._id,
                                    username: decoded.username,
                                    phoneNumber: decoded.phoneNumber,
                                    tokenStartTime: new Date(decoded.iat * 1000).toString(),
                                    tokenEndTime: new Date(decoded.exp * 1000).toString()
                                }
                            });
                        }
                    });

                }
            });
        } else {
            return res.json({
                message: 'Please enter "bearer" in front of your token'
            });
        }
    } else {
        res.json({
            message: 'Please log in with POST request',
            formType: 'x-www-form-urlencoded',
            username: 'Your username',
            password: 'Your password',
            _links: {
                self: {href: req.originalUrl}
            }
        });
    }


});

router.post('/local',
    passport.authenticate('local', {session: false}),
    function (req, res, next) {
        var pseudoUser = {
            _id: req.user._id,
            username: req.user.username,
            password: req.user.password,
            phoneNumber: req.user.phoneNumber
        };

        var token = jwt.sign(pseudoUser, config.secret, {
            expiresIn: config.jwtExpiryTime
        });
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                next(err);
            } else {
                db.collection('users').findOneAndUpdate(
                    {_id: mongoClient.objectifyId(decoded._id)},
                    {
                        $set: {
                            lastUpdated: Date.now(),
                            token: token
                        }
                    },
                    {returnOriginal: false},
                    function (err, user) {
                        if (err) {
                            res.status(204).send();
                        } else {
                            res.send({
                                token: token,
                                expiresIn: config.jwtExpiryTime,
                                message: 'Please use token as bearer for authentication purposes by passing it' +
                                ' in the header with key value "Authorization"',
                                authentication: 'Send a GET request to /login/local with bearer token to authenticate if' +
                                ' token is right',
                                _links: {
                                    self: {href: req.originalUrl},
                                    authenticateToken: {
                                        href: '/login/local',
                                        method: 'GET'
                                    },
                                    pagesToVisit: {href: '/'}
                                }
                            });
                        }
                    });
            }
        });
    });


module.exports = router;