"use strict";
var debug = require('debug')('nodeProject:server');

function SessionHandler() {

    this.isLoggedInMiddleware = function(req, res, next){
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    };
}

module.exports = SessionHandler;