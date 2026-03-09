class Controls {
	constructor() { this.active = false; }
}

class Mouse extends Controls {
	constructor() {
		super();
		this.position = new Position(paper.view.size.width/2, paper.view.size.height-worm.segments);
		this.target = { position: null };
	}

	create(game) {
		this.target.position = new paper.Point();
		game.onMouseMove = function(event) { updateMouseTarget(event); };
		paper.view.onResize = function() { resize(); };
		paper.view.onFrame = function() { updatePathPoints(); };
	}

	update(event) {
		let angleFromCenter = Math.atan2(
			event.point.y - paper.view.size.height,
			event.point.x - paper.view.size.width / 2
		);
		game.mouse.target.position.x = paper.view.size.width / 2 + Math.cos(angleFromCenter) * game.motion.segmentLength;
		game.mouse.target.position.y = paper.view.size.height + Math.sin(angleFromCenter) * game.motion.segmentLength;
	}
}	

