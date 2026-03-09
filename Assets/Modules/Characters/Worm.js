class Worm {
	constructor() {
		this.size = null;
		this.behavior = null;
		this.animation = null;
		this.interaction = null;
		
		this.segments	= null;
		this.body		= null;
		this.mouth	= null;
		this.tongue	= null;
		this.eyes		= { left: null, right: null };
		this.paths = [];

		// These will be injected from game
		this.motion = null;
		this.mouse = null;
		this.structure = null;
		this.physics = null;
	}

	create() {
		this.eyes.left = new Eye(this.settings, this.dimensions.bodyThickness);
		this.eyes.right = new Eye(this.settings, this.dimensions.bodyThickness);
		this.eyes.left.create();
		this.eyes.right.create();
		this.createBody();
	}

	createBody() {
		this.body = new paper.Path();
		this.mouth = new paper.Path();
		this.tongue = new paper.Path();

		this.body.style = { strokeColor: this.colors.body, strokeWidth: this.dimensions.bodyThickness };
		this.body.style.strokeCap = this.mouth.style.strokeCap = this.tongue.style.strokeCap = "round";

		this.mouth.style.strokeColor = this.colors.mouth;
		this.tongue.style.strokeColor = this.colors.tongue;
		this.mouth.opacity = 0;
		this.tongue.opacity = 0;

		this.paths.push(this.body, this.mouth, this.tongue);
	}

	build() {
		for (var i = 0; i < this.dimensions.bodySegmentCount; i++) {
			var position = {};
			position.x = paper.view.size.width / 2;
			position.y = paper.view.size.height - (i - 1) * this.motion.segmentLength;

			var particle = {};
			particle.body = this.physics.system.makeParticle(2.5, position.x, position.y, 0);

			var support = {};
			support.upper = this.physics.system.makeParticle(1, position.x, position.y - this.motion.segmentLength, 0);
			support.lower = this.physics.system.makeParticle(1, position.x, position.y + this.motion.segmentLength, 0);

			if (i > 0) {
				var previous = {};
				previous.upper = this.structure.support.upper[i - 1];
				previous.body = this.structure.particles[i - 1];

				this.physics.system.makeSpring(particle.body, previous.upper, 0.6, 0.48, 0);
				this.physics.system.makeSpring(previous.body, support.lower, 0.3, 0.7, 0);
				this.structure.springs.push(this.physics.system.makeSpring(particle.body, previous.body, 0.2, 0.1, this.motion.segmentLength));
			}

			if (i < 2) { particle.body.makeFixed(); }
			support.upper.makeFixed(); support.lower.makeFixed();

			this.body.add(new paper.Point());
			this.structure.particles.push(particle.body);
			this.structure.support.upper.push(support.upper);
			this.structure.support.lower.push(support.lower);
		}

		for (var i = 0; i < this.dimensions.mouthPointCount; i++) {
			this.mouth.add(new paper.Point());
			if (i < this.dimensions.mouthPointCount * 0.3) { this.tongue.add(new paper.Point()); } }
	}

	updateBodyPositions() {
		var easing = this.interaction.mouseTargetEasing;
		this.mouse.position.x += (this.mouse.target.position.x - this.mouse.position.x) * easing;
		this.mouse.position.y += (this.mouse.target.position.y - this.mouse.position.y) * easing;

		this.structure.particles[1].position.x = this.mouse.position.x;
		this.structure.particles[1].position.y = this.mouse.position.y;

		var target = { stress: 0 };
		for (var i = 1; i < this.dimensions.bodySegmentCount; i++) {
			var support = {};
			support.upper = this.structure.support.upper[i];
			var current = this.structure.particles[i];
			var previous = this.structure.particles[i - 1];
			var angle = Math.atan2(
				current.position.y - previous.position.y,
				current.position.x - previous.position.x
			);
			var force = current.force.length();
			if (i > 1) {
				target.stress += force;
			}

			support.upper.position.x = current.position.x + Math.cos(angle) * this.motion.segmentLength;
			support.upper.position.y = current.position.y + Math.sin(angle) * this.motion.segmentLength;
			this.body.segments[i].angle = angle;

			support.lower = this.structure.support.lower[i];
			support.lower.position.x = current.position.x + Math.cos(Math.PI + angle) * this.motion.segmentLength;
			support.lower.position.y = current.position.y + Math.sin(Math.PI + angle) * this.motion.segmentLength;
		}

		this.motion.stressLevel += (target.stress - this.motion.stressLevel) * this.animation.stressEasing;
		if (this.eyes.left && this.eyes.right) {
			var eyeSegment = this.body.segments[this.dimensions.bodySegmentCount - 3];
			this.eyes.left.draw(eyeSegment);
			this.eyes.right.draw(eyeSegment);
		}
	}

	updateAppearance() {
		if (this.eyes.left) this.eyes.left.updateBlinkState();
		if (this.eyes.right) this.eyes.right.updateBlinkState();
		if (this.motion.stressLevel > this.behavior.stressLimit) {
			if (this.behavior.rainbowEnabled) {
				this.motion.hueValue = Math.round(++this.motion.hueValue) % 360;
				this.body.strokeColor = "hsl(" + this.motion.hueValue + ", 100%, 40%)";
				this.mouth.strokeColor = "hsl(" + this.motion.hueValue + ", 100%, 10%)";
				this.tongue.strokeColor = "hsl(" + this.motion.hueValue + ", 100%, 60%)";
				if (this.eyes.left) this.eyes.left.setColor("hsl(" + this.motion.hueValue + ", 100%, 50%)");
				if (this.eyes.right) this.eyes.right.setColor("hsl(" + this.motion.hueValue + ", 100%, 50%)");
			}
			if (!this.motion.isPeaking) {
				this.motion.isPeaking = true;
				document.body.className = "fadeIn";
				this.body.strokeColor = "red";
				this.physics.system.drag = this.settings.worm.physics.dragAtPeak;
				this.mouth.opacity = 0.5;
				this.tongue.opacity = 0.5;
			}

			this.mouth.strokeWidth = this.dimensions.thickness / 1.5 + Math.random() * 10;
			this.tongue.strokeWidth = this.mouth.strokeWidth * 0.65;
		} else {
			if (this.motion.isPeaking) {
				this.motion.isPeaking = false;
				document.body.className = "fadeOut";
				this.body.strokeColor = this.colors.body;
				this.physics.system.drag = this.settings.worm.physics.dragAtRest;
				this.mouth.opacity = 0;
				this.tongue.opacity = 0;
				if (this.eyes.left) this.eyes.left.setColor(this.colors.eyes);
				if (this.eyes.right) this.eyes.right.setColor(this.colors.eyes);
			}
		}
	}

	updatePathPoints() {
		for (var i = 0; i < this.dimensions.bodySegmentCount; i++) {
			var current = this.structure.particles[i];
			var angle = this.body.segments[i].angle + Math.PI;
			this.body.segments[i].point.x = current.position.x;
			this.body.segments[i].point.y = current.position.y;

			var mouth = { i: i - 1 };
			if (mouth.i >= 0 && mouth.i < this.mouth.segments.length) {
				this.mouth.segments[mouth.i].point.x = current.position.x;
				this.mouth.segments[mouth.i].point.y = current.position.y;
				this.mouth.segments[mouth.i].point.x += Math.cos(angle) * this.dimensions.thickness / 12;
				this.mouth.segments[mouth.i].point.y += Math.sin(angle) * this.dimensions.thickness / 12;

				if (this.tongue.segments[mouth.i]) {
					this.tongue.segments[mouth.i].point.x = this.mouth.segments[mouth.i].point.x;
					this.tongue.segments[mouth.i].point.y = this.mouth.segments[mouth.i].point.y;
					this.tongue.segments[mouth.i].point.x -= Math.cos(angle) * (this.mouth.strokeWidth / 12);
					this.tongue.segments[mouth.i].point.y -= Math.sin(angle) * (this.mouth.strokeWidth / 12);
				}
			}
		}

		if (this.behavior.smoothPaths) {
			for (var i = 0; i < this.paths.length; i++) {
				this.paths[i].smooth();
			}
		}
	}

	calculateSegmentLength() { return paper.view.size.height / this.dimensions.bodySegmentCount * 0.7; }
}