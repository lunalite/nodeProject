"use strict";

function sessionHandler(db) {

    this.isLoggedInMiddleware = function(req, res, next){
        if (req.isAuthenticated()) {
            return next;
        }

        res.redirect('/');
    };
}

module.exports = sessionHandler;