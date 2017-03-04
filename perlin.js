var increment = 0.01;

function setup() {
	createCanvas(
		// window.innerWidth,
		// window.innerHeight
		400, 400
		);

	pixelDensity(1);
}

function draw() {
	let yOff = 0;
	
	loadPixels();

	noiseDetail(6, 0.5);
	for (let y=0;y<height; y++) {
		let xOff = 0;
		for (let x=0; x<width; x++) {
			let index = (x + y * width) * 4;
			let r = noise(xOff, yOff) * 255;

			pixels[index+0] = r; // r
			pixels[index+1] = r; // g
			pixels[index+2] = r; // b
			pixels[index+3] = 255;

			xOff += increment;
		}
		yOff += increment;
	}
	updatePixels();
}