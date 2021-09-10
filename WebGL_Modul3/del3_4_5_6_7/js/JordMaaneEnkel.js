"use strict";

/* JAVASCRIPT-teknisk:
    let i forhold til var,
    se: https://stackoverflow.com/questions/762011/whats-the-difference-between-using-let-and-var

    GENERELT TIPS: Bruk let i stedet for var.
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
let camPosX = 25;
let camPosY = 60;
let camPosZ = 100;
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
let squarePositionBuffer = null;
let squareColorBuffer = null;

let coordPositionBuffer = null;
let coordColorBuffer = null;

let COORD_BOUNDARY = 100;

// "Pekere" som brukes til � sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;

// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

//Animasjon:
let yRot = 0.0;
let orbRot = 0.0;
let lastTime = 0.0;
let scale = 1.0;

//Variabel for � beregne og vise FPS:
let fpsData = new Object();//{}; //Setter fpsData til en tomt objekt.

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

    //Initialiserer matrisen:
    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    // Initialiserer verteksbuffer:
    initBuffer();

    // Binder shaderparametre:
    if (!initUniforms())
        return;

    // Setter bakgrunnsfarge:
    gl.clearColor(0.4, 0.1, 0.7, 1.0); //RGBA

    // Initialiserer variabel for beregning av FPS:
    fpsData.frameCount = 0;
    fpsData.lastTimeStamp = 0;

    // Start animasjonsl�kke:
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
    // VIEW-matrisa:
    // cuon-utils: Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ)
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);

    // PROJECTION-matrisa:
    // cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);
}

function initBuffer() {
    // JORDA & MÅNEN representert som et kvadrat.
    let squarePositions = new Float32Array([
        -10, 0, 10,
        10, 0, 10,
        -10, 0, -10,
        10, 0, -10
    ]);
    // Farger:
    let squareColors = new Float32Array([
        0.9, 0.1, 0.9, 1.0,
        0.9, 0.1, 0.9, 1.0,
        0.9, 0.1, 0.9, 1.0,
        0.9, 0.1, 0.9, 1.0
    ]);

    // Position buffer:
    squarePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squarePositions, gl.STATIC_DRAW);
    squarePositionBuffer.itemSize = 3; // NB!!
    squarePositionBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Color buffer:
    squareColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squareColors, gl.STATIC_DRAW);
    squareColorBuffer.itemSize = 4; // NB!!
    squareColorBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //KOORDINATSYSTEM:
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

    //Ulike farge for hver side:
    var coordColors = new Float32Array([
        1.0, 0.0, 0.0, 1,   // X-akse
        1.0, 0.0, 0.0, 1,
        0.0, 1.0, 0.0, 1,   // Y-akse
        0.0, 1.0, 0.0, 1,
        0.0, 0.0, 1.0, 1,   // Z-akse
        0.0, 0.0, 1.0, 1
    ]);

    // Verteksbuffer for koordinatsystemet:
    coordPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordPositions, gl.STATIC_DRAW);
    coordPositionBuffer.itemSize = 3; 		// NB!!
    coordPositionBuffer.numberOfItems = 6; 	// NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! M� kople fra n�r det opereres med flere buffer! Kopler til i draw().

    //Fargebuffer: oppretter, binder og skriver data til bufret:
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
    //NB! M� sette a_Position p� nytt ETTER at buffer er bundet:
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
    // Sl�r sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner koordinatsystem:
    gl.drawArrays(gl.LINES, 0, coordPositionBuffer.numberOfItems);
}

function drawPlanets() {
    //Binder buffer og parametre:
    gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    //JORDA:
    let orbTrans = 50;

    setupCamera();		//NB! viewMatrix.multiply(modelMatrix) endrer view-matrisa. M� derfor sette den p� nytt hver gang.
    //M=I*T*O*R*S, der O=R*T
    modelMatrix.setIdentity();
    //Roter  om egen y-akse:
    modelMatrix.rotate(yRot, 0, 1, 0);
    // Sl�r sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner jorda:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squarePositionBuffer.numberOfItems);

    //MÅNEN:
    setupCamera();		//NB! viewMatrix.multiply(modelMatrix) endrer view-matrisa. M� derfor sette den p� nytt hver gang.
    //M=I*T*O*R*S, der O=R*T
    modelMatrix.setIdentity();
    //Baneberegning / Orbit:
    modelMatrix.rotate(orbRot, 0, 1, 0);  //Går i "bane" om y-aksen.
    modelMatrix.translate(0, 0, orbTrans);	//Flytt langs z-aksen.
    //Roter først om egen y-akse:
    modelMatrix.rotate(yRot, 0, 1, 0); 	//Roterer om origo. Y-aksen.
    //Skalerer likt i alle akser:
    modelMatrix.scale(0.5, 0.5, 0.5);

    // Sl�r sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner trekantene:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squarePositionBuffer.numberOfItems);
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

    //S�rger for at draw kalles p� nytt:
    window.requestAnimationFrame(draw);

    if (currentTime === undefined)
        currentTime = 0; 	//Udefinert f�rste gang.

    //Beregner og viser FPS:
    if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forl�pt...
        //Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById("fps").innerHTML = fpsData.frameCount;
        fpsData.frameCount = 0;
        fpsData.lastTimeStamp = currentTime; //Brukes for � finne ut om det har g�tt 1 sekund - i s� fall beregnes FPS p� nytt.
    }

    //Tar h�yde for varierende frame rate:

    let elapsed = 0.0;			// Forl�pt tid siden siste kalle p� draw().
    if (lastTime !== 0.0)		// F�rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime)/1000; // Deler p� 1000 for � operere med sekunder.
    lastTime = currentTime;						// Setter lastTime til currentTime.

    let yRotSpeed = 60; 	// Bestemmer hvor fort trekanten skal rotere (uavhengig av FR).
    yRot = yRot + (yRotSpeed * elapsed); 	// Gir ca 60 graders rotasjon per sekund - og 6 sekunder for en hel rotasjon.
    yRot %= 360;								// "Rull rundt" dersom yRot >= 360 grader.

    let orbRotSpeed = 5; 	// Bestemmer hvor fort trekanten skal rotere (uavhengig av FR).
    orbRot = orbRot + (orbRotSpeed * elapsed); 	// Gir ca 60 graders rotasjon per sekund - og 6 sekunder for en hel rotasjon.
    orbRot %= 360;								// "Rull rundt" dersom yRot >= 360 grader.

    //Rensk skjermen:
    gl.clear(gl.COLOR_BUFFER_BIT);

    // LESE BRUKERINPUT;
    handleKeys(elapsed);

    //TEGN KOORDINATSYSTEM:
    drawCoord();

    //TEGN planet og måne:
    drawPlanets();

    //�ker antall frames med 1
    fpsData.frameCount++;
}
