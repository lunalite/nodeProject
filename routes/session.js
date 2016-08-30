"use strict";

var config = require('../config');
var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var passport = require('../config/passport');

function SessionHandler() {

    this.isLoggedInMiddleware = passport.authenticate('bearer', {
        session: false, failureRedirect: '/login'
    });

    this.isAdminMiddleware = function (req, res, next) {
        Users.findOne({userName: req.user.userName}, function (err, user) {
            if (user.isAdmin) {
                return next();
            } else {
                return res.redirect(403,'/');
            }
        });
    };


}

module.exports = new SessionHandler();