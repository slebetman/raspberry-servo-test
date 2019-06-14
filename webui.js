#! /usr/bin/env node

"use strict"

var Gpio = require('pigpio').Gpio;
var path = require('path');
var express = require('express');
var app = express();

var CENTER = 1450; // 1380;
var SERVO_DOWN_TRAVEL = 485; // 800
var SERVO_UP_TRAVEL = 800;
var FULL_TRAVEL = 100;

var servo = new Gpio(18,{mode: Gpio.OUTPUT});
// var mjpegServer = net.connect('/tmp/mjpegstream5');

function setServo (position) {
	var servoTravel = position > 0 ? SERVO_DOWN_TRAVEL : SERVO_UP_TRAVEL;

	var travel = Math.round((position/FULL_TRAVEL) * servoTravel);
	servo.servoWrite(CENTER+travel);
}

function cam (command, settings) {
	let packet = { cmd: command, settings };
	var mjpegServer = net.connect('/tmp/mjpegstream5');
	
	return new Promise((ok,fail) => {
		switch (command) {
			case 'get':
				mjpegServer.on('data',json => {
					ok(json);
					mjpegServer.destroy();
				});
				mjpegServer.on('error',err => {
					console.error(err);
					fail(err);
					mjpegServer.destroy();
				});
				mjpegServer.write(JSON.stringify(packet));
				break;
			default:
				mjpegServer.write(JSON.stringify(packet), ok);
		}
	});
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

app.get('/cam/settings', (req,res) => {
	cam('get')
		.then(json => res.send(json))
		.catch(err => res.send(err));
});

app.use(express.static('resources'));

app.listen(8877, () => {
	setServo(0);
	console.log('server started on port 8877');
});
