'use strict';

module.exports = {
    config: ['value', require('./config')],
    www: ['value', require('./bin/www')],
    /**
     * Models
     */
    // models: ['value', require('./model/models')],
    // Users: ['value', require('./model/userModel')],

    app: ['factory', require('./src/app')],
    /**
     * Dependencies from modules
     */
    mongoose: ['value', require('mongoose')],
    http: ['value', require('http')],
    bodyParser: ['value',require('body-parser')],
    express: ['value', require('express')],

    /**
     * Routes
     */
    router: ['value', require('./src/routes')]

};