"use strict";

var crypto = require('crypto');
var config = require('./../../config/index');

module.exports.encryptPassword = function (passwordFromReq) {
    var cipher = crypto.createCipher('aes192', config.secret);
    var encryptedPass = '';
    cipher.on('readable', function () {
        var data = cipher.read();
        if (data) {
            encryptedPass += data.toString('hex');
        }
    });
    cipher.write(passwordFromReq);
    cipher.end();

    return encryptedPass;
};

module.exports.decryptPassword = function (passwordFromReq) {
    var decipher = crypto.createDecipher('aes192', config.secret);
    var decryptedPass = '';
    decipher.on('readable', function () {
        var data = decipher.read();
        if (data) {
            decryptedPass += data.toString('utf8');
        }

    });

    decipher.write(passwordFromReq, 'hex');
    decipher.end();

    return decryptedPass;
};

