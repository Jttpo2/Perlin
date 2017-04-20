// (function() {
// 	"use strict";

	let MouseModeEnum = {
		IGNORE: 'ignore',
		ATTRACT: 'attract',
		REPEL: 'repel'
	};

	// Make into constant
	Object.freeze(MouseModeEnum);
	// console.log('MouseModeEnum isFrozen: ' + Object.isFrozen(MouseModeEnum));

	Object.seal(MouseModeEnum);
	// console.log('MouseModeEnum isSealed: ' + Object.isSealed(MouseModeEnum));

// })();
// Mouse flowfield interaction
const MAX_MOUSE_AFFECT_DIST = 350;
let mouseAttractionscalar = 10;

// Flowfield globals for optimization purposes
let v;
let flowfieldVectorPos; 
let mousePos;
let dist;
let flowfieldVectorColor; // For test drawing vector flowfield
let desiredVectorColor; // For test drawing vector flowfield
let desired;
let isFlowfieldVisibleFromStart = false;
let isDesiredVectorsVisibleFromStart = false;

function Flowfield(scl, flowfieldMagnitude) {
	this.scl = scl;
	this.cols = floor(width/this.scl);
	this.rows = floor(height/this.scl);
	this.vectors = new Array(this.cols * this.rows);

	this.flowfieldMag = flowfieldMagnitude;
	this.maxMouseAffectForce = this.flowfieldMag * 1.2;

	this.mouseMode = MouseModeEnum.ATTRACT;

	// Updates all vectors in flowfield using 3D perlin noise (enabling change over time)
	this.update = function() {
		let yOff = 0;

		noiseDetail(noiseOctaves, falloff);
		for (let y=0;y<this.rows; y++) {
			let xOff = 0;
			for (let x=0; x<this.cols; x++) {
				let index = (x + y * this.cols);
				let angle = noise(xOff, yOff, zOff) * TWO_PI*4;
				v = p5.Vector.fromAngle(angle);

				v.setMag(random(this.flowfieldMag*0.9, this.flowfieldMag*1.1));

				this.affectVectorByMouse(v, x, y);

				this.vectors[index] = v;

				if (isFlowfieldVisible) {
					this.drawVector(v, x * this.scl, y * this.scl, flowfieldVectorColor); 
				}

				xOff += increment;
			}
			yOff += increment;
			zOff += zIncrement;
		}
	};

	// 'Bend' the flowfield with the mouse position
	this.affectVectorByMouse = function(v, vectorPosX, vectorPosY) {
		if (this.mouseMode == MouseModeEnum.FREE) {
			return; // Do nothing
		} else {
			flowfieldVectorPos = createVector(vectorPosX * this.scl, vectorPosY * this.scl);
			mousePos = createVector(mouseX, mouseY);
			dist = mousePos.dist(flowfieldVectorPos);		

			if (dist < MAX_MOUSE_AFFECT_DIST) {
				// Within mouse affecting distance
				if (this.mouseMode == MouseModeEnum.ATTRACT) {
					desired = p5.Vector.sub(mousePos, flowfieldVectorPos);
				} else if (this.mouseMode == MouseModeEnum.REPEL) {
					desired = p5.Vector.sub(flowfieldVectorPos, mousePos);
				}

				desired.normalize();
				desired.mult(mouseAttractionscalar);
				desired.div(dist);
				v.add(desired);
				v.limit(this.maxMouseAffectForce);
				if (isDesiredVectorsVisible) {
					this.drawVector(desired, flowfieldVectorPos.x, flowfieldVectorPos.y, desiredVectorColor);
				}
			}
		}
	};

	// Visualizes a (flow field) vector
	this.drawVector = function(v, xPos, yPos, color) {
		stroke(color, 50);
		push();
		translate(xPos, yPos);
		rotate(v.heading());
		strokeWeight(1);
		// line(0, 0, this.scl, 0);
		line(0, 0, v.mag()*50, 0);
		pop();
	};

	// Toggle flowfield visibility
	this.toggleVisibility = function() {
		isFlowfieldVisible = !isFlowfieldVisible;
		console.log('flowfield visible: ' + isFlowfieldVisible);
	};

	// Toggle desired vectors visibility
	this.toggleDesiredVectors = function() {
		isDesiredVectorsVisible = !isDesiredVectorsVisible;
		console.log('desired vectors visible: ' + isDesiredVectorsVisible);
	};

	// Switch between attraction and repulsion modes
	this.toggleMouseAttractRepel = function() {
		if (mouseMode == MouseModeEnum.ATTRACT) {
			mouseMode = MouseModeEnum.REPEL;
		} else if (mouseMode == MouseModeEnum.REPEL) {
			mouseMode = MouseModeEnum.ATTRACT;
		}
		console.log('mouse mode: ' + mouseMode);
	};
}



function Pattern(noOfparticles) {
	this.noOfparticles = noOfparticles;
	
	// Creates an array of particles to push around the screen by the flowfield
	this.particles = new Array(this.noOfparticles);
	for (let i=0; i<this.particles.length; i++) {
		let col = color(randomGaussian(110, 20), 2);
		this.particles[i] = new Particle(col);	
	}

	// Affect particles by flowfield and move them
	this.update = function(flowfield) {
		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].follow(flowfield);
			this.particles[i].update();
			this.particles[i].show();
			this.particles[i].edges();
		} 
	};
}
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
// (function() {
// 	"use strict";

function Particle(col) {
	this.pos = createVector(random(width), random(height));
	this.vel = createVector(0, 0); //p5.Vector.random2D();
	this.acc = createVector(0, 0);
	this.maxSpeed = 4;
	this.size = 1;
	this.color = col;
	// this.alpha = 1;
	this.previous = this.pos.copy();

	this.update = function() {
		this.updatePrev();

		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0);
	};

	this.applyForce = function(force) {
		this.acc.add(force);
	}; 

	this.show = function() {
		// stroke(this.color, this.alpha);
		stroke(this.color);
		strokeWeight(this.size);
		// point (this.pos.x, this.pos.y);
		line(this.previous.x, this.previous.y, this.pos.x, this.pos.y);
	};

	this.updatePrev = function() {
		this.previous.x = this.pos.x;
		this.previous.y = this.pos.y;
	};

	this.edges = function() {
		if (this.pos.x > width) {
			this.pos.x = 0;
			this.updatePrev();
		}
		if(this.pos.x < 0) {
			this.pos.x = width;
			this.updatePrev();
		}
		if (this.pos.y > height) {
			this.pos.y = 0;
			this.updatePrev();
		}
		if (this.pos.y < 0) {
			this.pos.y = height;
			this.updatePrev();
		}
	};

	this.follow = function(flowfield) {
		let x = floor( this.pos.x / flowfield.scl);
		let y = floor( this.pos.y / flowfield.scl);
		let index = x + y * flowfield.cols;
		let force = flowfield.vectors[index];
		this.applyForce(force);
	};
}

// })();