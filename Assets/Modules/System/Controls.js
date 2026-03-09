"use strict";

class Controls {
	constructor() {
		this.active = false;
	}
}

class Mouse extends Controls {
	constructor() {
		super();
		this.position = { x: 0, y: 0 };
		this.target = { position: { x: 0, y: 0 } };
		this.easing = 0.5;
	}

	configure(config) {
		this.easing = config.ease?.target ?? this.easing;
	}

	reset(segmentlength) {
		this.position.x = paper.view.size.width / 2;
		this.position.y = paper.view.size.height - segmentlength;
		this.target.position.x = this.position.x;
		this.target.position.y = this.position.y;
	}

	updatetarget(event, segmentlength) {
		const angle = Math.atan2(event.point.y - paper.view.size.height, event.point.x - paper.view.size.width / 2);
		this.target.position.x = paper.view.size.width / 2 + Math.cos(angle) * segmentlength;
		this.target.position.y = paper.view.size.height + Math.sin(angle) * segmentlength;
	}

	updateposition() {
		this.position.x += (this.target.position.x - this.position.x) * this.easing;
		this.position.y += (this.target.position.y - this.position.y) * this.easing;
	}
}

window.Controls = Controls;
window.Mouse = Mouse;
