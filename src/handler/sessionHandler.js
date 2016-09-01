"use strict";

var config = require('../../config');
var passport = require('../controller/passportController');
var db = require('../../bin/mongoClient').getDb();

function SessionHandler() {}

SessionHandler.prototype.isLoggedInMiddleware = passport.authenticate('bearer', {
    session: false, failureRedirect: '/login'
});

SessionHandler.prototype.isAdminMiddleware = function (req, res, next) {
    db.collection('users').findOne({userName: req.user.userName}, function (err, user) {
        if (user.isAdmin) {
            return next();
        } else {
            return res.redirect(403, '/');
        }
    });
};

module.exports = new SessionHandler();