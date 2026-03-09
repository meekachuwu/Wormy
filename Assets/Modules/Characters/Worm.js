"use strict";

class Worm {
	constructor(settings) {
		this.settings = settings;
		const size = settings.worm?.size ?? 1;
		const proportions = settings.worm?.proportions ?? {};
		this.dimensions = {
			size: size,
			thickness: (proportions.fat ?? 300) * size,
			body: { segments: Math.max(3, Math.round((proportions.body ?? 10) * size)) },
			mouth: { points: Math.max(2, Math.round((proportions.mouth ?? 5) * size)) },
			tongue: { points: Math.max(1, Math.round((proportions.tongue ?? proportions.toungue ?? 2) * size * 0.3)) }
		};
		this.color = {
			body: settings.worm?.color?.body ?? "black",
			mouth: settings.worm?.color?.mouth ?? "black",
			tongue: settings.worm?.color?.tongue ?? "crimson",
			eyes: settings.worm?.color?.eyes ?? "red"
		};
		this.behavior = { smooth: settings.worm?.options?.smooth ?? true, rainbow: settings.worm?.options?.rainbow ?? true, stress: { limit: settings.worm?.behavior?.peak ?? 100 } };
		this.animation = { stress: { easing: settings.ease?.stress ?? 0.01 } };
		this.eyes = { left: null, right: null };
		this.path = { body: null, mouth: null, tongue: null, list: [] };
		this.motion = null;
		this.mouse = null;
		this.structure = null;
		this.physics = null;
	}

	create() {
		this.path.body = new Noodle(this.color.body, this.dimensions.thickness);
		this.path.mouth = new Noodle(this.color.mouth, this.dimensions.thickness / 12);
		this.path.tongue = new Noodle(this.color.tongue, this.dimensions.thickness / 18);
		this.path.body.add(this.dimensions.body.segments);
		this.path.mouth.add(this.dimensions.mouth.points);
		this.path.tongue.add(this.dimensions.tongue.points);
		this.path.list = [this.path.body.path, this.path.mouth.path, this.path.tongue.path];

		this.eyes.left = new Eye(this.settings, this.dimensions.thickness, "left");
		this.eyes.right = new Eye(this.settings, this.dimensions.thickness, "right");
		this.eyes.left.create();
		this.eyes.right.create();
	}

	build() {
		for (let index = 0; index < this.dimensions.body.segments; index++) {
			const x = paper.view.size.width / 2;
			const y = paper.view.size.height - (index - 1) * this.motion.segment.length;
			const particle = this.physics.system.makeParticle(2.5, x, y, 0);
			const upper = this.physics.system.makeParticle(1, x, y - this.motion.segment.length, 0);
			const lower = this.physics.system.makeParticle(1, x, y + this.motion.segment.length, 0);

			switch (true) {
				case index > 0:
					this.physics.system.makeSpring(particle, this.structure.support.upper[index - 1], 0.6, 0.48, 0);
					this.physics.system.makeSpring(this.structure.particles[index - 1], lower, 0.3, 0.7, 0);
					this.structure.springs.push(this.physics.system.makeSpring(particle, this.structure.particles[index - 1], 0.2, 0.1, this.motion.segment.length));
					break;
				default:
					break;
			}

			switch (true) {
				case index < 2:
					particle.makeFixed();
					break;
				default:
					break;
			}

			upper.makeFixed();
			lower.makeFixed();
			this.structure.particles.push(particle);
			this.structure.support.upper.push(upper);
			this.structure.support.lower.push(lower);
		}
	}

	updatebody() {
		this.mouse.updateposition();
		this.structure.particles[1].position.x = this.mouse.position.x;
		this.structure.particles[1].position.y = this.mouse.position.y;

		let stress = 0;
		for (let index = 1; index < this.dimensions.body.segments; index++) {
			const current = this.structure.particles[index];
			const previous = this.structure.particles[index - 1];
			const angle = Math.atan2(current.position.y - previous.position.y, current.position.x - previous.position.x);
			const upper = this.structure.support.upper[index];
			const lower = this.structure.support.lower[index];

			upper.position.x = current.position.x + Math.cos(angle) * this.motion.segment.length;
			upper.position.y = current.position.y + Math.sin(angle) * this.motion.segment.length;
			lower.position.x = current.position.x + Math.cos(Math.PI + angle) * this.motion.segment.length;
			lower.position.y = current.position.y + Math.sin(Math.PI + angle) * this.motion.segment.length;
			this.path.body.path.segments[index].angle = angle;

			switch (true) {
				case index > 1:
					stress += current.force.length();
					break;
				default:
					break;
			}
		}

		this.motion.stress.level += (stress - this.motion.stress.level) * this.animation.stress.easing;
		const segment = this.path.body.path.segments[this.dimensions.body.segments - 3];
		this.eyes.left.draw(segment);
		this.eyes.right.draw(segment);
	}

	updateappearance() {
		this.eyes.left.updateblink();
		this.eyes.right.updateblink();

		switch (true) {
			case this.motion.stress.level > this.behavior.stress.limit:
				this.peakon();
				break;
			default:
				this.peakoff();
				break;
		}
	}

	peakon() {
		switch (true) {
			case this.behavior.rainbow:
				this.motion.hue.value = Math.round((this.motion.hue.value + 1)) % 360;
				this.path.body.path.strokeColor = "hsl(" + this.motion.hue.value + ", 100%, 40%)";
				this.path.mouth.path.strokeColor = "hsl(" + this.motion.hue.value + ", 100%, 10%)";
				this.path.tongue.path.strokeColor = "hsl(" + this.motion.hue.value + ", 100%, 60%)";
				this.eyes.left.setcolor("hsl(" + this.motion.hue.value + ", 100%, 50%)");
				this.eyes.right.setcolor("hsl(" + this.motion.hue.value + ", 100%, 50%)");
				break;
			default:
				break;
		}

		switch (true) {
			case !this.motion.peak.active:
				this.motion.peak.active = true;
				document.body.className = "fadeIn";
				this.physics.setpeak(true);
				this.path.mouth.path.opacity = 0.5;
				this.path.tongue.path.opacity = 0.5;
				break;
			default:
				break;
		}

		this.path.mouth.path.strokeWidth = this.dimensions.thickness / 1.5 + Math.random() * 10;
		this.path.tongue.path.strokeWidth = this.path.mouth.path.strokeWidth * 0.65;
	}

	peakoff() {
		switch (true) {
			case this.motion.peak.active:
				this.motion.peak.active = false;
				document.body.className = "fadeOut";
				this.path.body.path.strokeColor = this.color.body;
				this.physics.setpeak(false);
				this.path.mouth.path.opacity = 0;
				this.path.tongue.path.opacity = 0;
				this.eyes.left.setcolor(this.color.eyes);
				this.eyes.right.setcolor(this.color.eyes);
				break;
			default:
				break;
		}
	}

	updatepath() {
		for (let index = 0; index < this.dimensions.body.segments; index++) {
			const current = this.structure.particles[index];
			const angle = this.path.body.path.segments[index].angle + Math.PI;
			this.path.body.set(index, current.position.x, current.position.y);

			const mouthindex = index - 1;
			switch (true) {
				case mouthindex >= 0 && mouthindex < this.path.mouth.path.segments.length:
					this.path.mouth.set(
						mouthindex,
						current.position.x + Math.cos(angle) * this.dimensions.thickness / 12,
						current.position.y + Math.sin(angle) * this.dimensions.thickness / 12
					);
					break;
				default:
					break;
			}

			switch (true) {
				case mouthindex >= 0 && mouthindex < this.path.tongue.path.segments.length:
					this.path.tongue.set(
						mouthindex,
						this.path.mouth.path.segments[mouthindex].point.x - Math.cos(angle) * (this.path.mouth.path.strokeWidth / 12),
						this.path.mouth.path.segments[mouthindex].point.y - Math.sin(angle) * (this.path.mouth.path.strokeWidth / 12)
					);
					break;
				default:
					break;
			}
		}

		this.path.body.smooth(this.behavior.smooth);
		this.path.mouth.smooth(this.behavior.smooth);
		this.path.tongue.smooth(this.behavior.smooth);
	}
}

window.Worm = Worm;
