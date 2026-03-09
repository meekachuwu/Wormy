class Scene {
	constructor(view) { 
		this.dimensions = { width:	view.size.width, height:	view.size.height };
		this.sections = {
			center: () => { return new Position(this.dimensions.width / 2, this.dimensions.height / 2); }
		};
		this.background = { color: null };
		this.objects = [];
	}

	create() {
		var canvasElement = document.getElementById("canvas");
		paper.setup(canvasElement);

		game.mouse.position = new paper.Point( this.sections.center().x, this.dimensions.height - worm.segments[0].y );
		game.mouse.target = new paper.Point( this.sections.center().x, this.dimensions.height - worm.segments[0].y );

		game.physics.system = new ParticleSystem( physics.gravity, physics.drag );

		createBodyShapes();
		game.eyes = new WormEyeController(game.config, game.config.worm.dimensions.bodyThickness);
		game.eyes.createShapes();
		buildWormStructure();
		attachEvents();
	}

	update()	{ this.update();	}
	draw()		{ this.path.update();				}
}