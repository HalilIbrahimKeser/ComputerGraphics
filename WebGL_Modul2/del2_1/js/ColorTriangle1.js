"use strict";
/**
 * Bruker to buffer, et for farge og et for posisjon.
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
let positionBuffer;
let colorBuffer;

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
    initBuffers();

    // Setter bakgrunnsfarge:
    gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA

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
}

/**
 * Fyller verteksbuffer med posisjon og farge.
 */
function initBuffers() {
    //3 stk 3D vertekser:
    let positions = new Float32Array([
        0.0, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0]);

    //Farge til verteksene:
    let colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,		//Rød  (RgbA)
        0.0, 1.0, 0.0, 1.0,		//Grønn (rGbA)
        0.0, 0.0, 1.0, 1.0]);	//Blå 	(rgBA)

    //POSISJONSBUFRET: oppretter, binder og skriver data til bufret:
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    //Setter antall floats per verteks og antall vertekser i dette bufret:
    positionBuffer.itemSize = 3;
    positionBuffer.numberOfItems = positions.length / 3;

    //COLORBUFRET: oppretter, binder og skriver data til bufret:
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    //Setter antall floats per verteks og antall vertekser i dette bufret:
    colorBuffer.itemSize = 4; // NB!!
    colorBuffer.numberOfItems = colors.length / 4; // NB!!

    // Kople fra.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
    return true;
}

/**
 * Tegner.
 */
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    // Kople posisjonsparametret til bufferobjektet: positionBuffer.itemSize = antall floats per verteks (her 3).
    gl.vertexAttribPointer(a_Position, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    // Kople posisjonsparametret til bufferobjektet: 4=ant. Floats per verteks
    gl.vertexAttribPointer(a_Color, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numberOfItems);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
