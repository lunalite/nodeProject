"use strict";

var express = require('express');
var router = express.Router();
var debug = require('debug')('nodeProject:server');
var passport = require('../config/passport');

router.get('/', function (req, res, next) {
    res.json({
        Message: "Please log in with POST request",
        formType: "x-www-form-urlencoded",
        userName: "username",
        password: "pw",
        _links: {
            self: "/login"
        }

    });
});

router.post('/',
    passport.authenticate('local'),
    function (req, res) {
        console.log('successful' + req.user);
        console.log('qq '+ req.session.passport.user);
        console.log('user is authenticated: '+ req.isAuthenticated());
        res.redirect('/users');
    });

module.exports = router;