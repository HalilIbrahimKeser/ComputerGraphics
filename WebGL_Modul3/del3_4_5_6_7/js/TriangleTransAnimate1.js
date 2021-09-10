"use strict";

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
  "uniform vec4 u_FragColor;\n" + 	// bruker prefiks u_ for å indikere uniform
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" + // Fargeverdi.
  "}\n";

let gl = null;
let canvas = null;

// Verteksbuffer:
let vertexBuffer = null;

// "Pekere" som brukes til � sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;

// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

//Animasjon:
let angle = 0;
let lastTime = 0;

function main() {

	if (!init())
		return;

	// Initialiser shadere (cuon-utils):
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Feil ved initialisering av shaderkoden.");
		return;
	}

	// Initialiserer verteksbuffer:
	initBuffer();

	// Binder shaderparametre:
	if (!initUniforms())
		return;

	// Setter bakgrunnsfarge:
	gl.clearColor(0.3, 0.5, 0.4, 1.0); //RGBA

	// Tegn!
	draw();
}

function init() {
	// Hent <canvas> elementet
	canvas = document.getElementById("webgl");

	// Rendering context for WebGL:
	gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("Fikk ikke tak i rendering context for WebGL");
		return false;
	}

	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

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

	vertexBuffer.itemSize = 3; // NB!!
	vertexBuffer.numberOfItems = 3; // NB!!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
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

	//S�rger for at draw kalles p� nytt:
	requestAnimationFrame(draw);

	if (currentTime == undefined) {
		currentTime = Date.now(); //udefinert f�rste gang.
	}

	//Tar h�yde for varierende frame rate:
	let elapsed = 0;
	if (lastTime != 0)
      elapsed = currentTime - lastTime;
    lastTime = currentTime;
    angle += elapsed / 10;
	angle %= 360;

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Posisjon: a_Position
	let a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Definerer modellmatrisa (rotasjon + translasjon):
	modelMatrix.setTranslate(-20, 10, 0);
	modelMatrix.rotate(angle, 0, 0, 1);

	// Definerer en viewmatrise (kamera):
	// cuon-utils: Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
	viewMatrix.setLookAt(0, 0, 100, 0, 0, 0, 0, 1, 0);

	// Sl�r sammen modell & view til modelview-matrise:
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

