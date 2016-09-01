'use strict';

var models = ['./userModel', './collectionModel'];

module.exports.initialize = function() {
    console.log('initialising...');
    var l = models.length;
    for (var i = 0; i < l; i++) {
        require(models[i])();
        console.log('added model ' + models[i]);
    }
};
