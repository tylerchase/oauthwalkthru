'use strict'
var express = require('express');
var router = express.Router();
var auth = require('../passport.js')
var query = require('../db/query.js')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/auth/google', auth.passport.authenticate('google', {
    scope: [
        'profile', 'email',
    ],
    accessType: 'offline',
    approvalPrompt: 'force'
}));

router.get('/auth/google/callback', auth.passport.authenticate('google', {
        successRedirect: '/welcome',
        failureRedirect: '/'
      }
    )
);

router.get('/welcome', auth.ensureAuthenticated,  function(req, res, next) {
  query.getUserById(req.user)
  .then((userdata) => {
    res.render('welcome', {user: userdata})
  })
})

module.exports = router;
