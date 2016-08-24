"use strict";

var express = require('express');
var router = express.Router();
var isLoggedIn = require('./session').isLoggedInMiddleware;
var passport = require('../config/passport');

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
    res.json({
        _links: {
            self: "/",
            next: [
                "/users",
                "/login"
            ]
        }
    });
});

module.exports = router;
