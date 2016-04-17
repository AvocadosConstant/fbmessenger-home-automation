var express = require('express');
var router = express.Router();
var request = require('request');
var keys = require('../keys');
var s = require('../res/strings/english');  //  Strings

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
  });
}

function sendGenericMessage(sender) {
  console.log('Displaying generic message...');
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
        {
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [
          {
            "type": "web_url",
            "url": "https://www.messenger.com",
            "title": "web url"
          }, 
          {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }
          ],
        }, 
        {
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }
        ]
      }
    }
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

function sendTemperature(sender) {
  console.log('Displaying temperature...');
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "The temperature in the house is OVER 9000!",
          "subtitle": "WHAT?! 9000?!",
        }]
      }
    }
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

function has(msg, sub) {return msg.toLowerCase().includes(sub);}

function hasArr(msg, arr) {
  for(sub in arr) {if(has(msg, arr[sub])) return true;}
  return false;
}

function assessPrompt(msg) {
  var displayKeywords = ['tell', 'give', 'show', 'what', 'display', 'how'];
  var temperatureKeywords = ['temperature', 'temp', 'heat', 'hot', 'warm', 'cold'];
  var greetKeywords = ['hello', 'hi', 'good day', 'what\'s up', 'whats up', 'sup', 'good morning', 'good evening'];
  var stateKeywords = ['i am', 'i\'m', 'im '];

  if(has(msg, 'help')) return 'help';
  if(msg === 'Generic') return 'generic';
  if(hasArr(msg, greetKeywords)) return 'greet';
  if(hasArr(msg, stateKeywords)) return 'state';
  if(hasArr(msg, displayKeywords) && hasArr(msg, temperatureKeywords)) return 'temperature';
  return 'default';
}

router.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      var text = event.message.text;
      console.log('Received message: ' + text);
      switch(assessPrompt(text)) {
        case 'help':
          sendTextMessage(sender, s.HELP); 
          break;
        case 'generic':
          sendGenericMessage(sender);
          break;
        case 'temperature':
          sendTemperature(sender);
          break;
        case 'greet':
          sendTextMessage(sender, 'Hello! How are you doing today :\)');
        case 'state':
          sendTextMessage(sender, 'Ok\nThanks for letting us know.');
          break;
        default:
          console.log('No prompt recognized...');
      }
    }
    if (event.postback) {
      text = JSON.stringify(event.postback);
      sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
      continue;
    }
  }
  res.sendStatus(200);
});

var token = keys.FB_ACCESS_TOKEN;
module.exports = router;
