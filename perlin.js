// Perlin noise experiment

var increment = 0.1;
var scl = 20; 
var cols, rows;

// Perlin noise
var zOff = 0;
var zIncrement = 0.0002;
var noiseOctaves = 1;
var falloff = 0.2;

var fr; // Framerate holder

particles = [];
numberOfParticles = 1000;

var flowField = [];
var flowFieldMag = 0.2; // Strength of flow field

var bgColor = 255;
var alphaValue = 2;

var prevBgColor;
var prevAlphaValue;

var isFading;

// New pattern timer
// var cycleTimeInMillis = 14*1000;
var cycleTimeInMillis = 13*1000;
var timerEndTime;

// Fade timer
var fadeCycleInMillis = 5*1000;
var fadeTimerEnd;

var fadeAlphaValue = 1;
var fadeAlphaValueTemp; // To be able to accelerate fading speed with time (so intensely black parts dissapear quicker)
var bgColorSpan = 2; // Tolerance threshold level for when the fade should consider pixels to be equal to background

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

	updateFlowField();
	updateParticles();
	
	if (!isFading && checkTimer()) {
		setFadeTimer(fadeCycleInMillis);
		fadeToWhite();
	}

	// if (isFading && checkFadeTimer()) {
	// 	stopFading();

	// 	reset();
	// 	setTimer(cycleTimeInMillis);
	// }
	
	if (isFading) {
		if (isBackgroundHomogenic()) {
			// Fading is complete
			stopFading();
			
			reset();
			setTimer(cycleTimeInMillis);
		} else {
			// Fade faster with time
			accelerateFading();
		}
	}

	// showFramerate();
}

function updateFlowField() {
	let yOff = 0;

	noiseDetail(noiseOctaves, falloff);
	for (let y=0;y<rows; y++) {
		let xOff = 0;
		for (let x=0; x<cols; x++) {
			let index = (x + y * cols);
			let angle = noise(xOff, yOff, zOff) * TWO_PI*4;
			let v = p5.Vector.fromAngle(angle);
			v.setMag(random(flowFieldMag*0.9, flowFieldMag*1.1));
			flowField[index] = v;

			drawVector(v, x, y); 
			
			xOff += increment;
		}
		yOff += increment;

		zOff += zIncrement;
	}
}

function updateParticles() {
	for (let i=0; i<particles.length; i++) {
		particles[i].follow(flowField);
		particles[i].update();
		particles[i].show();
		particles[i].edges();
	}
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
		case ' ':
			fadeToWhite();
			console.log("Space");
			break;
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
		case 'G':
			flowFieldMag *=1.1;
			console.log('flowFieldMag: ' + flowFieldMag);
		break;
		case 'B':
			flowFieldMag /= 1.1;
			console.log('flowFieldMag: ' + flowFieldMag);
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

function fadeToWhite() {
	prevBgColor = bgColor;
	prevAlphaValue = alphaValue;

	fadeAlphaValueTemp = fadeAlphaValue;
	alphaValue = fadeAlphaValueTemp;

	blendMode(ADD);
	isFading = true;
}

function stopFading() {
	bgColor = prevBgColor;
	alphaValue = prevAlphaValue;

	blendMode(BLEND);
	isFading = false;
}

// Accelerate fading with time, to remove heavy black traces quicker
function accelerateFading() {
	fadeAlphaValueTemp *= 1.05;
	alphaValue = fadeAlphaValueTemp;
}

// Returns whether all pixels in the canvas are equal to the desired background color
function isBackgroundHomogenic() {
	loadPixels();

	// Consider a range around the desired color acceptable
	let bgColorDiff = abs(bgColorSpan - bgColor)

	let index = 0;
	for (let x=0; x<width; x++) {
		for (let y=0; y<height; y++) {
			index = 4 * (x + y * width);

			if (abs(pixels[index +0] - bgColor) > bgColorSpan ||
				abs(pixels[index +1] - bgColor) > bgColorSpan ||
				abs(pixels[index +2] - bgColor) > bgColorSpan) {
				// abs(pixels[index +3] - bgColor) > bgColorSpan) { // Don't need to consider alpha
				
				// Pixel color is dissimilar to desired background
				return false;
			}
		}	
	}
	// No pixel was dissimilar
	return true;

	// Pixel density not needed this function
	// let d = pixelDensity;
	// for (let i=0; i<d; i++) {
	// 	for (let j=0; j<d; j++) {
	// 		let index = 
	// 	}
	// }
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

// Sets fade timer
function setFadeTimer(millisAhead) {
	fadeTimerEnd = millis() + millisAhead;
}

// Returns whether the new pattern timer has run out
function checkTimer() {
	return timerEndTime < millis();
}

// Returns whether the fade timer has run out
function checkFadeTimer() {
	return fadeTimerEnd < millis();
}