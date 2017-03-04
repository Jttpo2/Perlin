var increment = 0.1;
var scl = 20;
var cols, rows;

var fr;

function setup() {
	createCanvas(
		// window.innerWidth,
		// window.innerHeight
		400, 400
		);
	cols = floor(width/scl);
	rows = floor(height/scl);

	fr = createP('');
}

function draw() {
	background(255);

	let yOff = 0;
	

	noiseDetail(1, 0.1);
	for (let y=0;y<rows; y++) {
		let xOff = 0;
		for (let x=0; x<cols; x++) {
			let index = (x + y * width) * 4;
			let angle = noise(xOff, yOff) * TWO_PI;

			let v = p5.Vector.fromAngle(angle);
			xOff += increment;

			stroke(0);
			push();
			translate(x * scl, y * scl);
			rotate(v.heading());
			line(0, 0, scl, 0);
			pop();
		}
		yOff += increment;
	}

	fr.html(floor(frameRate()));
	noLoop();
}