var increment = 0.1;
var scl = 20;
var cols, rows;

var zOff = 0;

var fr;

particles = [];

var flowField = [];

function setup() {
	createCanvas(
		// window.innerWidth,
		// window.innerHeight
		400, 400
		);
	cols = floor(width/scl);
	rows = floor(height/scl);

	fr = createP('');

	flowField = new Array(cols * rows);

	for (let i=0; i<100; i++) {
		particles[i] = new Particle();	
	}
	
}

function draw() {
	background(255);

	let yOff = 0;
	

	noiseDetail(1, 0.1);
	for (let y=0;y<rows; y++) {
		let xOff = 0;
		for (let x=0; x<cols; x++) {
			let index = (x + y * cols);
			let angle = noise(xOff, yOff, zOff) * TWO_PI;
			let v = p5.Vector.fromAngle(angle);
			v.setMag(5);
			flowField[index] = v;

			xOff += increment;

			stroke(0, 50);
			push();
			translate(x * scl, y * scl);
			rotate(v.heading());
			strokeWeight(1);
			line(0, 0, scl, 0);
			pop();
		}
		yOff += increment;

		zOff += 0.001;
	}

	for (let i=0; i<particles.length; i++) {
		particles[i].follow(flowField);
		particles[i].update();
		particles[i].show();
		particles[i].edges();
	}
	
	fr.html(floor(frameRate()));
	
}