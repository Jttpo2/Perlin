var xOff1 = 0;
var xOff2 = 10000;

function setup() {
	createCanvas(
		window.innerWidth,
		window.innerHeight
		);
	background(50);
}

function draw() {
	background(200);
	fill(100);
	
	// let x = random(width);
	

	let x = map(noise(xOff1), 0, 1, 0, width);
	let y = map(noise(xOff2), 0, 1, 0, height);
	
	ellipse(x, y, 20, 20);

	xOff1 += 0.01;
	xOff2 += 0.005;
}