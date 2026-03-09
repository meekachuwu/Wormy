"use strict";

class Noodle {
	constructor(color, thickness) {
		this.path = new paper.Path();
		this.path.style = { strokeColor: color, strokeWidth: thickness, strokeCap: "round" };
		this.points = [];
	}

	add(count) {
		for (let index = 0; index < count; index++) {
			this.path.add(new paper.Point());
		}
	}

	set(index, x, y) {
		if (!this.path.segments[index]) {
			return;
		}

		this.path.segments[index].point.x = x;
		this.path.segments[index].point.y = y;
	}

	smooth(enabled) {
		if (!enabled) {
			return;
		}

		this.path.smooth();
	}
}

window.Noodle = Noodle;
