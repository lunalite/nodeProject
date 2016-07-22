"use strict";

var express = require('express');
var router = express.Router();
var User = require('../model/userModel');
var debug = require('debug')('nodeProject:server');

/* GET users listing. */
router.get('/', function (req, res, next) {
    User.find(function (err, users) {
        if (err) {
            res.status(204).send(err);
        } else {
            res.json(users);
        }
    });
});

router.get('/:id', function (req, res, next) {
    "use strict";
    User.findById(req.params.id, function (err, user) {
        if (err) {
            res.statusCode = 204;
            debug(err);
            res.send();
        } else {
            res.send(user);
        }
    });
});

router.post('/', function (req, res, next) {
    var user = new User({userName: req.body.userName, phoneNumber: req.body.phoneNumber});
    debug("Post: " + user);
    user.save(function (err) {
        if (err) {
            res.statusCode = 400;
            next(err);
        } else {
            res.status(201).send(user);
        }
    });
});

router.put('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            user.userName = req.body.userName;
            user.phoneNumber = req.body.phoneNumber;
            user.save(function (err) {
                if (err) {
                    res.statusCode = 400;
                    next(err);
                } else {
                    res.json(user);
                }
            });
        }
    });
});

router.delete('/:id', function (req, res, next) {
    User.remove({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(204).send(err);
        } else {
            res.status(204).send();
            debug("DELETE " + user);
        }
    });
});


module.exports = router;
