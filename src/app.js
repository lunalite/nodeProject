"use strict";

var express = require('express');
var morgan = require('morgan');
var session = require('express-session');
var config = require('./../config');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('./controller/passportController');
var routes = require('./routes/index');
var app = express();

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

/**
 * passport initialiser
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Using morgan as logger
 */
app.use(morgan('dev'));

/**
 * Router middleware
 */
app.use('/', routes);

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


module.exports = app;
