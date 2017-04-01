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