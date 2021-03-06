// (function() {
// 	"use strict";

function Particle(col) {
	this.pos = createVector(random(width), random(height));
	this.vel = createVector(0, 0); //p5.Vector.random2D();
	this.acc = createVector(0, 0);
	this.maxSpeed = 4;
	this.size = 1;
	this.color = col;
	// this.alpha = 1;
	this.previous = this.pos.copy();

	this.update = function() {
		this.updatePrev();

		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0);
	};

	this.applyForce = function(force) {
		this.acc.add(force);
	}; 

	this.show = function() {
		// stroke(this.color, this.alpha);
		stroke(this.color);
		strokeWeight(this.size);
		// point (this.pos.x, this.pos.y);
		line(this.previous.x, this.previous.y, this.pos.x, this.pos.y);
	};

	this.updatePrev = function() {
		this.previous.x = this.pos.x;
		this.previous.y = this.pos.y;
	};

	this.edges = function() {
		if (this.pos.x > width) {
			this.pos.x = 0;
			this.updatePrev();
		}
		if(this.pos.x < 0) {
			this.pos.x = width;
			this.updatePrev();
		}
		if (this.pos.y > height) {
			this.pos.y = 0;
			this.updatePrev();
		}
		if (this.pos.y < 0) {
			this.pos.y = height;
			this.updatePrev();
		}
	};

	this.follow = function(flowfield) {
		let x = floor( this.pos.x / flowfield.scl);
		let y = floor( this.pos.y / flowfield.scl);
		let index = x + y * flowfield.cols;
		let force = flowfield.vectors[index];
		this.applyForce(force);
	};
}

// })();