var five = require("johnny-five");
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
    console.log("DOORBELL!");
  });

  var timer = setInterval(function() {
    console.log(Number(temperature.fahrenheit).toFixed(2));
  },1000)
});

// @markdown
// - [MPU-6050 - IMU with Temperature Sensor](http://www.invensense.com/products/motion-tracking/6-axis/mpu-6050/)
// @markdown
