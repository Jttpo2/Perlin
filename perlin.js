var start = 0;
var increment = 0.01;
var noiseScale = 0.01;

var xOff1 = 0;
var xOff2 = 10000;

function setup() {
	createCanvas(
		window.innerWidth,
		window.innerHeight
		);
}

function draw() {
	background(200);
	
	noFill();
	beginShape();
	let xOff1 = start;
	let xOff2 = start;
	for (let x=0; x<width; x++) {
		let y = map(noise(xOff1), 0, 1, 0, height);
		// vertex(x, y);
		let ySine = map(sin(xOff1), -1, 1, -100, 100);
		vertex(x, y + ySine);
		xOff1 += noiseScale;
	}
	endShape();

	start += increment;
}