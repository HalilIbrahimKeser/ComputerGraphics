"use strict";

let  VSHADER_SOURCE =
    "attribute vec4 a_Position;\n" +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
    "attribute vec4 a_Color;\n" +

    "varying lowp vec4 v_Color;\n" +
    "uniform mat4 u_modelviewMatrix;\n" +
    "uniform mat4 u_projectionMatrix;\n" +
    "void main() {\n" +
    "  v_Color = a_Color;\n" +
    "  gl_Position = u_projectionMatrix * u_modelviewMatrix * a_Position;\n" +
    "}\n";

let  FSHADER_SOURCE =
    "precision mediump float;\n" +
    "varying lowp vec4 v_Color;\n" + 	// bruker prefiks u_ for å indikere uniform
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" + // Fargeverdi.
    "}\n";

let gl = null;
let canvas = null;
let positionBuffer = null;

let u_modelviewMatrix = null;
let u_projectionMatrix = null;

let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null; //sammenslått modell- og viewmatrise.
let projectionMatrix = null;

let vertexBuffer;
let coneIndices;
let indexBuffer;

function main() {
    init();

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
}

function initBuffers() {
    let positions = new Float32Array([   //NB! ClockWise!!
        // Front face
        -1.0, -1.0,  1.0,         // 0
        1.0, -1.0,  1.0,          // 1
        1.0,  1.0,  1.0,          // 2
        -1.0,  1.0,  1.0,         // 3

        // Back face
        -1.0, -1.0, -1.0,         // 4
        -1.0,  1.0, -1.0,         // 5
        1.0,  1.0, -1.0,          // 6
        1.0, -1.0, -1.0,          // 7

        // Top face
        -1.0,  1.0, -1.0,         // 8
        -1.0,  1.0,  1.0,         // 9
        1.0,  1.0,  1.0,          // 10
        1.0,  1.0, -1.0,          // 11

        // Bottom face
        -1.0, -1.0, -1.0,         // 12
        1.0, -1.0, -1.0,          // 13
        1.0, -1.0,  1.0,          // 14
        -1.0, -1.0,  1.0,         // 15

        // Right face
        1.0, -1.0, -1.0,          // 16
        1.0,  1.0, -1.0,          // 17
        1.0,  1.0,  1.0,          // 18
        1.0, -1.0,  1.0,          // 19

        // Left face
        -1.0, -1.0, -1.0,         // 20
        -1.0, -1.0,  1.0,         // 21
        -1.0,  1.0,  1.0,         // 22
        -1.0,  1.0, -1.0,         // 23


    ]);

    // Verteksbuffer:
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const faceColors = [
        [0.3,  0.2,  0.9,  1.0],    // Front face
        [0.3,  0.2,  0.9,  1.0],    // Back face
        [0.3,  0.2,  0.9,  1.0],    // Top face
        [0.3,  0.2,  0.9,  1.0],    // Bottom face
        [0.3,  0.2,  0.9,  1.0],    // Right face
        [0.3,  0.2,  0.9,  1.0],    // Left face
    ];

    let colors = [];
    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function initUniforms() {
    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");
    return true;
}

function draw() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque

    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // BackfaceCulling:
	gl.frontFace(gl.CW);		//indikerer at trekanter med vertekser angitt i CW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

    //POSITION
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    //COLOR
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Definerer modellmatrisa:
    modelMatrix.setIdentity();
    modelMatrix.scale(10, 10, 10);
    modelMatrix.translate(0, 0, 0);

    let  eyeX=4, eyeY=4, eyeZ=6;
    let  lookX=0, lookY=0, lookZ=0;
    let  upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);

    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 0.1, 100);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 36, gl.UNSIGNED_SHORT, 0);
}
