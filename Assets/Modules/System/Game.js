"use strict";

class Game {
	constructor() {
		this.file = new File();
		this.config = null;
		this.scene = new Scene();
		this.physics = new Physics();
		this.controls = { mouse: new Mouse() };
		this.motion = {
			segment: { length: 0 },
			stress: { level: 0, easing: 0.01 },
			hue: { value: 0 },
			peak: { active: false }
		};
		this.structure = { particles: [], support: { upper: [], lower: [] }, springs: [] };
		this.worm = null;
	}

	async load() {
		this.config = await this.file.load("Assets/config.yaml");
		this.motion.stress.easing = this.config.ease?.stress ?? this.motion.stress.easing;
		this.physics.configure(this.config);
		this.controls.mouse.configure(this.config);
		return this.config;
	}

	start() {
		const canvas = document.getElementById("canvas");
		paper.setup(canvas);
		this.scene.create();
		this.motion.segment.length = this.segmentlength();
		this.controls.mouse.reset(this.motion.segment.length);
		this.physics.create();

		this.worm = new Worm(this.config);
		this.worm.physics = this.physics;
		this.worm.motion = this.motion;
		this.worm.mouse = this.controls.mouse;
		this.worm.structure = this.structure;
		this.worm.create();
		this.worm.build();
		this.bind();
	}

	bind() {
		setInterval(() => {
			this.physics.tickonce(1);
			this.worm.updateappearance();
			this.worm.updatebody();
		}, this.physics.tick);

		const tool = new Tool();
		tool.onMouseMove = (event) => {
			this.controls.mouse.updatetarget(event, this.motion.segment.length);
		};

		paper.view.onResize = () => {
			this.motion.segment.length = this.segmentlength();
			if (this.structure.particles[0]) {
				this.structure.particles[0].position.x = paper.view.size.width / 2;
				this.structure.particles[0].position.y = paper.view.size.height + this.motion.segment.length;
			}
			this.controls.mouse.reset(this.motion.segment.length);
		};

		paper.view.onFrame = () => {
			this.worm.updatepath();
		};
	}

	segmentlength() {
		return paper.view.size.height / this.worm.dimensions.body.segments * 0.7;
	}
}

window.Game = Game;
