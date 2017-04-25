// (function() {
// 	"use strict";

// Visual perlin noise experiment

let windowScale = 0.7; // What portion of the window for the canvas to take up  

// Perlin noise
let increment = 0.1;
let zOff = 0;
let zIncrement = 0.000002; 
let noiseOctaves = 1;
let falloff = 0.2;

// Framerate html holder
// let fr; 

// Pattern
let pattern;
let numberOfParticles = 1000;

// Flowfield
let scl = 20; // How many columns/rows to split the width/height of the canvas in
let flowfield;
let flowfieldMag = 0.2; // Strength of flow field
let isFlowfieldVisible = isFlowfieldVisibleFromStart;
let isDesiredVectorsVisible = isDesiredVectorsVisibleFromStart;

// Background color and alpha value
let bgColor = 255;
let alphaValue = 2;

// Pattern cycle timer
// The pattern 'fades in' over this time amount
// let cycleTimeInMillis = 14*1000;
let cycleTimeInMillis = 15*1000;
let timerEndTime;

// Fadeout
let isFading; // Fading in progress
let prevBgColor;
let prevAlphaValue;
let fadeAlphaValue = 1;
let fadeAlphaValueTemp; // To be able to accelerate fading speed with time (so intensely black parts dissapear quicker)
let bgColorSpan = 2; // Tolerance threshold level for when the fade should consider pixels to be equal to background

// P5 setup
function setup() {
	let canvas = createCanvas(
		floor(window.innerWidth * windowScale),
		floor(window.innerHeight * windowScale)
		// 500, 500
		);

	// Set parent html element
	// canvas.parent('sketch-holder');

	background(bgColor);

	// Framerate holder, <p> element
	// fr = createP('');

	setupFlowfield();
	createPattern();

	// Start new pattern timer
	setTimer(cycleTimeInMillis);

	flowfieldVectorColor = color(240, 240, 240, 10);
	desiredVectorColor = color(200, 25, 25, 1);
}

// P5 draw 
function draw() {
	background(bgColor, alphaValue);

	flowfield.update();
	pattern.update(flowfield);
	
	handlePatternCycle();

	// showFramerate();
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
		flowfieldMag *=1.1;
		console.log('flowfieldMag: ' + flowfieldMag);
		break;
		case 'B':
		flowfieldMag /= 1.1;
		console.log('flowfieldMag: ' + flowfieldMag);
		break;
		case 'H':
		console.log();
		break;
		case 'N':
		console.log();
		break;
		case 'Q': flowfield.toggleVisibility();
		break;
		case 'W': flowfield.toggleDesiredVectors();
		break;
		case 'R': flowfield.toggleMouseAttractRepel();
		break;
		default: console.log('wha?');
	}
}

// Procures a new pattern
function reset() {
	background(bgColor);
	
	// New random seed necessary for new pattern
	noiseSeed(random()*100000);

	setupFlowfield();
	createPattern();
}

function setupFlowfield() {
	flowfield = new Flowfield(scl, flowfieldMag);
}

function createPattern() {
	pattern = new Pattern(numberOfParticles);
}

// Fade sketch into background through additive blending
function fadeToWhite() {
	prevBgColor = bgColor;
	prevAlphaValue = alphaValue;

	fadeAlphaValueTemp = fadeAlphaValue;
	alphaValue = fadeAlphaValueTemp;

	blendMode(ADD);
	isFading = true;
}

// Return to normal blend mode
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

// P5 hook function for window resizing
function windowResized() {
	resizeCanvas(
		floor(window.innerWidth * windowScale),
		floor(window.innerHeight * windowScale)
		);
	reset();
}

// })();