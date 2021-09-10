"use strict";
/**
 * The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
 * With strict mode, you can not, for example, use undeclared variables.
 * https://www.w3schools.com/js/js_strict.asp
 */

// Globale variabler:

// Vertex shader program
let VSHADER_SOURCE =
  "attribute vec3 a_Position;\n" +  //Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
  "uniform mat4 u_modelviewMatrix;\n" +
  "uniform mat4 u_projectionMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position, 1.0);\n" +
  "}\n";

// Fragment shader program
let FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" + 	// bruker prefiks u_ for � indikere uniform
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" + // Fargeverdi.
  "}\n";

let gl = null;
let canvas = null;

// Verteksbuffer:
let vertexBuffer = null;

// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;

// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

//Animasjon:
let angle = 0;

function main() {
	if (!initContext())
		return false;

	// Initialiserer matriser:
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

	// Initialiser shadere (cuon-utils):
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Feil ved initialisering av shaderkoden.");
		return false;
	}

	// Binder shaderparametre:
	if (!initUniforms()) {
		console.log("Feil ved binding av shaderparametre.");
		return false;
	}

	// Initialiserer verteksbuffer:
	initBuffer();

	// Setter bakgrunnsfarge:
	gl.clearColor(0.3, 0.5, 0.4, 1.0); //RGBA

	// Tegn!
	draw();
}

function initContext() {
	// Hent <canvas> elementet
	canvas = document.getElementById("webgl");
	// Rendering context for WebGL:
	gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("Fikk ikke tak i rendering context for WebGL");
		return false;
	}
	return true;
}

function initBuffer() {
	// 3 stk 3D vertekser:
	let triangleVertices = new Float32Array([
       -10, -10, 0,
       0, 10, 0,
       10, -10, 0
    ]);

	// Verteksbuffer:
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

	vertexBuffer.itemSize = 3; 				// NB! Setter itemSize knyttet til vertexBuffer.
	vertexBuffer.numberOfItems = 3; 		// NB!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!
}

function initUniforms() {
	// Kopler shaderparametre med Javascript-variabler:

	// Farge: u_FragColor (bruker samme farge p� alle piksler/fragmenter):
	let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (u_FragColor < 0) {
		console.log("Fant ikke uniform-parametret u_FragColor i shaderen!?");
		return false;
	}
	let rgba = [ 0.3, 0.5, 1.0, 1.0 ];
	gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

	// Matriser: u_modelviewMatrix & u_projectionMatrix
	u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
	u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");

	return true;
}

function draw(currentTime) {

	//Sørger for at draw kalles på nytt:
	window.requestAnimationFrame(draw);

	//Tar IKKE hensyn til varierende frame rate:
    angle += 1; 	//Fast endring per frame.
	angle = angle % 360;	//angle settes tilbake til 0 n�r den bikker 360.

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Posisjon: a_Position
	let a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Definerer modellmatrisa (rotasjon + translasjon):
	modelMatrix.setRotate(angle, 0, 0, 1);

	// Definerer en viewmatrise (kamera):
	// cuon-utils: Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
	viewMatrix.setLookAt(0, 0, 100, 0, 0, 0, 0, 1, 0);

	// Slår sammen modell & view til modelview-matrise:
	modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!

	// Definerer en projeksjonsmatrise (frustum):
	// cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
	projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 100);

	// Sender matriser til shader:
	gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

	// Tegner trekanten:
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}
