var express = require('express');
var router = express.Router();
var request = require('request');

// Index route
router.get('/', function (req, res) {
  res.send('Hello world, I am a chat bot');
});

// for Facebook verification
router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

module.exports = router;
