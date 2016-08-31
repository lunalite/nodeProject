'use strict';

var di = require('di');
var injector = new di.Injector([require('./injectorConf')]);

var config = injector.get('config');
var app = injector.get('app');

console.log(config);

var copy;

