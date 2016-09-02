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

module.exports.getLink = function (resName, req, page, limit, offset, lastPage) {
    var pageQueryShow = function (pageOrder) {
        if (pageOrder === 'next') {
            return req.query.page ? 'page=' + (page + 1) : 'page=2';
        } else {
            return req.query.page ? 'page=' + (page - 1) : '';
        }
    };
    var limitQueryShow = function (qualifier) {
        return req.query.limit ? qualifier + 'limit=' + limit : '';
    };
    var offsetQueryShow = function (qualifier) {
        return req.query.offset ? qualifier + 'offset=' + offset : '';
    };

    var _links = {
        self: {href: req.originalUrl},
        first: {
            href: lastPage > 0 ? '/' + resName + '?page=1' + limitQueryShow('&') + offsetQueryShow('&') : ''
        },
        next: {
            href: (page >= lastPage) ? '' : ('/' + resName + '?' + (
                req.query.page ? pageQueryShow('next') + limitQueryShow('&') + offsetQueryShow('&') :
                    req.query.limit ? pageQueryShow('next') + limitQueryShow('&') + offsetQueryShow('&') :
                        req.query.offset ? pageQueryShow('next') + offsetQueryShow('&') :
                            pageQueryShow('next')))
        },
        previous: {
            href: (page <= 1 || page > lastPage) ? '' : ('/' + resName + '?' + (
                req.query.page ? pageQueryShow('previous') + limitQueryShow('&') + offsetQueryShow('&') :
                    req.query.limit ? pageQueryShow('previous') + limitQueryShow('&') + offsetQueryShow('&') :
                        req.query.offset ? pageQueryShow('previous') + offsetQueryShow('&') : ''))
        },
        last: {
            href: lastPage > 0 ? '/' + resName + '?page=' + lastPage + limitQueryShow('&') + offsetQueryShow('&') : ''
        },
        // TODO: implement find function
        find: {href: '/' + resName + '?'}
    };

    return _links;

};

