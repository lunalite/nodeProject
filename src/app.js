"use strict";

var morgan = require('morgan');
var session = require('express-session');
var path = require('path');
var express = require('express');
var passport = require('passport');

// var users = require('./routes/users');
// var login = require('./routes/login');
// var collections = require('./routes/collections');

module.exports = function (config, bodyParser, router) {
    var app = express();

// view engine setup
    app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({
        secret: config.secret,
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 3600000
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(morgan('dev'));
    app.use('/', router);
    // app.use('/users', users);
    // app.use('/login', login);
    // app.use('/collections', collections);

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            //debug(err.stack);
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: {}
            });
        });
    }
    return app;
};
