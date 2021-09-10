"use strict";

/*
    Tegner samme trekant flere ganger med ulik farge.
    Endrer innhold i fargebuffer før tegning av ny trekant. Gjøres i egen funksjon.
*/
// Verteksshader:
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

// Fragmentshader:
let FSHADER_SOURCE =
    "precision mediump float;\n" +
    "varying vec4 v_Color;\n" +			// NB! Interpolert fargeverdi.
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" + 	// Setter gl_FragColor = Interpolert fargeverdi.
    "}\n";

let gl = null;
let canvas = null;

// Kameraposisjon:
let camPosX = 100;
let camPosY = 360;
let camPosZ = 700;
// Kamera ser mot ...
let lookAtX = 0;
let lookAtY = 0;
let lookAtZ = 0;
// Kameraorientering:
let upX = 0;
let upY = 1;
let upZ = 0;

// Tar vare på tastetrykk:
let currentlyPressedKeys = [];

// Verteksbuffer:
let xzplanePositionBuffer = null;
let xzplaneColorBuffer = null;

let trianglePositionBuffer = null;
let triangleColorBuffer = null;

let coordPositionBuffer = null;
let coordColorBuffer = null;

let COORD_BOUNDARY = 1000;
let width = 500;
let height = 500;

// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;

// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

//Animasjon:
let lastTime = 0.0;

//Variabel for å beregne og vise FPS:
let fpsData = new Object();    //Alternativt: let fpsData = {};   //Setter fpsData til en tomt objekt.

function main() {

    if (!initContext())
        return;

    let uri = document.baseURI;
    document.getElementById("uri").innerHTML = uri;

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Feil ved initialisering av shaderkoden.");
        return;
    }

    // AKTIVERER DYBDETEST:
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    //Initialiserer matrisen:
    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    // Initialiserer verteksbuffer:
    initXZPlaneBuffers();
    initTriangleBuffers();
    initCoordBuffers();

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
    // Hent <canvas> elementet
    canvas = document.getElementById("webgl");

    // Rendering context for WebGL:
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("Fikk ikke tak i rendering context for WebGL");
        return false;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

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
    // VIEW-matrisa:
    // cuon-utils: Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ)
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);

    // PROJECTION-matrisa:
    // cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 0.1, 10000);
}

function initXZPlaneBuffers() {
    let xzplanePositions = new Float32Array([
        -width / 2, 0, height / 2,
        width / 2, 0, height / 2,
        -width / 2, 0, -height / 2,
        width / 2, 0, -height / 2
    ]);
    // Farger:
    let xzplaneColors = new Float32Array([
        0.5, 0.222, 0.5, 0.6,
        0.5, 0.222, 0.5, 0.6,
        0.5, 0.222, 0.5, 0.6,
        0.5, 0.222, 0.5, 0.6
    ]);
    // Position buffer:
    xzplanePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplanePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xzplanePositions, gl.STATIC_DRAW);
    xzplanePositionBuffer.itemSize = 3;         // 3 float per posisjon.
    xzplanePositionBuffer.numberOfItems = 4;    // 4 posisjoner
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Color buffer:
    xzplaneColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplaneColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xzplaneColors, gl.STATIC_DRAW);
    xzplaneColorBuffer.itemSize = 4;            // 4 float per farge.
    xzplaneColorBuffer.numberOfItems = 4;       // 4 farger.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Endrer innhold i fargebufferet:
function setTriangleColor(red, green, blue) {
    let triangleColors = new Float32Array([
        red, green, blue, 1,
        red, green, blue, 1,
        red, green, blue, 1,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleColors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initTriangleBuffers() {
    let trianglePositions = new Float32Array([
        20, -20, 0,
        0, 20, 0,
        -20, -20, 0
    ]);
    // Position buffer:
    trianglePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trianglePositions, gl.STATIC_DRAW);
    trianglePositionBuffer.itemSize = 3;        // 3 float per posisjon.
    trianglePositionBuffer.numberOfItems = 3;   // 3 posisjoner
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Color buffer:
    triangleColorBuffer = gl.createBuffer();
    triangleColorBuffer.itemSize = 4;           // 4 float per farge.
    triangleColorBuffer.numberOfItems = 3;      // 3 farger
    // Setter farge i egen funksjon (slik at den kan endres fra f.eks. draw()):
    setTriangleColor(0.0, 0.0, 0.0);
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
    coordPositionBuffer.itemSize = 3;
    coordPositionBuffer.numberOfItems = 6;
    gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! Må kople fra når det opereres med flere buffer! Kopler til i draw().

    //Fargebuffer: oppretter, binder og skriver data til bufret:
    let coordColors = new Float32Array([
        1, 0.0, 0.0, 1,   // X-akse
        1, 0.0, 0.0, 1,
        0.0, 1, 0.0, 1,   // Y-akse
        0.0, 1, 0.0, 1,
        0.0, 0.0, 1, 1,   // Z-akse
        0.0, 0.0, 1, 1
    ]);
    coordColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordColors, gl.STATIC_DRAW);
    coordColorBuffer.itemSize = 4; 			// 4 float per farge.
    coordColorBuffer.numberOfItems = 6; 	// 6 farger.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initUniforms() {
    // Kopler shaderparametre med Javascript-variabler:
    // Matriser: u_modelviewMatrix & u_projectionMatrix
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

    //Still inn kamera:
    setupCamera();

    modelMatrix.setIdentity();
    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner koordinatsystem:
    gl.drawArrays(gl.LINES, 0, coordPositionBuffer.numberOfItems);
}

function drawXZPlane() {
    //Binder buffer og parametre:
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplanePositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, xzplaneColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    setupCamera();
    //M=I*T*O*R*S, der O=R*T
    modelMatrix.setIdentity();
    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner jorda:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, xzplanePositionBuffer.numberOfItems);
}

// Transformasjon/modellmatrisa må være satt før kall på denne:
function drawColoredTriangle(red, green, blue) {
    setTriangleColor(red, green, blue);
    setupCamera();
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, trianglePositionBuffer.numberOfItems);
}

// Tegner n antall trekanter vha. drawColoredTriangle() funksjonen:
function drawTriangles() {
    setTriangleColor(1.0, 0.0, 0.0);

    //Binder buffer og parametre:
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // Trekant 1:
    modelMatrix.setIdentity();
    drawColoredTriangle(1, 0.4, 0.0);

    // Trekant 2:
    modelMatrix.setIdentity();
    modelMatrix.translate(0, 0, -50);
    drawColoredTriangle(0, 1.0, 1.0);

    // Trekant 3:
    modelMatrix.setIdentity();
    modelMatrix.translate(0, 0, -150);
    drawColoredTriangle(0, 0.0, 1.0);

    // Trekant 4 - vekslende og tilfeldig farge (trekanten vil BLINKE siden fargen endres for hver kjøring av draw(), dvs.60 ganger i sekundet):
    /*
    let red = Math.random();        // Gir tilfeldig tall fra og med 0 til 1 (<1).
    let green = Math.random();      // Gir tilfeldig tall fra og med 0 til 1 (<1).
    let blue = Math.random();       // Gir tilfeldig tall fra og med 0 til 1 (<1).
     */
    modelMatrix.setIdentity();
    modelMatrix.translate(-150, 0, 0);
    drawColoredTriangle(0.5, 0.7, 0.3);
}

function handleKeys(elapsed) {

    let camPosVec = vec3.fromValues(camPosX, camPosY, camPosZ);
    //Enkel rotasjon av kameraposisjonen:
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

    //Zoom inn og ut:
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

    //Sørger for at draw kalles pø nytt:
    window.requestAnimationFrame(draw);

    if (currentTime === undefined)
        currentTime = 0; 	//Udefinert første gang.

    //Beregner og viser FPS:
    if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forløpt...
        //Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById("fps").innerHTML = fpsData.frameCount;
        fpsData.frameCount = 0;
        fpsData.lastTimeStamp = currentTime; //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
    }

    //Tar høyde for varierende frame rate:

    let elapsed = 0.0;			// Forløpt tid siden siste kalle på draw().
    if (lastTime !== 0.0)		// Først gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime)/1000; // Deler på 1000 for å operere med sekunder.
    lastTime = currentTime;						// Setter lastTime til currentTime.

    //Rensk skjermen:
    gl.clear(gl.COLOR_BUFFER_BIT);

    // GJENNOMSIKTIGHET:
    // Aktiverer fargeblanding (&indirekte gjennomsiktighet):
    gl.enable(gl.BLEND);
    // Angir blandefunksjon:
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //Evt. BackfaceCulling:
    //gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
    //gl.enable(gl.CULL_FACE);	//enabler culling.
    //gl.cullFace(gl.BACK);		//culler baksider.

    // LESE BRUKERINPUT;
    handleKeys(elapsed);

    //TEGNER:
    drawCoord();
    drawTriangles();
    drawXZPlane();

    //øker antall frames med 1
    fpsData.frameCount++;
}
