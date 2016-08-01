'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../model/userModel');
var debug = require('debug')('nodeProject:server');

passport.use(new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {
        User.findOne({userName: username}, function (err, user) {
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
            return done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
    User.findById(_id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;