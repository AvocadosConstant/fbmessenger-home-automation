var express = require('express');
var router = express.Router();
var request = require('request');

// Index route
router.get('/', function (req, res) {
  res.send('16479454');
});

// for Facebook verification
router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'eleven_eaton_pl') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

module.exports = router;
