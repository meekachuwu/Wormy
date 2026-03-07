class WormEyeController {
	constructor(wormConfiguration, bodyThickness) {
		this.configuration = wormConfiguration;
		this.bodyThickness = bodyThickness;
		this.currentHeightScale = 1;
		this.eyes = {
			left: {
				shape: null,
				height: 1,
				blink: {
					time: 0,
					active: false,
					lastTimestamp: Date.now()
				}
			},
			right: {
				shape: null,
				height: 1,
				blink: {
					time: 0,
					active: false,
					lastTimestamp: Date.now()
				}
			}
		};
	}

	createShapes() {
		var radius = Math.max(this.configuration.worm.eyes.minimumRadius, this.bodyThickness / 24);
		this.eyes.left.shape = new paper.Path.Circle({ radius: radius, fillColor: this.configuration.worm.colors.eyes });
		this.eyes.right.shape = new paper.Path.Circle({ radius: radius, fillColor: this.configuration.worm.colors.eyes });
		this.eyes.left.shape.applyMatrix = false;
		this.eyes.right.shape.applyMatrix = false;
	}

	updateBlinkState() {
		var now = Date.now();
		var leftBlink = this.eyes.left.blink;
		var rightBlink = this.eyes.right.blink;
		var blinkDelayMilliseconds = this.configuration.worm.eyes.blinkDelayMilliseconds;
		var blinkDurationMilliseconds = this.configuration.worm.eyes.blinkDurationMilliseconds;
		var blinkMinimumHeightScale = this.configuration.worm.eyes.blinkMinimumHeightScale;
		var eyeRecoveryEasing = this.configuration.worm.animation.eyeRecoveryEasing;

		if (!leftBlink.active && now - leftBlink.lastTimestamp >= blinkDelayMilliseconds) {
			leftBlink.active = true;
			rightBlink.active = true;
			leftBlink.time = 0;
			rightBlink.time = 0;
			leftBlink.lastTimestamp = now;
			rightBlink.lastTimestamp = now;
		}

		if (leftBlink.active) {
			leftBlink.time += this.configuration.worm.animation.physicsTickMilliseconds;
			rightBlink.time = leftBlink.time;
			var progress = leftBlink.time / blinkDurationMilliseconds;

			if (progress >= 1) {
				leftBlink.active = false;
				rightBlink.active = false;
				this.currentHeightScale = 1;
			} else if (progress < 0.5) {
				this.currentHeightScale = 1 - progress * 2 * (1 - blinkMinimumHeightScale);
			} else {
				this.currentHeightScale = blinkMinimumHeightScale + (progress - 0.5) * 2 * (1 - blinkMinimumHeightScale);
			}
		} else {
			this.currentHeightScale += (1 - this.currentHeightScale) * eyeRecoveryEasing;
		}

		this.eyes.left.height = this.currentHeightScale;
		this.eyes.right.height = this.currentHeightScale;
	}

	setColor(colorValue) {
		this.eyes.left.shape.fillColor = colorValue;
		this.eyes.right.shape.fillColor = colorValue;
	}

	drawAtSegment(segment) {
		var eyeSpread = this.bodyThickness / 7;
		var eyeForward = this.bodyThickness / 10;
		var perpendicularAngle = segment.angle + Math.PI / 2;
		var forwardPointX = segment.point.x + Math.cos(segment.angle) * eyeForward;
		var forwardPointY = segment.point.y + Math.sin(segment.angle) * eyeForward;

		this.eyes.left.shape.position = new paper.Point(
			forwardPointX + Math.cos(perpendicularAngle) * eyeSpread,
			forwardPointY + Math.sin(perpendicularAngle) * eyeSpread
		);
		this.eyes.right.shape.position = new paper.Point(
			forwardPointX - Math.cos(perpendicularAngle) * eyeSpread,
			forwardPointY - Math.sin(perpendicularAngle) * eyeSpread
		);

		this.eyes.left.shape.scaling = new paper.Point(1, this.eyes.left.height);
		this.eyes.right.shape.scaling = new paper.Point(1, this.eyes.right.height);
	}
}

window.WormEyeController = WormEyeController;
