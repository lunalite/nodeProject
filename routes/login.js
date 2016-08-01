"use strict";

var express = require('express');
var router = express.Router();
var debug = require('debug')('nodeProject:server');
var passport = require('../config/passport');

router.get('/', function (req, res, next) {
    res.json({
        "content-Type": "application/JSON",
        userName: "user",
        password: "pw"

    });
});

router.post('/',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        console.log('successful');
        res.redirect('/users');
    });


module.exports = router;