// HelloPoint1.js
// Tegner et punkt...

// Vertex shader program
let VSHADER_SOURCE =
   `void main() {
  gl_Position = vec4(-0.5, -0.3, 0.0, 1.0);
  gl_PointSize = 40.0;
}
`;

// Fragment shader program
let FSHADER_SOURCE =
   "void main() {\n" +
   "  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" + // Fargeverdi.
   "}\n";

function main() {
	// Hent <canvas> elementet
	let canvas = document.getElementById("webgl");

	// Rendering context for WebGL:
	let gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("Fikk ikke tak i rendering context for WebGL");
		return;
	}
	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Feil ved initialisering av shaderkoden.");
		return;
	}

	// Set the color for clearing <canvas>
	gl.clearColor(0.0, 0.3, 0.4, 1.0);
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tegner et punkt:
	gl.drawArrays(gl.POINTS, 0, 1);
}
