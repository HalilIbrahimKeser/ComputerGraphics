'use strict';
/**
 * Tegner en kube vha. verteks- og indeksbuffer.
 * @type {null}
 */
let gl = null;
let canvas = null;
// Kameraposisjon:
let camPosX = 15;
let camPosY = 7;
let camPosZ = 10;
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
let cubeVertexBuffer = null;
let cubeIndexBuffer = null;
// "Pekere" som brukes til å sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;
// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;
//Animasjon:
let yRot = 0.0;
let lastTime = 0.0;
//Variabel for å beregne og vise FPS:
let fpsData = new Object();//{}; //Setter fpsData til en tomt objekt.

function main() {
	if (!initContext())
		return;
	// Initialiser shadere (cuon-utils).
	let vertexShaderSource = document.getElementById('vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('fragment-shader').innerHTML;
	gl.myShaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
	if (!gl.myShaderProgram) {
		console.log('Feil ved initialisering av shadere. Sjekk shaderkoden.');
		return;
	}

	//Initialiserer matrisene:
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();
	// Setter bakgrunnsfarge:
	gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA
	// Initialiserer verteks- og indeksbuffer:
	initCubeBuffers();
	// Start animasjonsløkka:
	draw();
}

function initContext() {
	canvas = document.getElementById('webgl');
	gl = canvas.getContext('webgl');
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return false;
	}
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);
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

/**
 * Lager først et verteksbuffer bestående av posisjon og farge per verteks.
 * Lager deretter et indeksbuffer som refererer de ulike verteksene vha. indeks.
 * NB! Veldig viktig å angi indeksene til hver trekant i korrekt rekkefølge. Her brukes CCW!
 *
 * Bruker an_array.push(... annet_array) som betyr at verdienen fra annet_array legges til an_array.
 */
function initCubeBuffers() {
	// Et hjelpearray for hver av kubens 8 vertekser:
	let luf = [-1, 1, 1,    1.0, 1.0, 0.0, 1.0];        //left upper front
	let llf = [-1, -1, 1,   1.0, 1.0, 0.0, 1.0];        //left lower front
	let rlf = [1, -1, 1,    1.0, 1.0, 0.0, 1.0];        //right lower front
	let ruf = [1, 1, 1,     1.0, 1.0, 0.0, 1.0];        //right upper front
	let lub = [-1, 1, -1,   1.0, 0.0, 0.0, 1.0];        //left upper back
	let rub = [1, 1, -1,    1.0, 0.0, 0.0, 1.0];        //right upper back
	let llb = [-1, -1, -1,  1.0, 0.0, 0.0, 1.0];        //left lower back
	let rlb = [1, -1, -1,   1.0, 0.0, 0.0, 1.0];        //right lower back
	// Utvider vertices med verdier fra gitt array (merk trepunktum-notasjon);
	let vertices = [];
	vertices.push(... luf);
	vertices.push(... llf);
	vertices.push(... rlf);
	vertices.push(... ruf);
	vertices.push(... lub);
	vertices.push(... rub);
	vertices.push(... llb);
	vertices.push(... rlb);
	// Lager verteksbuffer:
	let cubeVertices = new Float32Array(vertices);
	cubeVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
	cubeVertexBuffer.itemSize = 7;
	cubeVertexBuffer.numberOfItems = cubeVertices.length/7;	// NB!!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Indekser, bruker hjelpevariabler:
	let luf_i = 0;
	let llf_i = 1;
	let rlf_i = 2;
	let ruf_i = 3;
	let lub_i = 4;
	let rub_i = 5;
	let llb_i = 6;
	let rlb_i = 7;
	// Definerer to trekanter per side ved hjelp av indeksene:
	// NB!! VIKTIG å anngi verteksene til hver trekant i korrekt rekkefølge, her CCW:
	let front = [luf_i,llf_i,rlf_i,luf_i,rlf_i,ruf_i];
	let back = [rub_i,llb_i, lub_i, rlb_i, llb_i, rub_i];
	let left = [lub_i, llb_i, llf_i, llf_i, luf_i, lub_i];
	let right = [rub_i, ruf_i, rlf_i, rub_i, rlf_i, rlb_i];
	let top = [lub_i, luf_i, ruf_i, lub_i, ruf_i, rub_i];
	let bottom = [rlf_i, llf_i, llb_i, rlf_i, llb_i, rlb_i];
	// Legger indeksene i et array;
	let indices = [];
	indices.push(... front);
	indices.push(... back);
	indices.push(... left);
	indices.push(... right);
	indices.push(... top);
	indices.push(... bottom);
	// Putter arrayet inn i et Uint16Array-objekt:
	let cubeIndices = new Uint16Array(indices);
	//Indeksbuffer: oppretter, binder og skriver data til bufret:
	cubeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
	cubeIndexBuffer.no_indices = cubeIndices.length;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

//NB! Denne tar i mot aktuelt shaderprogram som parameter:
function initUniforms(shaderProgram) {
	// Kopler shaderparametre med Javascript-variabler:
	// Matriser: u_modelviewMatrix & u_projectionMatrix
	u_modelviewMatrix = gl.getUniformLocation(shaderProgram, 'u_modelviewMatrix');
	u_projectionMatrix = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');
	return true;
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

function drawCube(elapsed) {
	// NB! PASS PÅ DENNE DERSOM FLERE SHADERPAR ER I BRUK!
	// Binder shaderparametre:
	if (!initUniforms(gl.myShaderProgram))
		return;
	gl.useProgram(gl.myShaderProgram);

	let stride = (3 + 4) * 4;
	let colorOfset = 3 * 4;

	// Binder til verteksbufferet for å kople til shaderparametrene:
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
	let a_Position = gl.getAttribLocation(gl.myShaderProgram, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);

	let a_Color = gl.getAttribLocation(gl.myShaderProgram, 'a_Color');
	gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);
	gl.enableVertexAttribArray(a_Color);

	setupCamera();
	modelMatrix.setIdentity();
	modelMatrix.rotate(yRot, 0, 1, 0);
	modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!
	gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

	// Aktiverer INDEKS-buffer før tegning vha. drawElements(...):
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
	gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.no_indices, gl.UNSIGNED_SHORT, 0);
}

function draw(currentTime) {
	//Animasjonsløkke:
	window.requestAnimationFrame(draw);

	//Enables depth testing
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

	//Backface Culling:
	gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

	if (currentTime === undefined)
		currentTime = 0; 	//Udefinert første gang.

	//Beregner og viser FPS:
	if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forløpt...
		//Viser FPS i .html ("fps" er definert i .html fila):
		document.getElementById('fps').innerHTML = fpsData.frameCount;
		fpsData.frameCount = 0;
		fpsData.lastTimeStamp = currentTime; //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
	}

	//Tar høyde for varierende frame rate:
	let elapsed = 0.0;			// Forløpt tid siden siste kalle på draw().
	if (lastTime !== 0.0)		// Først gang er lastTime = 0.0.
		elapsed = (currentTime - lastTime)/1000; // Deler på 1000 for å operere med sekunder.
	lastTime = currentTime;						 // Setter lastTime til currentTime.

	let yRotSpeed = 60; 	// Bestemmer hvor fort kuben skal rotere (uavhengig av FR).
	yRot = yRot + (yRotSpeed * elapsed); 	// Gir ca 60 graders rotasjon per sekund - og 6 sekunder for en hel rotasjon.
	yRot %= 360;			// "Rull rundt" dersom yRot >= 360 grader.

	//Rensk skjermen:
	gl.clear(gl.COLOR_BUFFER_BIT);

	// LESE BRUKERINPUT;
	handleKeys(elapsed);

	//TEGNER:
	drawCube(elapsed);

	//Øker antall frames med 1
	fpsData.frameCount++;
}
