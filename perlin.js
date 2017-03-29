// Perlin noise experiment v 0.1

var increment = 0.1;
var scl = 20; 
var cols, rows;

// Perlin noise
var zOff = 0;
var zIncrement = 0.000002;
var noiseOctaves = 1;
var falloff = 0.2;

var fr; // Framerate holder

particles = [];
numberOfParticles = 1000;

var flowField = [];
var flowFieldMag = 0.2; // Strength of flow field

var bgColor = 255;
var alphaValue = 2;

// New pattern timer
var cycleTimeInMillis = 14*1000;
var timerEndTime;

function setup() {
	let canvas = createCanvas(
		window.innerWidth /2,
		window.innerHeight /2
		// 500, 500
		);

	// Set parent html element
	canvas.parent('sketch-holder');

	background(bgColor);

	cols = floor(width/scl);
	rows = floor(height/scl);

	fr = createP('');

	setupFlowfield();
	createParticles();

	// Start new pattern timer
	setTimer(cycleTimeInMillis);
}

function draw() {
	background(bgColor, alphaValue);

	let yOff = 0;

	// Update flow field
	noiseDetail(noiseOctaves, falloff);
	for (let y=0;y<rows; y++) {
		let xOff = 0;
		for (let x=0; x<cols; x++) {
			let index = (x + y * cols);
			let angle = noise(xOff, yOff, zOff) * TWO_PI*4;
			let v = p5.Vector.fromAngle(angle);
			v.setMag(flowFieldMag);
			flowField[index] = v;

			// drawVector(v, x, y);
			
			xOff += increment;
		}
		yOff += increment;

		zOff += zIncrement;
	}

	// Update particles
	for (let i=0; i<particles.length; i++) {
		particles[i].follow(flowField);
		particles[i].update();
		particles[i].show();
		particles[i].edges();
	}
	
	if (checkTimer()) {
		reset();
		setTimer(cycleTimeInMillis);
	}
	
	// showFramerate();
}

// Visualizes a (flow field) vector
function drawVector(v, x, y) {
	stroke(0, 50);
			push();
			translate(x * scl, y * scl);
			rotate(v.heading());
			strokeWeight(1);
			line(0, 0, scl, 0);
			pop();
}

// Keyboard input handler
function keyReleased() {
	switch (key) {
		case 'A': 
			zIncrement *= 1.30;
			console.log('zIncrement: ' + zIncrement);
		break;
		case 'Z': 
			zIncrement /= 1.30;
			console.log('zIncrement: ' + zIncrement);
		break;
		case 'S': 
			alphaValue *= 1.30;
			console.log('alphaValue: ' + alphaValue);
		break;
		case 'X': 
			alphaValue /= 1.30;
			console.log('alphaValue: ' + alphaValue);
		break;
		case 'D': 
			noiseOctaves += 1;
			console.log('noiseOctaves: ' + noiseOctaves);
		break;
		case 'C': 
			noiseOctaves -= 1;
			console.log('noiseOctaves: ' + noiseOctaves);
		break;
		case 'F': 
			falloff *= 1.30;
			console.log('falloff: ' + falloff);
		break;
		case 'V': 
			falloff /= 1.30;
			console.log('falloff: ' + falloff);
		break;
		default: console.log('wha?');
	}
}

// Procures a new pattern
function reset() {
	background(bgColor);
	
	// New random seed necessary for new pattern
	noiseSeed(random()*1000);

	setupFlowfield();
	createParticles();
}

function setupFlowfield() {
	flowField = new Array(cols * rows);
}

function createParticles() {
	for (let i=0; i<numberOfParticles; i++) {
		particles[i] = new Particle();	
	}
}

// Displays framerate on screen
function showFramerate() {
	fr.html(floor(frameRate()));
}

// Sets new pattern timer
function setTimer(millisAhead) {
	timerEndTime = millis() + millisAhead;
}

// Returns whether the timer has run out
function checkTimer() {
	return timerEndTime < millis();
}