#! /usr/bin/env node

"use strict"

var Gpio = require('pigpio').Gpio;
var path = require('path');
var express = require('express');
var app = express();

var CENTER = 1380;
var SERVO_TRAVEL = 800;
var FULL_TRAVEL = 100;

var servo = new Gpio(18,{mode: Gpio.OUTPUT});

function setServo (position) {
	var travel = Math.round((position/FULL_TRAVEL) * SERVO_TRAVEL);
	servo.servoWrite(CENTER+travel);
}

app.get('/', (req,res) => {
	res.sendFile(__dirname + '/resources/index.html');
});

app.get('/control', (req,res) => {
	var position = +(req.query.pos);
	try {
		setServo(position);
		res.send('OK');
	}
	catch (err) {
		res.send(err);
	}
});

app.use(express.static('resources'));

app.listen(8080, () => {
	setServo(0);
	console.log('server started on port 8080');
});
