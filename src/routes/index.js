'use strict';

var express = require('express');
var router = express.Router();
var isLoggedIn = require('./../handler/sessionHandler').isLoggedInMiddleware;
var isAdmin = require('./../handler/sessionHandler').isAdminMiddleware;

router.get('/', isLoggedIn, function (req, res, next) {
    res.json({
        _links: {
            self: {href: req.originalUrl},
            users: {href: '/users'},
            collections: {href: '/collections'}
        }
    });
});

router.use('/login', require('./login'));
router.use('/users', isLoggedIn, isAdmin, require('./users'));
router.use('/collections', isLoggedIn, require('./collections'));

module.exports = router;
