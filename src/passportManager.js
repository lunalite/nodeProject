'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jsonwebtoken');
var config = require('../config');
var Utils = require('../util/util');
var Users = require('../model/userModel');
// var Users = require('mongoose').model('Users');

passport.use(new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {
        Users.findOne({userName: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if ((Utils.decryptPassword(user.password)) != password) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, user);
        });
    }
));

passport.use(new BearerStrategy(
    function (token, done) {
        Users.findOne({token: token}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return done(null, false, {message: "Expired jwt"});
                } else {
                    return done(null, user, {scope: 'read'});
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