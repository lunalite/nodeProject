"use strict";

var mongoose = require('mongoose');
var Users = require('../model/userModel');
var passportManager = require('./passportManager');

function SessionHandler() {
    this._Users = Users;
    // this._Users = mongoose.model('Users');
    this._passportLocal = passportManager;
}

SessionHandler.prototype.isLoggedInMiddleware = function isLoggedInMiddleware(req, res, next) {
    return this._passportLocal.authenticate('bearer', {
        session: false, failureRedirect: '/login'
    });
};

SessionHandler.prototype.isAdminMiddleware = function isAdminMiddleware(req, res, next) {
    this._Users.findOne({userName: req.user.userName}, function (err, user) {
        if (user.isAdmin) {
            return next();
        } else {
            return res.redirect(403, '/');
        }
    });
};


module.exports = new SessionHandler();