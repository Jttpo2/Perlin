var start = 0;
var increment = 0.01;
var noiseScale = 0.01;

var xOff1 = 0;
var xOff2 = 10000;

function setup() {
	createCanvas(
		// window.innerWidth,
		// window.innerHeight
		200, 200
		);

	pixelDensity(1);
}

function draw() {
	loadPixels();

	for (let x=0; x<width; x++) {
		for (let y=0;y<height; y++) {
			let index = (x + y * width) * 4;
			let r = random(255);

			pixels[index+0] = r; // r
			pixels[index+1] = r; // g
			pixels[index+2] = r; // b
			pixels[index+3] = 255;
		}
	}
	updatePixels();
}