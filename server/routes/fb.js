var express = require('express');
var router = express.Router();
var request = require('request');
var keys = require('../keys');

// Index route
router.get('/', function (req, res) {
  res.send('Hello, I am a bot!');
});

// for Facebook verification
router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'eleven_eaton_pl') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

router.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
      event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
          text = event.message.text
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
  res.sendStatus(200)
})

var token = keys.FB_ACCESS_TOKEN;
module.exports = router;
