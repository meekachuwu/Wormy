/*
	ToDo:
	- [x] Make run locally without need for server (no serverside code)
	- [ ] Use Object-Oriented programming to fullest extent
	- [ ] Use PaperJS for eyes
	- [ ] Move constants to config file
*/

paper.install(window);

window.onload = async function() {
	var wormConfiguration = await window.loadWormConfiguration();
	var wormApplication = new WormApplication(wormConfiguration);
	wormApplication.initialize();
};