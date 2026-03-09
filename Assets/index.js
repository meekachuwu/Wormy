/*
	ToDo:
	- [x] Make run locally without need for server (no serverside code)
	- [ ] Use Object-Oriented programming to fullest extent
	- [ ] Use PaperJS for eyes
*/

paper.install(window);

// Global instances
let game = new Game();
game.load();
let worm = null;
let scene = new Scene();

// Bootstrap
window.onload = async function() { game.config = await window.config();  initialize(); };

// Initialization
function initialize() {
	let canvasElement = document.getElementById("canvas");
	paper.setup(canvasElement);

	game.motion.segmentLength = calculateSegmentLength();

	game.physics.system = new ParticleSystem(
		game.config.worm.physics.gravity.x,
		game.config.worm.physics.gravity.y,
		game.config.worm.physics.gravity.z,
		game.config.worm.physics.dragAtRest
	);

	// Create worm
	worm = new Worm(game.config);
	worm.motion = game.motion;
	worm.mouse = game.mouse;
	worm.structure = game.structure;
	worm.physics = game.physics;
	
	worm.create();
	worm.build();
	
	game.attachEvents();
}

// Update loop
function update() { foreachscene.updateAppearance(); worm.updateBodyPositions(); }

// Event handlers
function updateMouseTarget(event) {
	let angleFromCenter = Math.atan2(
		event.point.y - paper.view.size.height,
		event.point.x - paper.view.size.width / 2
	);
	game.mouse.target.position.x = paper.view.size.width / 2 + Math.cos(angleFromCenter) * game.motion.segmentLength;
	game.mouse.target.position.y = paper.view.size.height + Math.sin(angleFromCenter) * game.motion.segmentLength;
}

function resize() {
	game.motion.segmentLength = calculateSegmentLength();
	game.structure.particles[0].position.x = paper.view.size.width / 2;
	game.structure.particles[0].position.y = paper.view.size.height + game.motion.segmentLength;
	game.mouse.target.position.x = paper.view.size.width / 2;
	game.mouse.target.position.y = paper.view.size.height - game.motion.segmentLength;
}

function updatePathPoints() {
	worm.updatePathPoints();
}

// Utilities
function calculateSegmentLength() {
	return paper.view.size.height / game.config.worm.dimensions.bodySegmentCount * 0.7;
}

// Expose globally
window.game = game;