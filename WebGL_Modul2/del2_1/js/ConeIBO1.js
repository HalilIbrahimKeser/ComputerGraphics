"use strict";

// Vertex shader program
let VSHADER_SOURCE =
	"attribute vec3 a_Position;\n" +
	"uniform mat4 u_modelviewMatrix;\n" +
	"uniform mat4 u_projectionMatrix;\n" +
	"void main() {\n" +
	"  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n" +
	"}\n";

// Fragment shader program
let FSHADER_SOURCE =
	"precision mediump float;\n" +
	"uniform vec4 u_FragColor;\n" +
	"void main() {\n" +
	"  gl_FragColor = u_FragColor;\n" + // Fargeverdi.
	"}\n";

//Globale variabler:
let gl;
let canvas = null;
let positionBuffer = null;

// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;
// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null; //sammenslått modell- og viewmatrise.
let projectionMatrix = null;


let vertexBuffer;
let coneIndices;
let indexBuffer;

function main() {
	init();

	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Feil ved initialisering av shaderkoden.");
		return;
	}
	// Binder shaderparametre:
	if (!initUniforms())
		return;
	//Initialiserer verteksbuffer:
	initBuffers(gl);
	draw();
}

/**
 * Initialisering og oppstart.
 */
function init() {
	// Hent <canvas> elementet
	canvas = document.getElementById("webgl");
	// Rendering context for WebGL:
	gl = canvas.getContext("webgl");
	if (!gl)
		console.log("Fikk ikke tak i rendering context for WebGL");

	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

	// Setter bakgrunnsfarge:
	gl.clearColor(0.0, 1.0, 0.4, 1.0);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
	//Kopler farge:
	let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (u_FragColor < 0) {
		console.log("Fant ikke uniform-parametret u_FragColor i shaderen!?");
		return false;
	}
	let rgba = [0.3, 0.5, 1.0, 1.0];
	gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

	// Matriser: u_modelviewMatrix & u_projectionMatrix
	u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
	u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");

	return true;
}

//NB! Legg merke til kall på bindBuffer(..., null)
function initBuffers(gl) {
	//n stk 3D vertekser:
	let coneVertices = new Float32Array([
		0.75, 0, 0,
		-0.75, 0.5, 0,
		-0.75, 0.4045085, 0.2938925,
		-0.75, 0.1545085, 0.4755285,
		-0.75, -0.1545085, 0.4755285,
		-0.75, -0.4045085, 0.2938925,
		-0.75, -0.5, 0.0,
		-0.75, -0.4045085, -0.2938925,
		-0.75, -0.1545085, -0.4755285,
		-0.75, 0.1545085, -0.4755285,
		-0.75, 0.4045085, -0.2938925
	]);
	//Indekser som utgjår en Cone:
	coneIndices = new Uint16Array([
		0, 1, 2,
		0, 2, 3,
		0, 3, 4,
		0, 4, 5,
		0, 5, 6,
		0, 6, 7,
		0, 7, 8,
		0, 8, 9,
		0, 9, 10,
		0, 10, 1
	]);

	// Verteksbuffer:
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, coneVertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Setter antall floats per verteks og antall vertekser i dette bufret:
	vertexBuffer.itemSize = 3;
	vertexBuffer.numberOfItems = coneVertices.length / 3;

	//Indeksbuffer:
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, coneIndices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	indexBuffer.numberOfItems = coneIndices.length;
}

function draw() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	// BackfaceCulling:
	gl.frontFace(gl.CW);		//indikerer at trekanter med vertekser angitt i CW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.


	//Kopler shadervariabler:
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	let a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);


	// Definerer modellmatrisa:
	modelMatrix.setIdentity();
	modelMatrix.scale(40, 40, 40);
	modelMatrix.translate(0, 0, 0);

	let  eyeX=0, eyeY=0, eyeZ=100;
	let  lookX=0, lookY=0, lookZ=0;
	let  upX=0, upY=1, upZ=0;
	viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

	// Slår sammen modell & view til modelview-matrise:
	modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
	projectionMatrix.setPerspective(45, canvas.width / canvas.height, 100, 600);

	// Sender matriser til shader:
	gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);


	// Tegner firkanten vha. indeksbuffer og drawElements():
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.LINE_LOOP, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
}
