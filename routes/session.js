"use strict";
var debug = require('debug')('nodeProject:server');

var debug = require('debug')('nodeProject:server');
var config = require('../config/config');
var Users = require('../model/userModel');
var passport = require('../config/passport');

function SessionHandler() {

    this.isLoggedInMiddleware = passport.authenticate('bearer', {
        session: false, failureRedirect: '/login'
    });

    this.isAdminMiddleware = function (req, res, next) {
        Users.findOne({userName: req.user.userName}, function (err, user) {
            if (user.isAdmin) {
                console.log("You are admin");
                return next();
            } else {
                console.log("You are not admin");
                return res.redirect(403,'/');
            }
        });
    };


}

module.exports = new SessionHandler();