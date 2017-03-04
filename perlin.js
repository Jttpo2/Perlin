var increment = 0.1;
var scl = 20;
var cols, rows;

var zOff = 0;

var fr;

particles = [];
numberOfParticles = 1000;

var flowField = [];
var flowFieldMag = 0.5;

function setup() {
	createCanvas(
		// window.innerWidth,
		// window.innerHeight
		500, 500
		);
	background(255);

	cols = floor(width/scl);
	rows = floor(height/scl);

	fr = createP('');

	flowField = new Array(cols * rows);

	for (let i=0; i<numberOfParticles; i++) {
		particles[i] = new Particle();	
	}
	
}

function draw() {
	// background(255);

	let yOff = 0;
	

	noiseDetail(1, 0.1);
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

		zOff += 0.000002;
	}

	for (let i=0; i<particles.length; i++) {
		particles[i].follow(flowField);
		particles[i].update();
		particles[i].show();
		particles[i].edges();
	}
	
	fr.html(floor(frameRate()));
	
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