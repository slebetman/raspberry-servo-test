#! /usr/bin/env node

var Gpio = require('pigpio').Gpio;

var servo = new Gpio(18,{mode: Gpio.OUTPUT});

var CENTER = 1380;

var offset = 0;
setInterval(function(){
	offset += 0.05;
	if (offset > (Math.PI*2)) {
		offset -= (Math.PI*2);
	}
	
	var position = Math.round((Math.sin(offset)/Math.PI)*2700);
	
	servo.servoWrite(CENTER+position);
},20);
