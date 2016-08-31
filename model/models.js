'use strict';

var models = ['./userModel.js', './collectionModel.js'];

module.exports.initialize = function() {
    var l = models.length;
    for (var i = 0; i < l;i ++) {
        require(models[i])();
    }
};