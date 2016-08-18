"use strict";

var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var jwt = require('jsonwebtoken');
var debug = require('debug')('nodeProject:server');
var config = require('../config/config');
var Users = require('../model/userModel');

router.get('/', function (req, res, next) {
    res.json({
        Message: "Please log in through the local page",
        _links: {
            self: "/login",
            next: [
                "/login/local",
                "/login/bearer"
            ]
        }
    });
});

router.get('/local', function (req, res, next) {
    res.json({
        Message: "Please log in with POST request",
        formType: "x-www-form-urlencoded",
        userName: "Your username",
        password: "Your password",
        _links: {
            self: "/login/local"
        }
    });
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
            expiresIn: '1h' // expires in 1 hour
        });

        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                debug("error 1 " + err);
                next(err);
            } else {
                debug(decoded._id);
                Users.findByIdAndUpdate(decoded._id, {$set: {token: token}}, function (err, user) {
                    if (err) {
                        res.statusCode = 204;
                        debug(err);
                        res.send();
                    } else {
                        debug("user is " + user);
                        res.json({
                            _links: {
                                self: {href: "/users/" + user._id},
                                next: {href: "/"}
                            },
                            token: token,
                            expiresIn: "1 hour",
                            message: "Please use token as bearer for authentication purposes by passing it" +
                            " in the header with key value 'Authorization'"
                        });
                    }
                });
            }
        });
    });


router.get('/bearer',
    passport.authenticate('bearer', {session: false}),
    function (req, res) {
        res.json(req.user);
    });


module.exports = router;