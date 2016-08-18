'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var Users = require('../model/userModel');
var debug = require('debug')('nodeProject:server');
var jwt = require('jsonwebtoken');
var config = require('./config');

passport.use(new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {
        Users.findOne({userName: username}, function (err, user) {
            console.log(user);
            if (err) {
                debug("Error with finding user in database");
                return done(err);
            }
            if (!user) {
                debug('incorrect username');
                return done(null, false, {message: 'Incorrect username.'});
            }
            //if (!user.validPassword(password)) {
            if (user.password != password) {
                debug('incorrect password');
                return done(null, false, {message: 'Incorrect password.'});
            }
            debug("Logging in success");
            return done(null, user);
        });
    }
));

passport.use(new BearerStrategy(
    function(token, done) {
        Users.findOne({ token: token }, function (err, user) {
            if (err) {
                debug("Error with finding user in database");
                return done(err);
            }
            if (!user) {
                debug('incorrect username');
                return done(null, false);
            }
            jwt.verify(token, config.secret, function (err, decoded) {
                if(err) {
                    debug("error 2 "+ err);
                    return done(null, false, {message: "Expired jwt"});
                } else {
                    return done(null, user, { scope: 'read' });
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
    Users.findById(_id, function (err, user) {
        done(err, user);
    });
});


module.exports = passport;