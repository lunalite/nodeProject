"use strict";
/*
 ** main test file that calls for all other unit tests within the ./unit folder
 */
describe('Starting Unit tests', function () {
    before(function(done) {
        require('./unit/utils.test.js');
        require('../model/modelSubscription').initialize();
        done();
    });


    require('./unit/users.test.js');
    require('./unit/collections.test.js');
    require('./unit/general.test.js');

});