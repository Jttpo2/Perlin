var start = 0;
var increment = 0.01;

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
	for (let x=0; x<width; x++) {
		let y = noise(xOff1) * height;
		vertex(x, y);
		xOff1 += increment;
	}
	endShape();

	start += increment;
}