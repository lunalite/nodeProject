"use strict";

var router = require('express').Router();


var isLoggedIn = require('../SessionHandler').isLoggedInMiddleware();

router.get('/', isLoggedIn, function (req, res, next) {
    res.json({
        _links: {
            self: {href: req.originalUrl},
            collections: {href: "/collections"},
            login: {href: "/login"},
            users: {href: "/users"}
        }
    });
});

module.exports = router;
// var isLoggedIn = sessionHandler.isLoggedInMiddleware();


//router.use('/collections', isLoggedIn, require('/collections'));


