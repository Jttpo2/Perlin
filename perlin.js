var increment = 0.1;
var scl = 20;
var cols, rows;

var zOff = 0;
var zIncrement = 0.000002;
var noiseOctaves = 4;
var falloff = 0.2;

var fr;

particles = [];
numberOfParticles = 1000;

var flowField = [];
var flowFieldMag = 0.2;

var bgColor = 255;
var alphaValue = 2;

function setup() {
	let canvas = createCanvas(
		window.innerWidth /2,
		window.innerHeight /2
		// 500, 500
		);

	canvas.parent('sketch-holder');

	background(bgColor);

	cols = floor(width/scl);
	rows = floor(height/scl);

	fr = createP('');

	flowField = new Array(cols * rows);

	for (let i=0; i<numberOfParticles; i++) {
		particles[i] = new Particle();	
	}
	
}

function draw() {
	background(bgColor, alphaValue);

	let yOff = 0;

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

	for (let i=0; i<particles.length; i++) {
		particles[i].follow(flowField);
		particles[i].update();
		particles[i].show();
		particles[i].edges();
	}
	
	// showFramerate();
	
}

function drawVector(v, x, y) {
	stroke(0, 50);
			push();
			translate(x * scl, y * scl);
			rotate(v.heading());
			strokeWeight(1);
			line(0, 0, scl, 0);
			pop();
}

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

function showFramerate() {
	fr.html(floor(frameRate()));
}