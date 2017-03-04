function Particle() {
	this.pos = createVector(random(width), random(height));
	this.vel = createVector(0, 0); //p5.Vector.random2D();
	this.acc = createVector(0, 0);
	this.maxSpeed = 4;
	this.size = 0.1;

	this.update = function() {
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	this.applyForce = function(force) {
		this.acc.add(force);
	}

	this.show = function() {
		stroke(0);
		strokeWeight(size);
		point (this.pos.x, this.pos.y);
	}

	this.edges = function() {
		if (this.pos.x > width) {
			this.pos.x = 0;
		}
		if(this.pos.x < 0) {
			this.pos.x = width;
		}
		if (this.pos.y > height) {
			this.pos.y = 0;
		}
		if (this.pos.y < 0) {
			this.pos.y = height;
		}
	}

	this.follow = function(vectors) {
		let x = floor( this.pos.x / scl);
		let y = floor( this.pos.y / scl);
		let index = x + y * cols;
		let force = vectors[index];
		this.applyForce(force);
	}
}