var express = require('express');
var router = express.Router();
var request = require('request');
var keys = require('../keys');
var s = require('../res/strings/english');  //  Strings
var multer  = require('multer');
var upload = multer({dest: 'uploads/'});
var fs = require('fs');


// Index route
router.get('/', function (req, res) {
  res.send('Hello, I am a bot!');
});

// cam view
router.get('/cam/', function (req, res) {
  res.render('camSelect');
});

// cam view
router.get('/cam/:num', function (req, res) {
  res.render('cam', { num: req.params.num });
});

router.post('/pic/:num', upload.single('webcam'), function(req, res) {
  console.log(req.file);
  var num = req.params.num;
  fs.rename(req.file.path, 'public/shot' + num + '.jpg', function(err) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send('Screenshot success!');
    }
  });
});

// for Facebook verification
router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'eleven_eaton_pl') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

function sendText(sender, text) {
  messageData = {text:text};
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

function sendGeneric(sender) {
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

var recTemp = 'null';
function sendTemperature(sender) {
  console.log('Displaying temperature...');
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Current Temperature",
          "subtitle": recTemp
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
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  })
}

function sendImage(sender, imageURL) {
  console.log('Sending image...');
  messageData = {
    "attachment": {
      "type": "image",
      "payload": {
        "url": imageURL
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
  });
}

function sendAllCams(sender, arr) {
  var elements = [];
  for(cam in arr) {
    elements.push({
        "title" : "Cam " + arr[cam],
        "image_url": "https://fb.jagels.us/shot" + arr[cam] + ".jpg"
    });
  }
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": elements
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

function has(msg, sub) {
  var index = msg.toLowerCase().indexOf(sub);
  if(index >= 0) {
    var prev = msg.charAt(index-1);
    var after = msg.charAt(index+sub.length);
    if((prev==='' || prev===' ') && (after==='' || after===' ')){return true;}
  } return false;
}

function hasArr(msg, arr) {
  for(sub in arr) {if(has(msg, arr[sub])) return true;}
  return false;
}

function assessPrompt(msg) {
  if(has(msg, 'help')) return 'help';
  if(msg === 'Generic') return 'generic';
  if(hasArr(msg, s.words.GREET)) return 'greet';
  if(hasArr(msg, s.words.STATE)) return 'state';
  if(hasArr(msg, s.words.CAM)) return 'cam';
  if(hasArr(msg, s.words.DISPLAY) && hasArr(msg, s.words.TEMPERATURE)) return 'temperature';
  return 'default';
}

var sender;
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
          sendText(sender, s.responses.HELP);
          break;
        case 'generic':
          sendGeneric(sender);
          break;
        case 'temperature':
          sendTemperature(sender);
          break;
        case 'greet':
          sendText(sender, s.responses.GREET);
          break;
        case 'cam':
          var num = text.match(/\d+/);
          sendText(sender, 'Here\'s your picture!');
          if(has(text, 'all')) {
            sendAllCams(sender, num);
          } else {
            sendImage(sender, 'https://fb.jagels.us/shot'+num[0]+'.jpg');
          }
          break;
        case 'state':
          sendText(sender, s.responses.TFLUK);
          break;
        default:
          console.log('No prompt recognized...');
      }
    }
    if (event.postback) {
      text = JSON.stringify(event.postback);
      sendText(sender, "Postback received: "+text.substring(0, 200), token);
      continue;
    }
  }
  res.sendStatus(200);
});

router.post('/doorbell', function(req, res) {
  sendText(sender, 'DingDing');
  res.send("Rang doorbell...");
});

router.post('/getTemp', function(req, res) {
  recTemp = req.body.temp;
  res.send("Set temp...");
});

var token = keys.FB_ACCESS_TOKEN;
module.exports = router;
