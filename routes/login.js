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
        //console.log('qq ' + req.session.passport.user);
        //console.log('user is authenticated: ' + req.isAuthenticated());

        var token = jwt.sign(req.user, config.secret, {
            expiresIn: '1d' // expires in 24 hours
        });

        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                debug(err);
                next(err);
            } else {
                debug(decoded._doc._id);
                Users.findById(decoded._doc._id, function (err, user) {
                    if (err) {
                        res.statusCode = 204;
                        debug(err);
                        res.send();
                    } else {
                        user.token = token;
                        user.save(function (err, user) {
                            if (err) {
                                res.statusCode = 400;
                                next(err);
                            } else {
                                debug(user);
                                res.json({
                                    _links: {
                                        self: {href: "/users/" + req.params.id},
                                        next: {href: "/"}
                                    },
                                    token: token,
                                    expires: "24 hours",
                                    message: "Please use token as bearer for authentication purposes by passing it" +
                                    " in the header with key value 'Authorization'"
                                });
                            }
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