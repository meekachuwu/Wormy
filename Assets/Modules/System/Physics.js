"use strict";

class Physics {
	constructor() {
		this.system = null;
		this.gravity = { x: 0.34, y: -3, z: 0 };
		this.drag = { rest: 0.8, peak: 0.2 };
		this.tick = 16;
	}

	configure(config) {
		this.tick = config.physics?.tick ?? this.tick;
		this.gravity.x = config.physics?.gravity?.[0] ?? this.gravity.x;
		this.gravity.y = config.physics?.gravity?.[1] ?? this.gravity.y;
		this.gravity.z = config.physics?.gravity?.[2] ?? this.gravity.z;
		this.drag.rest = config.physics?.drag ?? this.drag.rest;
		this.drag.peak = config.ease?.drag ?? this.drag.peak;
	}

	create() {
		this.system = new ParticleSystem(this.gravity.x, this.gravity.y, this.gravity.z, this.drag.rest);
		return this.system;
	}

	setpeak(active) {
		if (!this.system) {
			return;
		}

		this.system.drag = active ? this.drag.peak : this.drag.rest;
	}

	tickonce(scale = 1) {
		if (!this.system) {
			return;
		}

		this.system.tick(scale);
	}
}

window.Physics = Physics;
