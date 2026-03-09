"use strict";

class Eye {
	constructor(settings, thickness, side) {
		this.settings = settings;
		this.side = side;
		this.state = {
			color: settings.worm?.color?.eyes ?? "red",
			height: 1,
			open: true,
			blink: { time: 0, delay: settings.worm?.behavior?.blink?.delay ?? 6000, duration: settings.worm?.behavior?.blink?.duration ?? 220 }
		};
		this.size = { radius: Math.max(settings.worm?.proportions?.eyes ?? 4, thickness / 24) };
		this.offset = { spread: thickness / 7, forward: thickness / 10 };
		this.shape = null;
		this.position = { x: 0, y: 0 };
	}

	create() {
		this.shape = new paper.Path.Circle({ radius: this.size.radius, fillColor: this.state.color });
		this.shape.applyMatrix = false;
	}

	setcolor(value) {
		this.state.color = value;
		if (this.shape) {
			this.shape.fillColor = value;
		}
	}

	updateblink() {
		this.state.blink.time += this.settings.physics?.tick ?? 16;
		const phase = this.state.blink.time / this.state.blink.duration;

		switch (true) {
			case this.state.open && this.state.blink.time >= this.state.blink.delay:
				this.state.open = false;
				this.state.blink.time = 0;
				break;
			case !this.state.open && phase >= 1:
				this.state.open = true;
				this.state.blink.time = 0;
				break;
			default:
				break;
		}

		switch (true) {
			case this.state.open:
				this.state.height += (1 - this.state.height) * (this.settings.ease?.eye ?? 0.25);
				break;
			default:
				this.state.height += (0.1 - this.state.height) * 0.55;
				break;
		}
	}

	draw(segment) {
		const angle = segment.angle + Math.PI / 2;
		const direction = this.side === "left" ? 1 : -1;
		const base = {
			x: segment.point.x + Math.cos(segment.angle) * this.offset.forward,
			y: segment.point.y + Math.sin(segment.angle) * this.offset.forward
		};

		this.position.x = base.x + Math.cos(angle) * this.offset.spread * direction;
		this.position.y = base.y + Math.sin(angle) * this.offset.spread * direction;

		if (this.shape) {
			this.shape.position = new paper.Point(this.position.x, this.position.y);
			this.shape.scaling = new paper.Point(1, this.state.height);
		}
	}
}

window.Eye = Eye;
