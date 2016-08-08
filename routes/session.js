"use strict";
var debug = require('debug')('nodeProject:server');

var debug = require('debug')('nodeProject:server');
var config = require('../config/config');
var Users = require('../model/userModel');
var passport = require('../config/passport');

function SessionHandler() {

    this.isLoggedInMiddleware = passport.authenticate('bearer', {session: false, failureRedirect: '/login'});

}

module.exports = new SessionHandler();