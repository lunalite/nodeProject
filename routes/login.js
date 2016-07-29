"use strict";

var express = require('express');
var router = express.Router();
var debug = require('debug')('nodeProject:server');

router.get('/', function(req,res, next) {
    res.json({
        "content-Type": "application/JSON",
        userName: "user",
        password: "pw"

    });
});


module.exports = router;