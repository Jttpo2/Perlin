// (function() {
// 	"use strict";

// Visual perlin noise experiment

let windowScale = 0.7; // What portion of the window for the canvas to take up  

let scl = 20; // How many columns/rows to split the width/height of the canvas in
let cols, rows; 

// Perlin noise
let increment = 0.1;
let zOff = 0;
let zIncrement = 0.000002; 
let noiseOctaves = 1;
let falloff = 0.2;

let fr; // Framerate holder

let particles = [];
let numberOfParticles = 1000;

let flowField = [];
let flowFieldMag = 0.2; // Strength of flow field
let isFlowfieldVisible;
let isFlowfieldVisibleFromStart = false;

// Flowfield globals for optimization purposes
let v;
let flowFieldVectorPos;
let mousePos;
let dist;
let flowfieldVectorColor; // For test drawing vector flowfield
let desiredVectorColor; // For test drawing vector flowfield
let desired;
let isDesiredVectorsVisible;
let isDesiredVectorsVisibleFromStart = false;

// Background color and alpha value
let bgColor = 255;
let alphaValue = 2;
let prevBgColor;
let prevAlphaValue;

let isFading; // Fading in progress

// Pattern cycle timer
// The pattern 'fades in' over this time amount
// let cycleTimeInMillis = 14*1000;
let cycleTimeInMillis = 15*1000;
let timerEndTime;

let fadeAlphaValue = 1;
let fadeAlphaValueTemp; // To be able to accelerate fading speed with time (so intensely black parts dissapear quicker)
let bgColorSpan = 2; // Tolerance threshold level for when the fade should consider pixels to be equal to background

let mouseMode = MouseModeEnum.ATTRACT;
const MAX_MOUSE_AFFECT_DIST = 150;
let mouseAttractionscalar = 10;
let maxMouseAffectForce = flowFieldMag * 1.2;

function setup() {
	let canvas = createCanvas(
		floor(window.innerWidth * windowScale),
		floor(window.innerHeight * windowScale)
		// 500, 500
		);

	// Set parent html element
	canvas.parent('sketch-holder');

	background(bgColor);

	// Framerate holder, <p> element
	fr = createP('');

	setupFlowfield();
	createParticles();

	// Start new pattern timer
	setTimer(cycleTimeInMillis);

	isFlowfieldVisible = isFlowfieldVisibleFromStart;
	flowfieldVectorColor = color(200, 200, 200);
	isDesiredVectorsVisible = isDesiredVectorsVisibleFromStart;
	desiredVectorColor = color(200, 50, 50, 5);
}

function draw() {
	background(bgColor, alphaValue);

	updateFlowField();
	updateParticles();
	
	handlePatternCycle();

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
			v = p5.Vector.fromAngle(angle);
			
			v.setMag(random(flowFieldMag*0.9, flowFieldMag*1.1));

			affectVectorByMouse(v, x, y);
			
			flowField[index] = v;

			if (isFlowfieldVisible) {
				drawVector(v, x * scl, y * scl, flowfieldVectorColor); 
			}

			xOff += increment;
		}
		yOff += increment;
		zOff += zIncrement;
	}
}

// 'Bend' the flowfield with the mouse position
function affectVectorByMouse(v, vectorPosX, vectorPosY) {
	if (mouseMode == MouseModeEnum.FREE) {
		return; // Do nothing
	} else {
		flowFieldVectorPos = createVector(vectorPosX * scl, vectorPosY * scl);
		mousePos = createVector(mouseX, mouseY);
		dist = mousePos.dist(flowFieldVectorPos);		

		if (dist < MAX_MOUSE_AFFECT_DIST) {
			// Within mouse affecting distance
			if (mouseMode == MouseModeEnum.ATTRACT) {
				desired = p5.Vector.sub(mousePos, flowFieldVectorPos);
			} else if (mouseMode == MouseModeEnum.REPEL) {
				desired = p5.Vector.sub(flowFieldVectorPos, mousePos);
			}

			desired.normalize();
			desired.mult(mouseAttractionscalar);
			desired.div(dist);
			v.add(desired);
			v.limit(maxMouseAffectForce);
			if (isFlowfieldVisible) {
				drawVector(desired, flowFieldVectorPos.x, flowFieldVectorPos.y, desiredVectorColor);
			}
		}
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
function drawVector(v, xPos, yPos, color) {
	stroke(color, 50);
	push();
	translate(xPos, yPos);
	rotate(v.heading());
	strokeWeight(1);
			// line(0, 0, scl, 0);
			line(0, 0, v.mag()*100, 0);
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
		case 'H':
		console.log();
		break;
		case 'N':
		console.log();
		break;
		case 'Q': toggleFlowfield();
		break;
		case 'W': toggleMouseAttractRepel();
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
	let bgColorDiff = abs(bgColorSpan - bgColor);

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
	cols = floor(width/scl);
	rows = floor(height/scl);
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

// Handles the pattern show cycle and the fadeout between patterns 
function handlePatternCycle() {
	if (!isFading && checkTimer()) {
		// setFadeTimer(fadeCycleInMillis);
		fadeToWhite();
	}

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
}

// Sets new pattern timer
function setTimer(millisAhead) {
	timerEndTime = millis() + millisAhead;
}

// Returns whether the new pattern timer has run out
function checkTimer() {
	return timerEndTime < millis();
}

function toggleFlowfield() {
	isFlowfieldVisible = !isFlowfieldVisible;
	console.log('flowfield visible: ' + isFlowfieldVisible);
}

function toggleMouseAttractRepel() {
	if (mouseMode == MouseModeEnum.ATTRACT) {
		mouseMode = MouseModeEnum.REPEL;
	} else if (mouseMode == MouseModeEnum.REPEL) {
		mouseMode = MouseModeEnum.ATTRACT;
	}
	console.log('mouse mode: ' + mouseMode);
}

function windowResized() {
	resizeCanvas(
		floor(window.innerWidth * windowScale),
		floor(window.innerHeight * windowScale)
		);
	reset();
}

// })();