"use strict";

var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var mongoose = require('mongoose');
var Users = mongoose.model('Users');

router.get('/', function (req, res, next) {
    res.json({
        Message: "Please log in through the local page",
        _links: {
            self: {href: req.originalUrl},
            next: {href: "/login/local"},
            back: {href: "/"}
        }
    });
});

router.get('/local', function (req, res, next) {
    if (req.header("authorization")) {
        var regex = /bearer /;
        var secondCheck = req.header("authorization").split(regex);
        if (secondCheck[1]) {
            Users.findOne({token: secondCheck[1]}, function (err, user) {
                if (err) {
                    next(err);
                } else if (!user) {
                    return res.json({
                        Message: "bearer token is not authenticated. Please try again."
                    });
                } else {
                    jwt.verify(secondCheck[1], config.secret, function (err, decoded) {
                        if (err) {
                            return next(err, {message: "Expired jwt"});
                        } else {
                            return res.json({
                                Message: "You are authenticated.",
                                user: {
                                    _id: decoded._id,
                                    userName: decoded.userName,
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
                Message: "Please enter 'bearer ' in front of your token"
            });
        }
    } else {
        res.json({
            Message: "Please log in with POST request",
            formType: "x-www-form-urlencoded",
            username: "Your username",
            password: "Your password",
            _links: {
                self: {href: req.originalUrl},
            }
        });
    }


});

router.post('/local',
    passport.authenticate('local', {session: false}),
    function (req, res, next) {
        //console.log('successful' + req.user);
        //console.log('user is authenticated: ' + req.isAuthenticated());

        var pseudoUser = {
            _id: req.user._id,
            userName: req.user.userName,
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
                Users.findByIdAndUpdate(decoded._id, {$set: {token: token}}, function (err, user) {
                    if (err) {
                        res.statusCode = 204;
                        res.send();
                    } else {
                        res.json({
                            _links: {
                                self: {href: req.originalUrl},
                                next: {href: "/"}
                            },
                            token: token,
                            expiresIn: config.jwtExpiryTime,
                            message: "Please use token as bearer for authentication purposes by passing it" +
                            " in the header with key value 'Authorization'",
                            authentication: "Send a GET request to /login/local with bearer token to authenticate if" +
                            " token is right"
                        });
                    }
                });
            }
        });
    });


module.exports = router;