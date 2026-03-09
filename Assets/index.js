"use strict";

paper.install(window);

const game = new Game();

window.onload = async function () {
	await game.load();
	game.start();
};

window.game = game;
