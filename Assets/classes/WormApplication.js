class WormApplication {
	constructor(wormConfiguration) {
		this.configuration = wormConfiguration;
		this.motion = {
			stressLevel: 0,
			hueValue: 0,
			isPeaking: true,
			segmentLength: 0
		};
		this.mouse = {
			position: null,
			target: {
				position: null
			}
		};
		this.physics = {
			system: null
		};
		this.shapes = {
			body: null,
			mouth: null,
			tongue: null,
			paths: []
		};
		this.structure = {
			particles: [],
			supportParticlesUpper: [],
			supportParticlesLower: [],
			springs: []
		};
		this.eyes = null;
	}

	initialize() {
		var canvasElement = document.getElementById("canvas");
		paper.setup(canvasElement);

		this.motion.segmentLength = this.calculateSegmentLength();
		this.mouse.position = new paper.Point(
			paper.view.size.width / 2,
			paper.view.size.height - this.motion.segmentLength
		);
		this.mouse.target.position = new paper.Point(
			paper.view.size.width / 2,
			paper.view.size.height - this.motion.segmentLength
		);

		this.physics.system = new ParticleSystem(
			this.configuration.worm.physics.gravity.x,
			this.configuration.worm.physics.gravity.y,
			this.configuration.worm.physics.gravity.z,
			this.configuration.worm.physics.dragAtRest
		);

		this.createBodyShapes();
		this.eyes = new WormEyeController(this.configuration, this.configuration.worm.dimensions.bodyThickness);
		this.eyes.createShapes();
		this.buildWormStructure();
		this.attachEvents();
	}

	createBodyShapes() {
		this.shapes.body = new paper.Path();
		this.shapes.mouth = new paper.Path();
		this.shapes.tongue = new paper.Path();

		this.shapes.body.style = {
			strokeColor: this.configuration.worm.colors.body,
			strokeWidth: this.configuration.worm.dimensions.bodyThickness
		};
		this.shapes.body.style.strokeCap = this.shapes.mouth.style.strokeCap = this.shapes.tongue.style.strokeCap = "round";
		this.shapes.mouth.style.strokeColor = this.configuration.worm.colors.mouth;
		this.shapes.tongue.style.strokeColor = this.configuration.worm.colors.tongue;
		this.shapes.mouth.opacity = 0;
		this.shapes.tongue.opacity = 0;
		this.shapes.paths.push(this.shapes.body, this.shapes.mouth, this.shapes.tongue);
	}

	buildWormStructure() {
		for (var segmentIndex = 0; segmentIndex < this.configuration.worm.dimensions.bodySegmentCount; segmentIndex++) {
			var xPosition = paper.view.size.width / 2;
			var yPosition = paper.view.size.height - (segmentIndex - 1) * this.motion.segmentLength;
			var bodyParticle = this.physics.system.makeParticle(2.5, xPosition, yPosition, 0);
			var upperSupportParticle = this.physics.system.makeParticle(1, xPosition, yPosition - this.motion.segmentLength, 0);
			var lowerSupportParticle = this.physics.system.makeParticle(1, xPosition, yPosition + this.motion.segmentLength, 0);

			if (segmentIndex > 0) {
				var previousUpperSupportParticle = this.structure.supportParticlesUpper[segmentIndex - 1];
				var previousBodyParticle = this.structure.particles[segmentIndex - 1];
				this.physics.system.makeSpring(bodyParticle, previousUpperSupportParticle, 0.6, 0.48, 0);
				this.physics.system.makeSpring(previousBodyParticle, lowerSupportParticle, 0.3, 0.7, 0);
				this.structure.springs.push(this.physics.system.makeSpring(bodyParticle, previousBodyParticle, 0.2, 0.1, this.motion.segmentLength));
			}

			if (segmentIndex < 2) {
				bodyParticle.makeFixed();
			}
			upperSupportParticle.makeFixed();
			lowerSupportParticle.makeFixed();
			this.shapes.body.add(new paper.Point());

			this.structure.particles.push(bodyParticle);
			this.structure.supportParticlesUpper.push(upperSupportParticle);
			this.structure.supportParticlesLower.push(lowerSupportParticle);
		}

		for (var mouthPointIndex = 0; mouthPointIndex < this.configuration.worm.dimensions.mouthPointCount; mouthPointIndex++) {
			this.shapes.mouth.add(new paper.Point());
			if (mouthPointIndex < this.configuration.worm.dimensions.mouthPointCount * 0.3) {
				this.shapes.tongue.add(new paper.Point());
			}
		}
	}

	attachEvents() {
		var self = this;
		setInterval(function() {
			self.physics.system.tick(1);
			self.updateAppearance();
			self.updateBodyPositions();
		}, this.configuration.worm.animation.physicsTickMilliseconds);

		new Tool().onMouseMove = function(event) {
			self.updateMouseTarget(event);
		};

		paper.view.onResize = function() {
			self.handleResize();
		};

		paper.view.onFrame = function() {
			self.updatePathPoints();
		};
	}

	updateMouseTarget(event) {
		var angleFromCenter = Math.atan2(
			event.point.y - paper.view.size.height,
			event.point.x - paper.view.size.width / 2
		);
		this.mouse.target.position.x = paper.view.size.width / 2 + Math.cos(angleFromCenter) * this.motion.segmentLength;
		this.mouse.target.position.y = paper.view.size.height + Math.sin(angleFromCenter) * this.motion.segmentLength;
	}

	handleResize() {
		this.motion.segmentLength = this.calculateSegmentLength();
		this.structure.particles[0].position.x = paper.view.size.width / 2;
		this.structure.particles[0].position.y = paper.view.size.height + this.motion.segmentLength;
		this.mouse.target.position.x = paper.view.size.width / 2;
		this.mouse.target.position.y = paper.view.size.height - this.motion.segmentLength;
	}

	updateBodyPositions() {
		var mouseTargetEasing = this.configuration.worm.interaction.mouseTargetEasing;
		this.mouse.position.x += (this.mouse.target.position.x - this.mouse.position.x) * mouseTargetEasing;
		this.mouse.position.y += (this.mouse.target.position.y - this.mouse.position.y) * mouseTargetEasing;

		this.structure.particles[1].position.x = this.mouse.position.x;
		this.structure.particles[1].position.y = this.mouse.position.y;

		var targetStressLevel = 0;
		for (var segmentIndex = 1; segmentIndex < this.configuration.worm.dimensions.bodySegmentCount; segmentIndex++) {
			var upperSupportParticle = this.structure.supportParticlesUpper[segmentIndex];
			var currentBodyParticle = this.structure.particles[segmentIndex];
			var previousBodyParticle = this.structure.particles[segmentIndex - 1];
			var segmentAngle = Math.atan2(
				currentBodyParticle.position.y - previousBodyParticle.position.y,
				currentBodyParticle.position.x - previousBodyParticle.position.x
			);
			var particleForce = currentBodyParticle.force.length();
			if (segmentIndex > 1) {
				targetStressLevel += particleForce;
			}

			upperSupportParticle.position.x = currentBodyParticle.position.x + Math.cos(segmentAngle) * this.motion.segmentLength;
			upperSupportParticle.position.y = currentBodyParticle.position.y + Math.sin(segmentAngle) * this.motion.segmentLength;
			this.shapes.body.segments[segmentIndex].angle = segmentAngle;

			var lowerSupportParticle = this.structure.supportParticlesLower[segmentIndex];
			lowerSupportParticle.position.x = currentBodyParticle.position.x + Math.cos(Math.PI + segmentAngle) * this.motion.segmentLength;
			lowerSupportParticle.position.y = currentBodyParticle.position.y + Math.sin(Math.PI + segmentAngle) * this.motion.segmentLength;
		}

		this.motion.stressLevel += (targetStressLevel - this.motion.stressLevel) * this.configuration.worm.animation.stressEasing;
		this.eyes.drawAtSegment(this.shapes.body.segments[this.configuration.worm.dimensions.bodySegmentCount - 3]);
	}

	updateAppearance() {
		this.eyes.updateBlinkState();
		if (this.motion.stressLevel > this.configuration.worm.behavior.stressLimit) {
			if (this.configuration.worm.behavior.rainbowEnabled) {
				this.motion.hueValue = Math.round(++this.motion.hueValue) % 360;
				this.shapes.body.strokeColor = "hsl(" + this.motion.hueValue + ", 100%, 40%)";
				this.shapes.mouth.strokeColor = "hsl(" + this.motion.hueValue + ", 100%, 10%)";
				this.shapes.tongue.strokeColor = "hsl(" + this.motion.hueValue + ", 100%, 60%)";
				this.eyes.setColor("hsl(" + this.motion.hueValue + ", 100%, 50%)");
			}
			if (!this.motion.isPeaking) {
				this.motion.isPeaking = true;
				document.body.className = "fadeIn";
				this.shapes.body.strokeColor = "red";
				this.physics.system.drag = this.configuration.worm.physics.dragAtPeak;
				this.shapes.mouth.opacity = 0.5;
				this.shapes.tongue.opacity = 0.5;
			}

			this.shapes.mouth.strokeWidth = this.configuration.worm.dimensions.bodyThickness / 1.5 + Math.random() * 10;
			this.shapes.tongue.strokeWidth = this.shapes.mouth.strokeWidth * 0.65;
		} else {
			if (this.motion.isPeaking) {
				this.motion.isPeaking = false;
				document.body.className = "fadeOut";
				this.shapes.body.strokeColor = this.configuration.worm.colors.body;
				this.physics.system.drag = this.configuration.worm.physics.dragAtRest;
				this.shapes.mouth.opacity = 0;
				this.shapes.tongue.opacity = 0;
				this.eyes.setColor(this.configuration.worm.colors.eyes);
			}
		}
	}

	updatePathPoints() {
		for (var segmentIndex = 0; segmentIndex < this.configuration.worm.dimensions.bodySegmentCount; segmentIndex++) {
			var currentBodyParticle = this.structure.particles[segmentIndex];
			var segmentAngle = this.shapes.body.segments[segmentIndex].angle + Math.PI;
			this.shapes.body.segments[segmentIndex].point.x = currentBodyParticle.position.x;
			this.shapes.body.segments[segmentIndex].point.y = currentBodyParticle.position.y;

			var mouthSegmentIndex = segmentIndex - 1;
			if (mouthSegmentIndex >= 0 && mouthSegmentIndex < this.shapes.mouth.segments.length) {
				this.shapes.mouth.segments[mouthSegmentIndex].point.x = currentBodyParticle.position.x;
				this.shapes.mouth.segments[mouthSegmentIndex].point.y = currentBodyParticle.position.y;
				this.shapes.mouth.segments[mouthSegmentIndex].point.x += Math.cos(segmentAngle) * this.configuration.worm.dimensions.bodyThickness / 12;
				this.shapes.mouth.segments[mouthSegmentIndex].point.y += Math.sin(segmentAngle) * this.configuration.worm.dimensions.bodyThickness / 12;

				if (this.shapes.tongue.segments[mouthSegmentIndex]) {
					this.shapes.tongue.segments[mouthSegmentIndex].point.x = this.shapes.mouth.segments[mouthSegmentIndex].point.x;
					this.shapes.tongue.segments[mouthSegmentIndex].point.y = this.shapes.mouth.segments[mouthSegmentIndex].point.y;
					this.shapes.tongue.segments[mouthSegmentIndex].point.x -= Math.cos(segmentAngle) * (this.shapes.mouth.strokeWidth / 12);
					this.shapes.tongue.segments[mouthSegmentIndex].point.y -= Math.sin(segmentAngle) * (this.shapes.mouth.strokeWidth / 12);
				}
			}
		}

		if (this.configuration.worm.behavior.smoothPaths) {
			for (var pathIndex = 0; pathIndex < this.shapes.paths.length; pathIndex++) {
				this.shapes.paths[pathIndex].smooth();
			}
		}
	}

	calculateSegmentLength() {
		return paper.view.size.height / this.configuration.worm.dimensions.bodySegmentCount * 0.7;
	}
}

window.WormApplication = WormApplication;
