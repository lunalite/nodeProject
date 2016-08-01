"use strict";

var express = require('express');
var router = express.Router();
var SessionHandler = require('./session');
var sessionHandler = new SessionHandler();
var isLoggedIn = sessionHandler.isLoggedInMiddleware;
var debug = require('debug')('nodeProject:server');

/* GET home page. */
router.get('/' , isLoggedIn, function (req, res, next) {
    debug('user is authenticated at / page: '+ req.isAuthenticated());
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
