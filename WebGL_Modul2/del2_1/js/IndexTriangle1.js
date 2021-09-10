"use strict";

/**
 * Bruker ET buffer til både posisjon og farge:
 * Tegner indeksert vha. drawElements()
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
let indexBuffer;
let indices;

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

function initBuffers(gl) {
	//4 stk 3D vertekser (pos+farge):
	let vertices = new Float32Array([
		-0.5, 0.5, 0.0, 1.0, 0.0, 0.0, 1.0,		//0: x,y,z, RgbA
		-0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0,	//1: x,y,z, rGbA
		0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0,		//2: x,y,z, rgBA
		0.5, 0.5, 0.0, 0.0, 0.0, 1.0, 1.0		//3: x,y,z, rgBA
	]);

	indices = new Uint16Array([
		0, 1, 2, //tre indekser per trekant. Begge spesifisert mot klokka.
		2, 3, 0
	]);

	//Verteksbufret: oppretter, binder og skriver data til bufret:
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	//Indeksbuffer: oppretter, binder og skriver data til bufret:
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
	return true;
}

function draw() {
	//BackfaceCulling:
	gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	// Kopler posisjonsparametret til bufferobjektet:
	let a_Position = gl.getAttribLocation(gl.program, "a_Position");
	// 3=ant. Floats per verteks
	//let STRIDE = (POSITION_COMPONENT_COUNT + COLOR_COMPONENT_COUNT) * BYTES_PER_FLOAT;
	//Stride = antall bytes som hver verteks opptar (pos+color).
	let stride = (3 + 4) * 4;
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);

	// Kopler fargeparametret til bufferobjektet: 4=ant. Floats per verteks
	let a_Color = gl.getAttribLocation(gl.program, "a_Color");
	let colorOfset = 3 * 4; //12= offset, start p� color-info innafor verteksinfoen.
	gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);
	gl.enableVertexAttribArray(a_Color);

	// Tegner en firkant vha. indekser:
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
