'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var db = require('../../bin/mongoClient').getDb();
var jwt = require('jsonwebtoken');
var config = require('./../../config');
var Utils = require('../util/util');

passport.use(new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {
        db.collection('users').findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if ((Utils.decryptPassword(user.password)) !== password) {
                return done(null, false, {message: 'Incorrect password.'});
            }

            return done(null, user);
        });
    }
));

passport.use(new BearerStrategy(
    function (token, done) {
        db.collection('users').findOne({token: token}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            jwt.verify(token, config.secret, function (err) {
                if (err) {
                    return done(null, false, {message: 'Expired jwt'});
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
    db.collection('users').findOne({_id: _id}, function (err, user) {
        done(err, user);
    });
});


module.exports = passport;