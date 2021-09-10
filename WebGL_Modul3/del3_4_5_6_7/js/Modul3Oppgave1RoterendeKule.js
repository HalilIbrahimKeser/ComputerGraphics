"use strict";

let VSHADER_SOURCE =
    "attribute vec3 a_Position;\n" +	// Innkommende verteksposisjon.
    "attribute vec4 a_Color;\n" +		// Innkommende verteksfarge.
    "uniform mat4 u_modelviewMatrix;\n" +
    "uniform mat4 u_projectionMatrix;\n" +
    "varying vec4 v_Color;\n" +			// NB! Bruker varying.
    "void main() {\n" +
    "  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n" +
    "  v_Color = a_Color;\n" + 			// NB! Setter varying = innkommende verteksfarge.
    "}\n";

let FSHADER_SOURCE =
    "precision mediump float;\n" +
    "varying vec4 v_Color;\n" +			// NB! Interpolert fargeverdi.
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" + 	// Setter gl_FragColor = Interpolert fargeverdi.
    "}\n";

let gl = null;
let canvas = null;

let camPosX = 100;
let camPosY = 50;
let camPosZ = 20;

let lookAtX = 0;
let lookAtY = 0;
let lookAtZ = 0;

let upX = 0;
let upY = 1;
let upZ = 0;

let currentlyPressedKeys = [];

let coordPositionBuffer = null;
let coordColorBuffer = null;
let COORD_BOUNDARY = 1000;

let sphereVertices;        //Float32Array.
let sphereIndices;        //Uint16Array
let vertexBufferSphere = null;  //Bufret fylles med data fra sphereVertices.
let indexBufferSphere = null;    //Bufret fylles med data fra sphereIndices.

let u_modelviewMatrix = null;
let u_projectionMatrix = null;

let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

let yRot = 0.0;
let orbRot = 0.0;
let lastTime = 0.0;
let scale = 1.0;
let orbTrans = 50;

let fpsData = new Object();

function main() {
    if (!initContext())
        return;

    document.getElementById("uri").innerHTML = document.baseURI;

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Feil ved initialisering av shaderkoden.");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    initCoordBuffers();
    initSphereIndicesAndBuffers();

    // Binder shaderparametre:
    if (!initUniforms())
        return;

    // Setter bakgrunnsfarge:
    gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA

    // Initialiserer variabel for beregning av FPS:
    fpsData.frameCount = 0;
    fpsData.lastTimeStamp = 0;

    // Start animasjonsløkke:
    draw();
}

function initContext() {
    canvas = document.getElementById("webgl");

    gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("Fikk ikke tak i rendering context for WebGL");
        return false;
    }

    gl.viewport(0,0,canvas.width,canvas.height);

    document.addEventListener("keyup", handleKeyUp, false);
    document.addEventListener("keydown", handleKeyDown, false);

    return true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function setupCamera() {
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);

    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 0.1, 10000);
}

function initSphereIndicesAndBuffers() {
    let vertexPosColData = [];
    let r=0,g=1,b=0,a=1;

    let latitudeBands = 30;
    let longitudeBands = 30;
    let radius = 20;

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        let theta = latNumber * Math.PI / latitudeBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        r-=0.05; g+=0.05; b+=0.1;
        if (r<=0) r=1;
        if (g>=1) g=0;
        if (b>=1) b=0;

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longitudeBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            vertexPosColData.push(radius * x);
            vertexPosColData.push(radius * y);
            vertexPosColData.push(radius * z);
            vertexPosColData.push(r);
            vertexPosColData.push(g);
            vertexPosColData.push(b);
            vertexPosColData.push(a);
        }
    }

    let indexData = [];
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            let first = (latNumber * (longitudeBands + 1)) + longNumber;
            let second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    sphereVertices = new Float32Array(vertexPosColData);
    sphereIndices = new Uint16Array(indexData);

    vertexBufferSphere = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSphere);
    gl.bufferData(gl.ARRAY_BUFFER, sphereVertices, gl.STATIC_DRAW);

    indexBufferSphere = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereIndices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initCoordBuffers() {
    let coordPositions = new Float32Array([
        //x-aksen
        -COORD_BOUNDARY, 0.0, 0.0,
        COORD_BOUNDARY, 0.0, 0.0,

        //y-aksen:
        0.0, COORD_BOUNDARY, 0.0,
        0.0, -COORD_BOUNDARY, 0.0,

        //z-aksen:
        0.0, 0.0, COORD_BOUNDARY,
        0.0, 0.0, -COORD_BOUNDARY,
    ]);

    // Verteksbuffer for koordinatsystemet:
    coordPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordPositions, gl.STATIC_DRAW);
    coordPositionBuffer.itemSize = 3; 		// NB!!
    coordPositionBuffer.numberOfItems = 6; 	// NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! M� kople fra n�r det opereres med flere buffer! Kopler til i draw().

    // Fargebuffer: oppretter, binder og skriver data til bufret:
    let coordColors = new Float32Array([
        0.0, 1.0, 0.0, 1,   // X-akse
        1.0, 0.0, 0.0, 1,
        0.0, 1.0, 1.0, 1,   // Y-akse
        1.0, 1.0, 0.0, 1,
        0.0, 0.0, 0.4, 1,   // Z-akse
        0.0, 1.0, 1.0, 1
    ]);
    coordColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordColors, gl.STATIC_DRAW);
    coordColorBuffer.itemSize = 4; 			// 4 float per farge.
    coordColorBuffer.numberOfItems = 6; 	// 6 farger.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initUniforms() {
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");
    return true;
}

function drawCoord() {
    gl.bindBuffer(gl.ARRAY_BUFFER, coordPositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, coordColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    setupCamera();

    modelMatrix.setIdentity();
    modelviewMatrix = viewMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    gl.drawArrays(gl.LINES, 0, coordPositionBuffer.numberOfItems);
}

function drawEarth() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSphere);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    let stride = (3 + 4) * 4;
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);

    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);   //4=ant. Floats per verteks
    gl.enableVertexAttribArray(a_Color);

    // for (let i=0; i<10; i++) {
    //     setupCamera();
    //     let x = -500 + Math.random() * 500*2;
    //     let z = -500 + Math.random() * 500*2;
    //     modelMatrix.setIdentity();
    //     modelMatrix.rotate(orbRot, 0, 1, 0);
    //     modelMatrix.translate(x,0,z);
    //
    //     modelviewMatrix = viewMatrix.multiply(modelMatrix);
    //
    //     gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    //     gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    //
    //     // Tegner kula:
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
    //     gl.drawElements(gl.TRIANGLE_STRIP, sphereIndices.length, gl.UNSIGNED_SHORT, 0);
    // }

    setupCamera();

    modelMatrix.setIdentity();
    modelMatrix.rotate(orbRot, 0, 1, 0);

    modelviewMatrix = viewMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
    gl.drawElements(gl.LINE_STRIP, sphereIndices.length, gl.UNSIGNED_SHORT,0);
}

function drawMoon() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSphere);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    let stride = (3 + 4) * 4;
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);

    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);   //4=ant. Floats per verteks
    gl.enableVertexAttribArray(a_Color);

    setupCamera();

    //M=I*T*O*R*S, der O=R*T
    modelMatrix.setIdentity();
    modelMatrix.rotate(orbRot, 0, 1, 0);
    modelMatrix.translate(0, 0, orbTrans);
    modelMatrix.rotate(yRot, 0, 1, 0);
    modelMatrix.scale(0.2, 0.2, 0.2);

    modelviewMatrix = viewMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSphere);
    gl.drawElements(gl.LINE_STRIP, sphereIndices.length, gl.UNSIGNED_SHORT,0);
}

function handleKeys(elapsed) {
    let camPosVec = vec3.fromValues(camPosX, camPosY, camPosZ);

    if (currentlyPressedKeys[65]) {    //A
        rotateVector(2, camPosVec, 0, 1, 0);  //Roterer camPosVec 2 grader om y-aksen.
    }
    if (currentlyPressedKeys[68]) {	//S
        rotateVector(-2, camPosVec, 0, 1, 0);  //Roterer camPosVec 2 grader om y-aksen.
    }
    if (currentlyPressedKeys[87]) {	//W
        rotateVector(2, camPosVec, 1, 0, 0);  //Roterer camPosVec 2 grader om x-aksen.
    }
    if (currentlyPressedKeys[83]) {	//D
        rotateVector(-2, camPosVec, 1, 0, 0);  //Roterer camPosVec 2 grader om x-aksen.
    }

    if (currentlyPressedKeys[86]) { //V
        vec3.scale(camPosVec, camPosVec, 1.05);
    }
    if (currentlyPressedKeys[66]) {	//B
        vec3.scale(camPosVec, camPosVec, 0.95);
    }

    camPosX = camPosVec[0];
    camPosY = camPosVec[1];
    camPosZ = camPosVec[2];
    setupCamera();
}

function draw(currentTime) {
    window.requestAnimationFrame(draw);

    if (currentTime === undefined)
        currentTime = 0; 	//Udefinert f�rste gang.

    if (currentTime - fpsData.lastTimeStamp >= 1000) {
        document.getElementById("fps").innerHTML = fpsData.frameCount;
        fpsData.frameCount = 0;
        fpsData.lastTimeStamp = currentTime;
    }

    let elapsed = 0.0;
    if (lastTime !== 0.0)
        elapsed = (currentTime - lastTime)/1000;
    lastTime = currentTime;


    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //Evt. BackfaceCulling:
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    handleKeys(elapsed);

    //TEGNER:
    drawCoord();
    drawEarth();
    drawMoon();

    fpsData.frameCount++;
}
