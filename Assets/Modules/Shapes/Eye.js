class Eye {
	constructor(config, thickness) {
		this.config = config;
		this.thickness = thickness || config.worm.dimensions.bodyThickness;
		this.size = null;
		this.height = Math.random() * 50 + 50;
		this.position = null;
		this.color = config.worm.colors.eyes;
		this.open = true;
		this.shape = null;
		this.blinkTimer = 0;
	}

	create() {
		let radius = Math.max(this.config.worm.eyes.minimumRadius, this.thickness / 24);
		this.shape = new paper.Path.Circle({ radius: radius, fillColor: this.color });
		this.shape.applyMatrix = false;
	}

	updateBlinkState() {
		this.blinkTimer++;
		
		if (this.open && this.blinkTimer > Math.random() * 200 + 100) { this.open = false; this.blinkTimer = 0; } 
		else if (!this.open && this.blinkTimer > 10) { this.open = true; this.blinkTimer = 0; }
		
		if (this.open && this.height < 100) { this.height += 5; }
		else if (!this.open && this.height > 0) { this.height -= 10; }
		
		if (this.shape) { this.shape.scaling = new paper.Point(1, this.height / 100); }
	}

	setColor(color) {
		this.color = color;
		if (this.shape) { this.shape.fillColor = color; }
	}

	update() {
		if (this.shape && this.position) { this.shape.position = this.position; }
	}

	draw(segment) {
		let eyeSpread = this.thickness / 7;
		let eyeForward = this.thickness / 10;
		let angle = segment.angle + Math.PI / 2;
		let forwardX = segment.point.x + Math.cos(segment.angle) * eyeForward;
		let forwardY = segment.point.y + Math.sin(segment.angle) * eyeForward;

		this.position = new paper.Point(
			forwardX + Math.cos(angle) * eyeSpread,
			forwardY + Math.sin(angle) * eyeSpread
		);

		this.shape.scaling = new paper.Point(1, this.height / 100);
		this.update();
	}
}