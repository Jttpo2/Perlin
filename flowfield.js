// Mouse flowfield interaction
const MAX_MOUSE_AFFECT_DIST = 350;
let mouseAttractionscalar = 10;


// Flowfield globals for optimization purposes
let v;
let flowfieldVectorPos;
let mousePos;
let dist;
let flowfieldVectorColor; // For test drawing vector flowfield
let desiredVectorColor; // For test drawing vector flowfield
let desired;
let isFlowfieldVisibleFromStart = false;
let isDesiredVectorsVisibleFromStart = false;

function Flowfield(scl, flowfieldMagnitude) {
	this.scl = scl;
	this.cols = floor(width/this.scl);
	this.rows = floor(height/this.scl);
	this.vectors = new Array(this.cols * this.rows);

	this.flowfieldMag = flowfieldMagnitude;
	this.maxMouseAffectForce = this.flowfieldMag * 1.2;

	this.isFlowfieldVisible = isFlowfieldVisibleFromStart;
	this.isDesiredVectorsVisible = isDesiredVectorsVisibleFromStart;

	this.mouseMode = MouseModeEnum.ATTRACT;

	// Updates all vectors in flowfield using 3D perlin noise (enabling change over time)
	this.update = function() {
		let yOff = 0;

		noiseDetail(noiseOctaves, falloff);
		for (let y=0;y<this.rows; y++) {
			let xOff = 0;
			for (let x=0; x<this.cols; x++) {
				let index = (x + y * this.cols);
				let angle = noise(xOff, yOff, zOff) * TWO_PI*4;
				v = p5.Vector.fromAngle(angle);

				v.setMag(random(this.flowfieldMag*0.9, this.flowfieldMag*1.1));

				this.affectVectorByMouse(v, x, y);

				this.vectors[index] = v;

				if (this.isFlowfieldVisible) {
					this.drawVector(v, x * this.scl, y * this.scl, flowfieldVectorColor); 
				}

				xOff += increment;
			}
			yOff += increment;
			zOff += zIncrement;
		}
	};

	// 'Bend' the flowfield with the mouse position
	this.affectVectorByMouse = function(v, vectorPosX, vectorPosY) {
		if (this.mouseMode == MouseModeEnum.FREE) {
			return; // Do nothing
		} else {
			flowfieldVectorPos = createVector(vectorPosX * this.scl, vectorPosY * this.scl);
			mousePos = createVector(mouseX, mouseY);
			dist = mousePos.dist(flowfieldVectorPos);		

			if (dist < MAX_MOUSE_AFFECT_DIST) {
				// Within mouse affecting distance
				if (this.mouseMode == MouseModeEnum.ATTRACT) {
					desired = p5.Vector.sub(mousePos, flowfieldVectorPos);
				} else if (this.mouseMode == MouseModeEnum.REPEL) {
					desired = p5.Vector.sub(flowfieldVectorPos, mousePos);
				}

				desired.normalize();
				desired.mult(mouseAttractionscalar);
				desired.div(dist);
				v.add(desired);
				v.limit(this.maxMouseAffectForce);
				if (this.isDesiredVectorsVisible) {
					this.drawVector(desired, flowfieldVectorPos.x, flowfieldVectorPos.y, desiredVectorColor);
				}
			}
		}
	};

	// Visualizes a (flow field) vector
	this.drawVector = function(v, xPos, yPos, color) {
		stroke(color, 50);
		push();
		translate(xPos, yPos);
		rotate(v.heading());
		strokeWeight(1);
		// line(0, 0, this.scl, 0);
		line(0, 0, v.mag()*50, 0);
		pop();
	};

	// Toggle flowfield visibility
	this.toggleVisibility = function() {
		this.isFlowfieldVisible = !this.isFlowfieldVisible;
		console.log('flowfield visible: ' + this.isFlowfieldVisible);
	};

	// Toggle desired vectors visibility
	this.toggleDesiredVectors = function() {
		this.isDesiredVectorsVisible = !this.isDesiredVectorsVisible;
		console.log('desired vectors visible: ' + this.isDesiredVectorsVisible);
	};

	// Switch between attraction and repulsion modes
	this.toggleMouseAttractRepel = function() {
		if (mouseMode == MouseModeEnum.ATTRACT) {
			mouseMode = MouseModeEnum.REPEL;
		} else if (mouseMode == MouseModeEnum.REPEL) {
			mouseMode = MouseModeEnum.ATTRACT;
		}
		console.log('mouse mode: ' + mouseMode);
	};
}


