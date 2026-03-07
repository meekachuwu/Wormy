

// Intiate
paper.install(window);
window.onload = function() {
	let canvas = document.getElementById("canvas");
	paper.setup(canvas);

	let path = new paper.Path();
	let amplitude = 20;      // Controls how wide the wiggles are
	let segmentLength = 10;  // Distance between path segments
	let yStart = paper.view.center.y; // Start at the middle of the canvas
	path.smooth(); // Make the path curvy
	path.strokeColor = 'black';

	// Construct the wiggling path
	path.moveTo(new paper.Point(paper.view.center.x, yStart));
	for (i=0; i<=300; i++) {
		let x = paper.view.center.x + amplitude * Math.sin(i/10); 
		let y = yStart + i * segmentLength; 
		path.lineTo(new paper.Point(x,y));
	}
}