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
		this.size = { radius: Math.max(settings.worm?.proportions?.eyes ?? 4, thickness / 8) };
		this.offset = {
			spread: thickness * 0.62 + this.size.radius,
			forward: Math.max(10, thickness * 0.08)
		};
		this.shape = null;
		this.position = new paper.Point(0, 0);
	}

	create() {
		this.shape = null;
	}

	setcolor(value) {
		this.state.color = "white";
		if (this.shape) {
			this.shape.fillColor = "white";
		}
	}

	isvalidsegment(segment) {
		return Boolean(
			segment &&
			segment.point &&
			typeof segment.point.x === "number" &&
			typeof segment.point.y === "number"
		);
	}

	updateblink() {
		// Blink disabled: keep eyes fully open.
		this.state.open = true;
		this.state.height = 1;
	}

	draw(segment) {
		try {
			if (!this.isvalidsegment(segment)) {
				return false;
			}

			const direction = this.side === "left" ? 1 : -1;
			const fixedX = 150 + (direction === 1 ? 50 : -50);
			const fixedY = 80;
			this.position = new paper.Point(fixedX, fixedY);

			if (!Number.isFinite(this.position.x) || !Number.isFinite(this.position.y)) {
				return false;
			}

			const view = paper.view?.size;
			if (view) {
				const radius = this.size.radius;
				this.position.x = Math.max(radius, Math.min(view.width - radius, this.position.x));
				this.position.y = Math.max(radius, Math.min(view.height - radius, this.position.y));
			}

			if (this.shape && typeof this.shape.remove === "function") {
				this.shape.remove();
			}

			this.shape = new paper.Path.Circle({
				center: this.position,
				radius: this.size.radius
			});
			this.shape.fillColor = "white";
			this.shape.strokeColor = "black";
			this.shape.strokeWidth = Math.max(2, this.size.radius * 0.2);
			this.shape.opacity = 1;
			this.shape.visible = true;
			if (paper.project?.activeLayer) {
				paper.project.activeLayer.addChild(this.shape);
			}

			return true;
		} catch (error) {
			console.warn("Eye.draw() skipped invalid frame", error);
			return false;
		}
	}
}

window.Eye = Eye;
