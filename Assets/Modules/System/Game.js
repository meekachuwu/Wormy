class Game {
	constructor() {
		this.motion			= { stressLevel: 0, hueValue: 0, isPeaking: true, segmentLength: 0 };
		this.mouse			= { position: null, target: { position: null } };
		this.physics		= { system: null };
		this.status			= { stress: null, peak: null };
		this.structure	= { particles: [], support: { upper: [], lower: [] }, springs: [] };
	}

	async load(data) { game.config = await window.config();  initialize();  }

	attachEvents() {
		setInterval(function() { game.physics.system.tick(1); update(); }, game.config.worm.animation.physicsTickMilliseconds);

		new Tool().onMouseMove = function(event) { updateMouseTarget(event); };

		paper.view.onResize = function() { resize(); };
		paper.view.onFrame = function() { updatePathPoints(); };
	}

	resize() {
		worm.position.x = this.sections.center().x;
		game.mouse.target.position= this.sections.center().x;
		game.mouse.target.position.y = this.dimensions.height - worm.segments[0].y;
	}
}