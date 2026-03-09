"use strict";

class Scene {
	constructor() {
		this.size = { width: 0, height: 0 };
		this.background = { color: "white" };
	}

	create() {
		this.size.width = paper.view.size.width;
		this.size.height = paper.view.size.height;
	}

	resize() {
		this.size.width = paper.view.size.width;
		this.size.height = paper.view.size.height;
	}
}

window.Scene = Scene;
