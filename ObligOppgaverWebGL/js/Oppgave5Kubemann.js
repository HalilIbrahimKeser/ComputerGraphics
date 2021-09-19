// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelViewMatrix = null;
let projectionMatrix = null;
let normalMatrix  = null;

let u_modelviewMatrix = null;
let u_projectionMatrix = null;

let gl = null;
let canvas = null;
let buffers = null;

//Kamera
let camPosX = 100;
let camPosY = 100;
let camPosZ = 650;
let lookAtX = 0;
let lookAtY = 0;
let lookAtZ = 0;
let upX = 0;
let upY = 1;
let upZ = 0;

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }`;

const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
    }`;

main();

function main() {
    canvas = document.getElementById("webgl");
    gl = getWebGLContext(canvas);

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    gl.viewport(0,0,canvas.width,canvas.height);

    if (!initShaders(gl, vsSource, fsSource)) {
        console.log("Feil ved initialisering av shaderkoden.");
        return;
    }

    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelViewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    buffers = initBuffers();

    if (!bindShaderParameters())
        return;

    drawScene();
}

function initBuffers() {
    // POSITION
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,

        // HEAD Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //HEAD
    const headColor = [ //RGB
        [0.9,  0.8,  0.3,  1.0],    // Front face
        [0.7,  0.8,  0.0,  1.0],    // Back face
        [0.5,  0.8,  0.2,  1.0],    // Top face
        [0.2,  0.8,  0.4,  1.0],    // Bottom face
        [0.2,  0.8,  0.5,  1.0],    // Right face
        [0.1,  0.8,  0.0,  1.0],    // Left face
    ];
    let headColorBuffer = makeColorBuffer(headColor);

    //BODY
    const bodyColor = [
        [0.4,  0.1,  0.8,  1.0],    // Front face
        [0.0,  0.8,  0.8,  1.0],    // Back face
        [0.2,  0.1,  0.8,  1.0],    // Top face
        [0.2,  0.0,  0.8,  1.0],    // Bottom face
        [0.0,  0.5,  0.8,  1.0],    // Right face
        [0.0,  0.2,  0.8,  1.0],    // Left face
    ];
    let bodyColorBuffer = makeColorBuffer(bodyColor);

    //LEGS
    const legsColor = [
        [0.0,  0.8,  0.5,  1.0],    // Front face
        [0.5,  0.8,  0.0,  1.0],    // Back face
        [0.4,  0.8,  0.2,  1.0],    // Top face
        [0.0,  0.8,  0.2,  1.0],    // Bottom face
        [0.4,  0.8,  0.0,  1.0],    // Right face
        [0.4,  0.8,  0.0,  1.0],    // Left face
    ];
    let legsColorBuffer = makeColorBuffer(legsColor);

    //ARMS
    const armsColor = [
        [0.9,  0.5,  0.0,  1.0],    // Front face
        [0.9,  0.5,  0.0,  1.0],    // Back face
        [0.9,  0.6,  0.2,  1.0],    // Top face
        [0.9,  0.5,  0.0,  1.0],    // Bottom face
        [0.9,  0.5,  0.2,  1.0],    // Right face
        [0.9,  0.5,  0.0,  1.0],    // Left face
    ];
    let armsColorBuffer = makeColorBuffer(armsColor);

    //INDEX
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

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
        headColorBuffer,
        bodyColorBuffer,
        legsColorBuffer,
        armsColorBuffer,
        indices: indexBuffer,
    };
}

function makeColorBuffer(faceColors) {
    let colors = [];

    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
    }
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return colorBuffer;
}

function setupCamera() {
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);

    const fieldOfView = 50 * Math.PI / 150;   // in radians
    const aspect = canvas.width / canvas.height;
    const zNear = 0.1;
    const zFar = 1000.0;

    projectionMatrix.setPerspective(fieldOfView, aspect, zNear, zFar);
}

// DRAW
function drawScene() {
    gl.clearColor(0.8, 0.6, 0.6, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //CULLING
    gl.frontFace(gl.CW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);

    drawCubeMan();
}

//Draw each separate parts of cubeMan
function drawBodyPart(vertexCount, offset, colorBuffer) {
    setupCamera();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    let a_Position = gl.getAttribLocation(gl.program, "aVertexPosition");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "aVertexColor");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    modelViewMatrix = (new Matrix4(viewMatrix)).multiply(modelMatrix);

    // modelViewMatrix.invert(projectionMatrix, modelViewMatrix);//
    // modelViewMatrix.transpose(projectionMatrix, modelViewMatrix);//

    //Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelViewMatrix.elements);

    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    {
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

//
//Draw all parts of cubeman
function drawCubeMan() {
    //BODY
    modelMatrix.setIdentity();
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(1, 1, 1);
    modelMatrix.rotate(0, 0, 0);
    drawBodyPart(36, 0, buffers.bodyColorBuffer);

    //HEAD
    modelMatrix.setIdentity();
    modelMatrix.translate(0, 1.5, 0);
    modelMatrix.scale(0.5, 0.5, 0.5);
    modelMatrix.rotate(0, 0, 0);
    drawBodyPart(36, 0, buffers.headColorBuffer);

    //LEG VENSTRE
    modelMatrix.setIdentity();
    modelMatrix.translate(-1, -1.7, 0);
    modelMatrix.rotate(-20, 0, 0, 1);
    modelMatrix.scale(0.2, 0.9, 0.2);
    drawBodyPart(36, 0, buffers.legsColorBuffer);

    //LEG HØYRE
    modelMatrix.setIdentity();
    modelMatrix.translate(1, -1.7, 0);
    modelMatrix.rotate(20, 0, 0, 1);
    modelMatrix.scale(0.2, 0.9, 0.2);
    drawBodyPart(36, 0, buffers.legsColorBuffer);

    //ARM HØYRE
    modelMatrix.setIdentity();
    modelMatrix.translate(2, 1, 0);
    modelMatrix.rotate(-65, 0, 0, 1);
    modelMatrix.scale(0.15, 1.2, 0.15);
    drawBodyPart(36, 0, buffers.armsColorBuffer);

    //ARM VENSTRE
    modelMatrix.setIdentity();
    modelMatrix.translate(-2, 1, 0);
    modelMatrix.rotate(65, 0, 0, 1);
    modelMatrix.scale(0.15, 1.2, 0.15);
    drawBodyPart(36, 0, buffers.armsColorBuffer);

    //GULV
    modelMatrix.setIdentity();
    modelMatrix.translate(0, -7.6, 0);
    modelMatrix.rotate(90, -90, 0, 1);
    modelMatrix.scale(5, 5, 5);
    drawBodyPart(6, 0, buffers.bodyColorBuffer);
}

function bindShaderParameters() {
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "uModelViewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "uProjectionMatrix");
    return true;
}