var five = require("johnny-five");
var request = require('request');
var board = new five.Board();

board.on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "MPU6050"
  });

  var button = new five.Button(4);

  board.repl.inject({
    button: button
  });

  button.on("down", function() {
    request.post({url:'https://fb.jagels.us/bot/doorbell', body:'DING DONG!'}, function(err, res, body) {
      if (err) {
        return console.error('Doorbell not acknowledged: ', err);
      }
      console.log('Message sent! Server responded with: ', body);
    });
  });

  setInterval(function() {
    var roundedTemp = temperature.fahrenheit.toFixed(1);
    request({method: 'POST', url:'https://fb.jagels.us/bot/getTemp/', body: {temp: roundedTemp.toString()}, headers: {'content-type': 'application/json'}, json: true}, function(err, res, body) {
      if (err) {
        return console.error('Temperature failed to send: ', err);
      }
      console.log('Temperature sent! Server responded with: ', body);
    });
  },1000);
});

// @markdown
// - [MPU-6050 - IMU with Temperature Sensor](http://www.invensense.com/products/motion-tracking/6-axis/mpu-6050/)
// @markdown
