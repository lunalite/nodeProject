"use strict";

var express = require('express');
var router = express.Router();
var isLoggedIn = require('./../handler/sessionHandler').isLoggedInMiddleware;
var passport = require('../controller/passportController');

router.get('/', isLoggedIn, function (req, res, next) {
    res.json({
        _links: {
            self: {href: req.originalUrl},
            users: {href: "/users"},
            collections: {href: "/login"}
        }
    });
});

module.exports = router;
