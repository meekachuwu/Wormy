class Noodle {	// Shape to be used for worm body, mouth, & toungue.  A noodly like shape built out of segments.
	constructor() {
		this["position"]	= new Position(0, 0);
		this["length"]		= null;
		this["color"]			= null;
		this["thickness"]	= null;

		this.structure = { segments: [], particles: [], support: { upper: [], lower: [] }, springs: [] };
	}

	create() {
		for (let i = 0; i < this.length; i++) {
			let position = {};
			position.x = paper.view.size.width / 2;
			position.y = paper.view.size.height + i * this.motion.segmentLength;

			let particle = {};
			particle.body = this.physics.system.makeParticle(2.5, position.x, position.y, 0);

			let support = {};
			support.upper = this.physics.system.makeParticle(1, position.x, position.y - this.motion.segmentLength, 0);
			support.lower = this.physics.system.makeParticle(1, position.x, position.y + this.motion.segmentLength, 0);

			if (i > 0) {
				let previous = {};
				previous.upper = this.structure.support.upper[i - 1];
				previous.body = this.structure.particles[i - 1];

				this.physics.system.makeSpring(particle.body, previous.upper, 0.6, 0.48, 0);
				this.physics.system.makeSpring(previous.body, support.lower, 0.3, 0.7, 0);
				this.structure.springs.push(this.physics.system.makeSpring(particle.body, previous.body, 0.2, 0.1, this.motion.segmentLength));
			}

			if (i < 2) { particle.body.makeFixed(); }
			support.upper.makeFixed(); support.lower.makeFixed();

			this.structure.particles.push(particle.body);
			this.structure.support.upper.push(support.upper);
			this.structure.support.lower.push(support.lower);
			this.segments.push(new paper.Point());
		 }

		 update() {
			let easing = this.interaction.mouseTargetEasing;
			this.mouse.position.x += (this.mouse.target.position.x - this.mouse.position.x) * easing;
			this.mouse.position.y += (this.mouse.target.position.y - this.mouse.position.y) * easing;
			
			this.structure.particles[1].position.x = this.mouse.position.x;
			this.structure.particles[1].position.y = this.mouse.position.y;
		}

	draw() {
		for (let i = 0; i < this.length; i++) {
			this.segments[i].x = this.structure.particles[i].position.x;
			this.segments[i].y = this.structure.particles[i].position.y;
		}
	}
}