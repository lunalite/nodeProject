var express = require('express');
var router = express.Router();
var halson = require('halson');
var User = require('../model/userModel');

/* GET users listing. */
router.get('/', function (req, res, next) {
  "use strict";
  User.find(function(err, users) {
    if (err) {
      res.send(err);
    } else {
      res.json(users);
    }
  });
/*
  var resource = halson({
    title: "users",
    description: "list of all the different users"
  })
    .addLink('self', '/users')
    .addLink('next', '/users/:id');
  res.send(resource);*/
});

router.get('/:id', function (req, res, next) {
  "use strict";
  User.findById(req.params.id, function(err, user) {
    if (err) {
      res.statusCode = 204;
      console.error(err);
      res.send();
    } else {
      res.send(user);
    }
  });
});

router.post('/', function (req, res, next) {
  "use strict";
  var user = new User({userName:req.body.userName});
  console.log(user);
  user.save(function(err) {
    if (err) {
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(user);
    }
  });
});

router.put('/:id', function (req, res, next) {
  "use strict";
  User.findById(req.params.id, function(err, user) {
    if (err) {
      res.statusCode = 204;
      console.error(err);
    } else {
      user.userName = req.body.userName;
      user.save(function(err) {
        if (err) {
          console.error(err);
        } else {
          res.json(user);
        }
      });
    }
  });
});

module.exports = router;
