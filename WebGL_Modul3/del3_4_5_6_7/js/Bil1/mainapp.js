"use strict";
/*
    Tegner en bil.
*/

// Globale variabler: Disse er synlig på tvers av .js filene inkludert i .html-fila.

// Kontekst og canvas:
let gl = null;
let canvas = null;

// Matriser
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

// Kameraposisjon:
let camPosX = 70;
let camPosY = 30;
let camPosZ = 35;

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

// Matrisepekere/referanser:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;

let lastTime = 0.0;

//Variabel for å beregne og vise FPS:
let fpsData = new Object(); //Alternativt: let fpsData = {};   //Setter fpsData til en tomt objekt.

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
    console.log(event.which);
    currentlyPressedKeys[event.which] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.which] = true;
}

function setupCamera() {
    // VIEW-matrisa:
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);
    // PROJECTION-matrisa: cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 0.1, 10000);
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

    //Sving på hjulene
    if (currentlyPressedKeys[89]) { //Y
        steeringRot+=1;
    }
    if (currentlyPressedKeys[85]) {	//U
        steeringRot-=1;
    }

    camPosX = camPosVec[0];
    camPosY = camPosVec[1];
    camPosZ = camPosVec[2];
    setupCamera();
}

function draw(currentTime) {

    // Sørger for at draw kalles på nytt:
    window.requestAnimationFrame(draw);

    if (currentTime === undefined)
        currentTime = 0; 	//Udefinert første gang.

    // Beregner og viser FPS:
    if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forløpt...
        //Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById("fps").innerHTML = fpsData.frameCount;
        fpsData.frameCount = 0;
        fpsData.lastTimeStamp = currentTime; //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
    }

    // Tar høyde for varierende frame rate:
    let elapsed = 0.0;			// Forløpt tid siden siste kalle på draw().
    if (lastTime !== 0.0)		// Først gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime)/1000; // Deler på 1000 for å operere med sekunder.
    lastTime = currentTime;						// Setter lastTime til currentTime.

    // Rensk skjermen:
    gl.clear(gl.COLOR_BUFFER_BIT);

    // GJENNOMSIKTIGHET:
    // Aktiverer fargeblanding (&indirekte gjennomsiktighet):
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // BRUKERINPUT;
    handleKeys(elapsed);

    // TEGNER:
    drawCoord(elapsed);
    //drawXZPlane(elapsed);
    drawCar();
    fpsData.frameCount++;
}

function main() {

    if (!initContext())
        return;

    let uri = document.baseURI;
    document.getElementById("uri").innerHTML = uri;

    // SHADERE fra html-fila:
    let vertexShaderSource = document.getElementById("vertex-shader").innerHTML;
    let fragmentShaderSource = document.getElementById("fragment-shader").innerHTML;
    if (!initShaders(gl, vertexShaderSource, fragmentShaderSource)) {
        console.log("Feil ved initialisering av shaderkoden - se over koden på nytt.");
        return;
    }

    // AKTIVERER DYBDETEST:
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    // Initialiserer matrisene:
    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    // Initialiserer verteksbuffer:
    initCoordBuffers();
    initXZPlaneBuffers();
    initCarBuffers();

    // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");

    // Setter bakgrunnsfarge:
    gl.clearColor(1, 1, 1, 1.0); //RGBA

    // Initialiserer variabel for beregning av FPS:
    fpsData.frameCount = 0;
    fpsData.lastTimeStamp = 0;

    // Start animasjonsløkke:
    draw();
}
