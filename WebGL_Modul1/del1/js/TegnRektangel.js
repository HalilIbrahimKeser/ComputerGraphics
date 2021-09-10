// TegnRektangel.js
//
function main() {
	// Henter <canvas> elementet:
	let canvas = document.getElementById("eksempel_1");
	if (!canvas) {
	 console.log("Fikk ikke hentet <canvas> elementet");
	 return;
	}

	// RenderingContext for 2D
	let ctx = canvas.getContext("2d");
	// Tegner et blått rektangel:
	ctx.fillStyle = "rgba(0, 0, 255, 1.0)"; // Bruk blå farge
	ctx.fillRect(0, 0, 150, 150); // Fylt rektangel
}
