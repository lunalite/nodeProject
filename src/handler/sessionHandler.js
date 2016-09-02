"use strict";

var config = require('../../config');
var passport = require('../controller/passportController');
var db = require('../../bin/mongoClient').getDb();

function SessionHandler() {}

SessionHandler.prototype.isLoggedInMiddleware = passport.authenticate('bearer', {
    session: false, failureRedirect: '/login'
});

SessionHandler.prototype.isAdminMiddleware = function (req, res, next) {
    db.collection('users').findOne({username: req.user.username}, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user.isAdmin) {
            return next();
        } else {
            return res.redirect(403, '/');
        }
    });
};

module.exports = new SessionHandler();