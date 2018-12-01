#! /usr/bin/env node

var Gpio = require('pigpio').Gpio;
var keypress = require('keypress');
var clearScreen = require('cross-clear');

var servo = new Gpio(18,{mode: Gpio.OUTPUT});
var DRAW = {
	ARROW:     '\u25bc',
	LEFT_END:  '\u251c',
	LINE:      '\u2500',
	RIGHT_END: '\u2524'
}
var CENTER = 1380;
var SERVO_TRAVEL = 800;
var offset = 0;
var FULL_TRAVEL = 28;

function ESC (str) {
	return '\033' + str;
}

function ESC_ (str) {
	return ESC('[' + str);
}

function GOTO (row, col) {
	return ESC_(row + ';' + col + 'H');
}

function drawSlider (position) {
	var l = FULL_TRAVEL - position;
	var r = FULL_TRAVEL + position;

	process.stdout.write(GOTO(6,2));
	console.log(
		' ' +	
		DRAW.LEFT_END + 
		DRAW.LINE.repeat(l) + 
		DRAW.ARROW + 
		DRAW.LINE.repeat(r) + 
		DRAW.RIGHT_END
	);
	console.log();
}

function drawUI (position) {
	clearScreen();
	console.log(ESC_('?25l'));
	console.log(' Use arrow keys to move servo. Use <shift> to speed up');
	console.log(' Press space to center servo.');
	console.log(' Type "q" to quit');
	drawSlider(position);
}

function setServo (position) {
	var travel = Math.round((position/FULL_TRAVEL) * SERVO_TRAVEL);
	servo.servoWrite(CENTER+travel);
}

setServo(0);
drawUI(0);

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('keypress', (str, key) => {
	switch (key.name) {
		case 'c':
			if (key.ctrl) {
				console.log(ESC_('?25h'));
				process.exit();
			}
			break;
		case 'q':
			console.log(ESC_('?25h'));
			process.exit();
			break;
		case 'left':
			if (!key.shift) {
				offset ++;
			}
			else {
				offset += 4;
			}
			if (offset > FULL_TRAVEL) offset = FULL_TRAVEL;
			break;
		case 'right':
			if (!key.shift) {
				offset --;
			}
			else {
				offset -= 4;
			}
			if (offset < -FULL_TRAVEL) offset = -FULL_TRAVEL;
			break;
		case 'space':
			offset = 0;
	}
	drawSlider(offset);
	setServo(offset);
});