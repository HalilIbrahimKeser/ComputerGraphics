"use strict";

/**
 * Bruker ET buffer til både posisjon og farge:
 *
 */

// Verteksshader:
let VSHADER_SOURCE =
   "attribute vec4 a_Position;\n" +		// Innkommende verteksposisjon.
   "attribute vec4 a_Color;\n" +		// Innkommende verteksfarge.
   "varying vec4 v_Color;\n" +			// NB! Bruker varying.
   "void main() {\n" +
   "  gl_Position = a_Position;\n" + 	// Posisjon.
   "  v_Color = a_Color;\n" + 			// NB! Setter varying = innkommende verteksfarge.
   "}\n";

// Fragmentshader:
let FSHADER_SOURCE =
   "precision mediump float;\n" +
   "varying vec4 v_Color;\n" +			// NB! Interpolert fargeverdi.
   "void main() {\n" +
   "  gl_FragColor = v_Color;\n" + 		// Setter gl_FragColor = Interpolert fargeverdi.
   "}\n";

// Andre globale variabler:
let gl;
let vertexBuffer;

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
	let canvas = document.getElementById("webgl");
	// Rendering context for WebGL:
	gl = canvas.getContext("webgl");
	if (!gl)
		console.log("Fikk ikke tak i rendering context for WebGL");
	// Setter bakgrunnsfarge:
	gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA
}

function initBuffers() {
	//3 stk 3D vertekser bestående av posisjon og farge:
	let vertices = new Float32Array([
		0.0, 0.5, 0.0, 1.0, 0.0, 0.0, 1.0, 		//x,y,z, RgbA
		-0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0,	//x,y,z, rGbA
		0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0		//x,y,z, rgBA
	]);

	//Oppretter verteksbuffer: binder og skriver data til bufret:
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	//Setter antall floats per verteks og antall vertekser i dette bufret:
	vertexBuffer.itemSize = 7; // NB!!
	vertexBuffer.numberOfItems = vertices.length / 7; // NB!!

	//Kopler fra bufret:
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
	return true;
}

function draw() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	// BackfaceCulling:
	gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

	// Kopler til shaderparametre, må først binde til aktuelt buffer:
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Kopler posisjonsparametret til bufferobjektet: 3=antall floats per verteks.
	let a_Position = gl.getAttribLocation(gl.program, "a_Position");
	let stride = (3 + 4) * 4;  // Dvs. antall bytes som hver verteks opptar (pos+color). 4 byte per float.
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);

	// Kople fargeparametret til bufferobjektet: 4=ant. Floats per verteks
	let a_Color = gl.getAttribLocation(gl.program, "a_Color");
	let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
	gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);
	gl.enableVertexAttribArray(a_Color);

	// Tegner en trekant:
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}
