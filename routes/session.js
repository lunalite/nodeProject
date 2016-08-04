"use strict";
var debug = require('debug')('nodeProject:server');
var jwt = require('jsonwebtoken');
var debug = require('debug')('nodeProject:server');
var config = require('../config/config');
var Users = require('../model/userModel');
var passport = require('../config/passport');

function SessionHandler() {

    this.isLoggedInMiddleware = passport.authenticate('bearer', {session: false, failureRedirect: '/login'});
    console.log(typeof(this.isLoggedInMiddleware));
}

module.exports = new SessionHandler();