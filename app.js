"use strict";

var express = require('express');
var morgan = require('morgan');
var session = require('express-session');
var config = require('./config/config');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var debug = require('debug')('nodeProject:server');
var passport = require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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

app.use('/', routes);
app.use('/users', users);
app.use('/login', login);

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
        /*if (err.message === 'userSchemaError') {
            res.json({
                "type": "users/",
                "title": "Invalid input",
                "detail": "missing details"
                //"validationErrors": [{
                //}]
            });
        } else */
        if (err.message === 'User validation failed') {
            var errorObj = err.errors;
            var errorArray = Object.keys(errorObj);
            var userValidationErrorMessageArray = [];
            errorArray.forEach(function (current) {
                var userValidationErrorMessage = errorObj[current].message;
                debug(userValidationErrorMessage);
                userValidationErrorMessageArray.push(userValidationErrorMessage);
            });
            res.json({
                "type": "user Validation error",
                "title": "Invalid input",
                "detail": userValidationErrorMessageArray
            });
        } else {
            debug(err.message);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    debug(err.stack);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;