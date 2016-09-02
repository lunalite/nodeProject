'use strict';

var mongoClient = require('../../bin/mongoClient');
var db = mongoClient.getDb();
var express = require('express');
var router = express.Router();
var Util = require('../util/util');
var User = require('../../model/UserSchema');


/**
 * GET /users{page, limit, offset}
 * GET users listing
 *
 * @params =
 *  page: defines page {optional}
 *  limit: defines resources shown per page {optional}
 *  offset: defines offset from the first resource stored in dB {optional}
 */
router.get('/', function (req, res, next) {
    var limit = parseInt(req.query.limit ? req.query.limit : 10, 10);
    var page = parseInt(req.query.page ? req.query.page : 1, 10);
    var offset = parseInt(req.query.offset ? req.query.offset : 0, 10);
    var totalOffset = offset + limit * (page - 1);

    db.collection('users').count({}, function (err, totalCount) {
        if (err) {
            return next(err);
        } else {
            printResponse(totalCount);
        }
    });
    function printResponse(totalCount) {
        var lastPage = parseInt(Math.ceil((totalCount - offset) / limit), 10);
        db.collection('users').find({}).limit(limit).skip(totalOffset).toArray(function (err, users) {
            if (err) {
                res.status(204).send(err);
            } else {
                res.send({
                    countPerPage: limit ? users.length : limit,
                    totalCount: totalCount,
                    page: page,
                    _embedded: {
                        users: users
                    },
                    _links: Util.getLink('users', req, page, limit, offset, lastPage)

                });
            }
        });
    }
});

/**
 * GET /users/:id
 * Get individual user data
 *
 * @return:
 * status 200: Successful response of a user
 * status 204: No context - no such resource is available
 * status 400: Bad request - invalid _id format
 */
router.get('/:id', Util.validateMongo_ID, function (req, res, next) {
    db.collection('users').findOne({_id: mongoClient.objectifyId(req.params.id)},
        function (err, user) {
            if (err) {
                return next(err);
            } else {
                // console.log(user);
                if (user) {
                    res.json({
                        user: user
                    });
                } else {
                    res.status(204).send();
                }
            }
        });
});

/**
 * POST /users
 * Post and create a new user
 *
 * @format =
 *  {
 *      "username": XXX,        {required}
 *      "password": XXX,        {required}
 *      "phoneNumber": 123,     {optional}
 *      "isAdmin": true/false   {optional}
 *  }
 */
router.post('/', function (req, res, next) {
    var user = new User(
        req.body.username,
        req.body.password,
        req.body.phoneNumber,
        req.body.isAdmin);

    user.insertOne(function (err, result) {
        if (err) {
            next(err);
        }
        res.status(201).send({
            user: result.value
        });
    });
});


/**
 * PUT /users/:id
 * Update a user that is already present
 *
 * @format =
 *  {
 *      "username": XXX,        {optional}
 *      "password": XXX,        {optional}
 *      "phoneNumber": 123,     {optional}
 *      "isAdmin": true/false   {optional}
 *  }
 */
router.put('/:id', Util.validateMongo_ID, function (req, res, next) {
    db.collection('users').findOne({_id: mongoClient.objectifyId(req.params.id)},
        function (err, user) {
            if (err) {
                return next(err);
            } else {
                if (user) {
                    var updatedUser = {
                        username: req.body.username ? req.body.username : user.username,
                        password: req.body.password ? Util.encryptPassword(req.body.password) : user.password,
                        phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : user.phoneNumber,
                        token: user.token,
                        isAdmin: req.body.isAdmin ? req.body.isAdmin : user.isAdmin,
                        timeCreated: user.timeCreated,
                        lastUpdated: ( req.body.username || req.body.phoneNumber || req.body.password || req.body.isAdmin) ?
                            Date.now() : user.lastUpdated,
                        _links: user._links
                    };

                    db.collection('users').findOneAndUpdate({_id: mongoClient.objectifyId(req.params.id)},
                        updatedUser,
                        {returnOriginal: false},
                        function (err, dbUser) {
                            if (err) {
                                res.statusCode = 400;
                                return next(err);
                            } else {
                                res.json({
                                    user: dbUser.value
                                });
                            }
                        });
                } else {
                    res.status(204).send();
                }
            }
        });
});

/**
 * DELETE /users/:id
 * Delete the specified user by its :id
 *
 * @return:
 *  status 204: Successfully deleted
 *  status 400: Invalid _id
 */
router.delete('/:id', Util.validateMongo_ID, function (req, res, next) {
    db.collection('users').findOneAndDelete({_id: mongoClient.objectifyId(req.params.id)},
        function (err, user) {
            if (err) {
                res.status(204).send(err);
            } else {
                res.status(204).send();
            }
        });
});

module.exports = router;
