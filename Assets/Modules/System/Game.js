"use strict";

class Game {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.config = {
			worm: {
				size: 1,
				color: { body: "black", mouth: "black", tongue: "crimson", eyes: "white" },
				proportions: { fat: 250, eyes: 20, body: 8, mouth: 4, tongue: 2 }
			},
			physics: { tick: 16, gravity: [0, 0.1], drag: 0.98 }
		};
		this.worm = null;
		this.mouseX = 0;
		this.mouseY = 0;
		this.running = false;
	}

	init() {
		this.canvas = document.getElementById("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.resizeCanvas();
		
		this.worm = new Worm(this.config);
		this.worm.init(this.canvas.width / 2, this.canvas.height * 0.8);
		
		this.running = true;
		this.setupEventListeners();
		this.animate();
	}

	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	setupEventListeners() {
		window.addEventListener("mousemove", (e) => {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
			this.worm.setTarget(this.mouseX, this.mouseY);
		});

		window.addEventListener("resize", () => {
			this.resizeCanvas();
		});
	}

	animate() {
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.worm.update(this.canvas.width, this.canvas.height);
		this.worm.render(this.ctx);

		requestAnimationFrame(() => this.animate());
	}
}

window.Game = Game;
