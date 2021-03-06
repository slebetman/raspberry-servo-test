#! /usr/bin/env node

"use strict"

const Gpio = require('pigpio').Gpio;
const path = require('path');
const express = require('express');
const net = require('net');

const app = express();

const CENTER = 1450; // 1380;
const SERVO_DOWN_TRAVEL = 485; // 800
const SERVO_UP_TRAVEL = 800;
const FULL_TRAVEL = 100;

const servo = new Gpio(18,{mode: Gpio.OUTPUT});

function setServo (position) {
	var servoTravel = position > 0 ? SERVO_DOWN_TRAVEL : SERVO_UP_TRAVEL;

	var travel = Math.round((position/FULL_TRAVEL) * servoTravel);
	servo.servoWrite(CENTER+travel);
}

function cam (command, settings) {
	let packet = { cmd: command, settings };
	const mjpegServer = net.connect('/tmp/mjpegstream5');
	
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

app.get('/cam/set', (req,res) => {
	var key = req.query.setting;
	var val = req.query.value;
	
	var settings = {};
	
	settings[key] = val;
	
	cam('set', settings)
		.then(() => res.send('OK'))
		.catch(err => res.send(err));
});

app.get('/cam/resolution', (req,res) => {
	var resolution = req.query.resolution;
	
	const supportedRez = {
		'640x480' : { width: '640', height: '480' },
		'384x288' : { width: '384', height: '288' },
		'320x240' : { width: '320', height: '240' },
		'256x192' : { width: '256', height: '192' },
		'160x120' : { width: '160', height: '120' },
		'128x96'  : { width: '128', height: '96'  },
	}
	
	var settings = supportedRez[resolution];
	
	if (settings !== undefined) {
		cam('set', settings)
			.then(() => res.send('OK'))
			.catch(err => res.send(err));
	}
});

app.get('/cam/defaults', (req,res) => {
	cam('defaults')
		.then(() => res.send('OK'))
		.catch(err => res.send(err));
});

app.use(express.static('resources'));

app.listen(8877, () => {
	setServo(0);
	console.log('server started on port 8877');
});
