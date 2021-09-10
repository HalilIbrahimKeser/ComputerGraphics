"use strict";

/* JAVASCRIPT-teknisk:
    let i forhold til var,
    se: https://stackoverflow.com/questions/762011/whats-the-difference-between-using-let-and-var

    Alle variabler definert som var innenfor en funksjon er synlig overalt i funksjonen.
    Eksempel:
    function byE40() {
      //nish *is* visible out here
      for( var nish = 0; nish < 5; nish++ ) {
        //nish is visible to the whole function
      }
      //nish *is* visible out here
    }

    Variabler deklarert vha let er begrenset innad i omsluttende blokk:

    function allyIlliterate() {
      //tuce is *not* visible out here
      for( let tuce = 0; tuce < 5; tuce++ ) {
        //tuce is only visible in here (and in the for() parentheses)
        //and there is a separate tuce variable for each iteration of the loop
      }
      //tuce is *not* visible out here
    }


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
let paperManPositionBuffer = null;
let paperManColorBuffer = null;

let coordPositionBuffer = null;
let coordColorBuffer = null;

let COORD_BOUNDARY = 100;

// "Pekere" som brukes til � sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;
let u_FragColor = null;

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

let leftArmRot = 210;
let leftLowerArmRot = -45;

let matrixStack = [];

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

    gl.viewport(0,0,canvas.width,canvas.height);

    document.addEventListener("keyup", handleKeyUp, false);
    document.addEventListener("keydown", handleKeyDown, false);

    return true;
}

//NB! 2021: Endre TIL: Disse fungerer på tvers av nettlesere: KONTROLLER AT DET FUNKER!!
/*
function handleKeyUp(event) {
	if (event.defaultPrevented) return;
	this.currentlyPressedKeys[event.code] = false;
	event.preventDefault();
}

function handleKeyDown(event) {
	if (event.defaultPrevented) return;
	this.currentlyPressedKeys[event.code] = true;
	event.preventDefault();
}
	if (this.currentlyPressedKeys["KeyL"]) {
            this.lights.lightPosition[0] += 1;
        }
        if (this.currentlyPressedKeys["KeyJ"]) {
            this.lights.lightPosition[0] -= 1;
        }

	if (this.currentlyPressedKeys["Digit1"]) {
            this.selectedCar=1
        }
        if (this.currentlyPressedKeys["Digit2"]) {
            this.selectedCar=2
        }
        if (this.currentlyPressedKeys["Digit3"]) {
            this.selectedCar=3
        }
        if (this.currentlyPressedKeys["Digit4"]) {
            this.selectedCar=4
        }

*/

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
    let paperManPositions = new Float32Array([
        //Torso:
        -2.5, -5, 0,
        2.5, -5, 0,
        -2.5, 5, 0,
        2.5, 5, 0,
        //Halsen:
        -0.5, -1, 0,
        0.5, -1, 0,
        -0.5, 1, 0,
        0.5, 1, 0,
        //Hode:
        -1, -1.5, 0,
        1, -1.5, 0,
        -1, 1.5, 0,
        1, 1.5, 0,
        //Arm/Fot-del (over/under-arm/fot):
        -0.5, -0.5, 0,
        4, -0.5, 0,
        -0.5, 0.5, 0,
        4, 0.5, 0,
        //Finger:
        -0.1, -0.1, 0,
        1, -0.1, 0,
        -0.1, 0.1, 0,
        1, 0.1, 0
    ]);
    let paperManColors = new Float32Array([
        //Torso:
        0.7, 0.6, 0.1, 0.7,
        0.7, 0.6, 0.1, 0.7,
        0.7, 0.6, 0.1, 0.7,
        0.7, 0.6, 0.1, 0.7,
        //Hals:
        0.1, 0.6, 0.1, 1,
        0.1, 0.6, 0.1, 1,
        0.1, 0.6, 0.1, 1,
        0.1, 0.6, 0.1, 1,
        //Hode:
        0.1, 0.6, 0.8, 1,
        0.1, 0.6, 0.8, 1,
        0.1, 0.6, 0.8, 1,
        0.1, 0.6, 0.8, 1,
        //Arm/fot-del (under/over-arm/fot):
        0.1, 1.0, 0.4, 1,
        0.1, 1.0, 0.4, 1,
        0.1, 1.0, 0.4, 1,
        0.1, 1.0, 0.4, 1,
        //Finger:
        0.1, 1.0, 0.9, 1,
        0.1, 1.0, 0.9, 1,
        0.1, 1.0, 0.9, 1,
        0.1, 1.0, 0.9, 1
    ]);

    // Position buffer:
    paperManPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paperManPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, paperManPositions, gl.STATIC_DRAW);
    paperManPositionBuffer.itemSize = 3; // NB!!
    paperManPositionBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Color buffer:
    paperManColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paperManColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, paperManColors, gl.STATIC_DRAW);
    paperManColorBuffer.itemSize = 4; // NB!!
    paperManColorBuffer.numberOfItems = 4; // NB!!
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

    //Ulike farge for hver akse:
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

    // Farge: u_FragColor (bruker samme farge p� alle piksler/fragmenter):
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (u_FragColor < 0) {
        console.log("Fant ikke uniform-parametret u_FragColor i shaderen!?");
        return false;
    }

    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");

    return true;
}

function handleKeys(elapsed) {

    let camPosVec = vec3.fromValues(camPosX, camPosY, camPosZ);
    //Enkel rotasjon av kameraposisjonen:
    if (currentlyPressedKeys[65]) {    //A
        rotateVector(2, camPosVec, 0, 1, 0);  //Roterer camPosVec 2 grader om y-aksen.
    }
    if (currentlyPressedKeys[68]) {	//D
        rotateVector(-2, camPosVec, 0, 1, 0);  //Roterer camPosVec 2 grader om y-aksen.
    }
    if (currentlyPressedKeys[87]) {	//W
        rotateVector(2, camPosVec, 1, 0, 0);  //Roterer camPosVec 2 grader om x-aksen.
    }
    if (currentlyPressedKeys[83]) {	//S
        rotateVector(-2, camPosVec, 1, 0, 0);  //Roterer camPosVec 2 grader om x-aksen.
    }

    //Zoom inn og ut:
    if (currentlyPressedKeys[86]) { //V
        vec3.scale(camPosVec, camPosVec, 1.05);
    }
    if (currentlyPressedKeys[66]) {	//B
        vec3.scale(camPosVec, camPosVec, 0.95);
    }

    // ARMER!
    if (currentlyPressedKeys[70]) { //F
        leftArmRot = leftArmRot + 1;
    }
    if (currentlyPressedKeys[71]) { //G
        leftArmRot = leftArmRot - 1;
    }
    if (currentlyPressedKeys[72]) { //H
        leftLowerArmRot = leftLowerArmRot + 1;
    }
    if (currentlyPressedKeys[74]) { //J
        leftLowerArmRot = leftLowerArmRot - 1;
    }

    camPosX = camPosVec[0];
    camPosY = camPosVec[1];
    camPosZ = camPosVec[2];
    setupCamera();
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

//Legger matrix til stack.
function pushMatrix(matrix) {
    let copyToPush = new Matrix4(matrix);
    matrixStack.push(copyToPush);
}

//Fjerner øverste element fra stack:
function popMatrix() {
    if (matrixStack.length == 0)
        throw "Feil i popMatrix - matrisestacken er tom!";
    matrixStack.pop();
}

//Leser og returnerer toppmatrisa. NB! Fjerner ikke:
function peekMatrix() {
    if (matrixStack.length == 0)
        throw "Feil i peekMatrix - matrisestacken er tom!";
    let matrix = new Matrix4(matrixStack[matrixStack.length - 1]);
    return matrix;
}

//Tegner modellen som utgjør en satellitt (her et kvadrat):
function drawBodyPart(from, numberOfVerticesToDraw) {
    setupCamera();

    gl.bindBuffer(gl.ARRAY_BUFFER, paperManPositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, paperManColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    //Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = (new Matrix4(viewMatrix)).multiply(modelMatrix); // NB! rekkefølge!

    //Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    //Tegner del:
    gl.drawArrays(gl.TRIANGLE_STRIP, from, numberOfVerticesToDraw);
}

function drawPaperMan(elapsed) {
    modelMatrix.setIdentity();
    modelMatrix.translate(0, 0, 0);
    //modelMatrix.rotate(yRot, 1, 1, 1);  //<= Hele modellen roteres.
    //modelMatrix.scale(0.5, 0.5, 0.5);        //<= Hele modellen skaleres.

    pushMatrix(modelMatrix);	 	//Legges på toppen av stacken.

    //TORSO:
    drawBodyPart(0, 4);

    //HALSEN:
    modelMatrix = peekMatrix();     // Bruker toppen av stack som utgangspunkt
    modelMatrix.translate(0, 6, 0); // Legger til en translate
    drawBodyPart(4, 4);     // Tegn!

    //HODET:
    modelMatrix = peekMatrix();         // Bruker toppen av stack som utgangspunkt
    modelMatrix.translate(0, 8.5, 0);   // osv ...
    drawBodyPart(8, 4);

    //HØYRE ARM & FINGRER:
    //Overarm:
    modelMatrix = peekMatrix();
    modelMatrix.translate(2.5, 4.5, 0);
    modelMatrix.rotate(45, 0, 0, 1);
    pushMatrix(modelMatrix);	//PUSHER!
    drawBodyPart(12, 4);
    //Underarm:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4, 0, 0);
    modelMatrix.rotate(45, 0, 0, 1);
    pushMatrix(modelMatrix);	//PUSHER!
    drawBodyPart(12, 4);//NB! Bruker samme vertekser som overarm.
    //Finger-1:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4, 0.3, 0);
    modelMatrix.rotate(30, 0, 0, 1);
    drawBodyPart(16, 4);
    //Finger-2:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4, 0, 0);
    modelMatrix.rotate(0, 0, 0, 1);
    drawBodyPart(16, 4);//NB! Bruker samme vertekser som Finger-1.
    //Finger-3:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4, -0.3, 0);
    modelMatrix.rotate(-30, 0, 0, 1);
    drawBodyPart(16, 4);//NB! Bruker samme vertekser som Finger-1.

    popMatrix();
    popMatrix();

    //VENSTRE ARM & FINGRER:
    //Overarm:
    modelMatrix = peekMatrix();
    modelMatrix.translate(-2.5, 4.5, 0);
    modelMatrix.rotate(leftArmRot, 0, 0, 1);		//Roterer armen vha. F/G
    pushMatrix(modelMatrix);	//PUSHER!
    drawBodyPart(12, 4);	//NB! Bruker samme vertekser som overarm.
    //Underarm:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4.0, 0, 0); //NB! Har rotert koordinatsystemet 180 grader (derfor +translasjon)
    modelMatrix.rotate(leftLowerArmRot, 0, 0, 1);
    pushMatrix(modelMatrix);	//PUSHER!
    drawBodyPart(12, 4);//NB! Bruker samme vertekser som overarm.

    //Finger-1:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4.0, 0.3, 0);
    modelMatrix.rotate(30, 0, 0, 1);
    drawBodyPart(16, 4);
    //Finger-2:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4, 0, 0);
    modelMatrix.rotate(0, 0, 0, 1);
    drawBodyPart(16, 4);//NB! Bruker samme vertekser som Finger-1.
    //Finger-3:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4, -0.3, 0);
    modelMatrix.rotate(-30, 0, 0, 1);
    drawBodyPart(16, 4);//NB! Bruker samme vertekser som Finger-1.

    popMatrix();
    popMatrix();

    //HØYRE FOT (Lår/Legg):
    //Lår:
    modelMatrix = peekMatrix();
    modelMatrix.translate(2.5, -5.0, 0); //Torsoen er 10 enheter høy.
    modelMatrix.rotate(-85, 0, 0, 1);
    pushMatrix(modelMatrix);	//PUSHER!
    drawBodyPart(12, 4);//NB! Bruker samme vertekser som overarm.
    //Legg:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4.5, 0, 0);
    modelMatrix.rotate(-8, 0, 0, 1);
    drawBodyPart(12, 4);//NB! Bruker samme vertekser som overarm.

    popMatrix();

    //VENSTRE FOT (Lår/Legg):
    //Lår:
    modelMatrix = peekMatrix();
    modelMatrix.translate(-2.5, -5.0, 0); //Torsoen er 10 enheter høy.
    modelMatrix.rotate(180 + 85, 0, 0, 1);
    pushMatrix(modelMatrix);	//PUSHER!
    drawBodyPart(12, 4);//NB! Bruker samme vertekser som overarm.
    //Legg:
    modelMatrix = peekMatrix();
    modelMatrix.translate(4.5, 0, 0);
    modelMatrix.rotate(8, 0, 0, 1);
    drawBodyPart(12, 4);//NB! Bruker samme vertekser som overarm.

    //Tømmer stacken ...:
    while (matrixStack.length > 0)
        matrixStack.pop();
}

function draw(currentTime) {

    //Sørger for at draw kalles på nytt:
    window.requestAnimationFrame(draw);

    if (currentTime === undefined)
        currentTime = 0; 	//Udefinert første gang.

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

    //TEGN papirmannen:
    drawPaperMan(elapsed);

    //Øker antall frames med 1
    fpsData.frameCount++;
}
