"use strict";

class Worm {
	constructor(settings) {
		this.settings = settings;
		const size = settings.worm?.size ?? 1;
		const proportions = settings.worm?.proportions ?? {};

		this.numSegments = Math.max(3, Math.round((proportions.body ?? 8) * size));
		this.thickness = (proportions.fat ?? 250) * size;
		this.color = settings.worm?.color ?? {
			body: "black",
			mouth: "black",
			tongue: "crimson",
			eyes: "white"
		};

		this.segments = [];
		this.targetX = 0;
		this.targetY = 0;
		this.segmentLength = 15;
		this.gravity = 0.05;
		this.friction = 0.95;
	}

	init(startX, startY) {
		this.segments = [];
		for (let i = 0; i < this.numSegments; i++) {
			this.segments.push({
				x: startX,
				y: startY + i * this.segmentLength,
				vx: 0,
				vy: 0,
				pinned: i < 2
			});
		}
		this.targetX = startX;
		this.targetY = startY;
	}

	setTarget(x, y) {
		this.targetX = x;
		this.targetY = y;
	}

	update(canvasWidth, canvasHeight) {
		const head = this.segments[0];
		head.x += (this.targetX - head.x) * 0.1;
		head.y += (this.targetY - head.y) * 0.1;

		for (let i = 1; i < this.segments.length; i++) {
			const seg = this.segments[i];
			const prev = this.segments[i - 1];

			seg.x += (seg.vx) * this.friction;
			seg.y += (seg.vy) * this.friction;
			seg.vy += this.gravity;

			const dx = seg.x - prev.x;
			const dy = seg.y - prev.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);

			seg.x = prev.x + Math.cos(angle) * this.segmentLength;
			seg.y = prev.y + Math.sin(angle) * this.segmentLength;

			seg.vx = seg.x - prev.x;
			seg.vy = seg.y - prev.y;

			seg.y = Math.min(canvasHeight, seg.y);
		}
	}

	render(ctx) {
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		ctx.strokeStyle = this.color.body;
		ctx.lineWidth = this.thickness;
		ctx.beginPath();
		ctx.moveTo(this.segments[0].x, this.segments[0].y);
		for (let i = 1; i < this.segments.length; i++) {
			ctx.lineTo(this.segments[i].x, this.segments[i].y);
		}
		ctx.stroke();

		ctx.strokeStyle = this.color.mouth;
		ctx.lineWidth = this.thickness / 12;
		ctx.beginPath();
		ctx.moveTo(this.segments[0].x, this.segments[0].y);
		if (this.segments[1]) {
			ctx.lineTo(this.segments[1].x, this.segments[1].y);
		}
		ctx.stroke();

		ctx.strokeStyle = this.color.tongue;
		ctx.lineWidth = this.thickness / 20;
		ctx.beginPath();
		ctx.moveTo(this.segments[0].x, this.segments[0].y);
		if (this.segments[2]) {
			ctx.lineTo(this.segments[2].x, this.segments[2].y);
		}
		ctx.stroke();

		const midX = (this.segments[0].x + this.segments[1].x) / 2;
		const midY = (this.segments[0].y + this.segments[1].y) / 2;
		const eyeRadius = this.thickness * 0.15;
		const eyeSpacing = this.thickness * 0.35;

		ctx.fillStyle = this.color.eyes;
		ctx.beginPath();
		ctx.arc(midX - eyeSpacing, midY - eyeRadius * 1.5, eyeRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.fillStyle = this.color.eyes;
		ctx.beginPath();
		ctx.arc(midX + eyeSpacing, midY - eyeRadius * 1.5, eyeRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

window.Worm = Worm;
