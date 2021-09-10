// ColorPoin1.js

// Vertex shader program
// NB! Legg merke til bruk av spesialenkeltapostrof (alt+´)
let VSHADER_SOURCE = `
   attribute vec4 a_Position;
   attribute float a_PointSize;
   void main() {
     gl_Position = a_Position;
     gl_PointSize = a_PointSize;
   }`;

// Fragment shader program
// bruker prefiks u_ for å indikere uniform
let FSHADER_SOURCE = `
   precision mediump float;
   uniform vec4 u_FragColor;
   void main() {
     gl_FragColor = u_FragColor;
   }`;

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

	// Get the storage location of attribute variable
	let a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		console.log("Fant ikke parametret a_Position i shaderen!?");
		return;
	}
	let a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
	if (a_PointSize < 0) {
		console.log("Fant ikke parametret a_PoinSize i shaderen!?");
		return;
	}
	let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (u_FragColor < 0) {
		console.log("Fant ikke uniform-parametret u_FragColor i shaderen!?");
		return;
	}

	// Send vertexposisjonen til parametret a_Position i shaderen:
	gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
	gl.vertexAttrib1f(a_PointSize, 50.0);
	let rgba = [1.0, 1.0, 0.0, 1.0];
	gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);

	// Set the color for clearing <canvas>
	gl.clearColor(0.0, 7.0, 0.4, 1.0);
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tegner et punkt:
	gl.drawArrays(gl.POINTS, 0, 1);
}
