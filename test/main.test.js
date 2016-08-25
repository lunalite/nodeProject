"use strict";

/*
** main test file that calls for all other unit tests within the ./unit folder
 */
describe('Starting Unit tests', function() {
    require('./unit/utils.test.js');
    require('./unit/users.test.js');
    require('./unit/collections.test.js');
    require('./unit/general.test.js');
});