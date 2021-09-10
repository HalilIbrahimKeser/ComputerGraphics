"use strict";

// Vertex shader program
let  VSHADER_SOURCE =
    "attribute vec3 a_Position;\n" +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
    "uniform mat4 u_modelviewMatrix;\n" +
    "uniform mat4 u_projectionMatrix;\n" +
    "void main() {\n" +
    "  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n" +
    "  gl_PointSize = 4.0;\n" +
    "}\n";

// Fragment shader program
let  FSHADER_SOURCE =
    "precision mediump float;\n" +
    "uniform vec4 u_FragColor;\n" + 	// bruker prefiks u_ for å indikere uniform
    "void main() {\n" +
    "  gl_FragColor = u_FragColor;\n" + // Fargeverdi.
    "}\n";

// Andre globale variabler:
let gl = null;
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

function main() {
    init();

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Feil ved initialisering av shaderkoden.");
        return;
    }

    // Initialiserer verteksbuffer:
    initBuffers();

    // Binder shaderparametre:
    if (!initUniforms())
        return;

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
    gl.clearColor(0.3, 0.0, 0.4, 1.0); //RGBA
}

/**
 * Oppretter og fyller posisjonsbuffer.
 *
 */
function initBuffers() {
    // 3 stk 3D vertekser:
    let trianglePositions = new Float32Array([   //NB! ClockWise!!
        -10, -10, 0, //0
        0, -5, 0,
        10, -8, 0,
        -1, -8, 0,
        3, 4, 0,
        7, -6, 0,
        -15, -10, 0,
        0, 5, 0,
        10, -7, -5,
        2, 5, 0,
        5, -7, -5, //10

        -25, 9, 0, //11 triangle
        -25, -15, 0,
        -10, 8, -2,

        -26, 11, 0, //14 line
        -29, -16, 0,

        -30, -25, 0, //16 line
        6, -20, 0,

        -15, -25, 0, //18 LINE_STRIP
        6, -10, 0,
        8, -15, 0,
        -15, -25, 0,

        -8, -25, 0, //22 TRIANGLE_STRIP
        -6, -10, 0,
        -9, -15, 0,

        -15, -20, 0,
        -12, -22, 0,

        -9, -30, 0,
        -15, -29, 0,

        -12, -18, 0,
        -12, -17, 0, //30


    ]);

    // Verteksbuffer:
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trianglePositions, gl.STATIC_DRAW);

    positionBuffer.itemSize = 3; // NB!!
    positionBuffer.numberOfItems = 3; // NB!!

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * Kopler ev. uniformvariabler.
 * @returns {boolean}
 */
function initUniforms() {
    // Farge: u_FragColor (bruker samme farge på alle piksler/fragmenter):
    let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (u_FragColor < 0) {
        console.log("Fant ikke uniform-parametret u_FragColor i shaderen!?");
        return false;
    }
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");
    return true;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // BackfaceCulling:
    /*
	gl.frontFace(gl.CW);		//indikerer at trekanter med vertekser angitt i CW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.
    */

    // Binder først til aktuelt buffer:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Kopler til shaderattributter:
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    modelMatrix.scale(2, 2, 2);
    modelMatrix.translate(10, 10, 4);

    let  eyeX=40, eyeY=0, eyeZ=100;
    let  lookX=0, lookY=0, lookZ=0;
    let  upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 80, 1000);

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.POINTS, 0, 10);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 11, positionBuffer.numberOfItems);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.LINES, 14, 4);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.LINE_STRIP, 18, 4);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 22, 8);


    // //Tegner samme trekant på nytt, men med annen transformasjon:
    // modelMatrix.setTranslate(-10, -5, 0);
    // modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    // gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    // gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numberOfItems);

    // //... og på nytt:
    // modelMatrix.setTranslate(-13, -13, 4);
    // modelMatrix.rotate(33, 0, 0, 1);
    // modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    // gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    // gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numberOfItems);
}
