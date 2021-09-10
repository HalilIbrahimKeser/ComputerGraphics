// Globale variabler:
let gl = null;
let canvas = null;

// Kameraposisjon:
let camPosX = 5;
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
let cubePositionBuffer = null;
let cubeColorBuffer = null;

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
let orbRot = 0.0;
let lastTime = 0.0;

//Variabel for å beregne og vise FPS:
let fpsData = new Object();//{}; //Setter fpsData til en tomt objekt.

function main() {
	if (!initContext())
		return;

	// Initialiser shadere (cuon-utils).
	let vertexShaderSource = document.getElementById("vertex-shader").innerHTML;
	let fragmentShaderSource = document.getElementById("fragment-shader").innerHTML;
	gl.myShaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
	if (!gl.myShaderProgram) {
		console.log("Feil ved initialisering av shadere. Sjekk shaderkoden.");
		return;
	}

	//Initialiserer matrisene:
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

	// Setter bakgrunnsfarge:
	gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA

	// Initialiserer verteksbuffer:
	initCubeBuffer();
	// Start animasjonsløkka:
	draw();
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

function initCubeBuffer() {
	//36 stk posisjoner:
	let cubePositions = new Float32Array([
		//Forsiden (pos):
		-1, 1, 1,
		-1,-1, 1,
		1,-1, 1,

		-1,1,1,
		1, -1, 1,
		1,1,1,

		//H�yre side:
		1,1,1,
		1,-1,1,
		1,-1,-1,

		1,1,1,
		1,-1,-1,
		1,1,-1,

		//Baksiden (pos):
		1,-1,-1,
		-1,-1,-1,
		1, 1,-1,

		-1,-1,-1,
		-1,1,-1,
		1,1,-1,

		//Venstre side:
		-1,-1,-1,
		-1,1,1,
		-1,1,-1,

		-1,-1,1,
		-1,1,1,
		-1,-1,-1,

		//Topp:
		-1,1,1,
		1,1,1,
		-1,1,-1,

		-1,1,-1,
		1,1,1,
		1,1,-1,

		//Bunn:
		-1, -1, -1,
		1, -1, 1,
		-1, -1, 1,

		-1, -1, -1,
		1, -1, -1,
		1, -1, 1
	]);

	//Ulike farge for hver side:
	let cubeColors = new Float32Array([
		//Forsiden:
		1.0, 0.0, 0.0, 1,
		1.0, 0.0, 0.0, 1,
		1.0, 0.0, 0.0, 1,

		1.0, 0.0, 0.0, 1,
		1.0, 0.0, 0.0, 1,
		1.0, 0.0, 0.0, 1,

		//H�yre side:
		0.0, 1.0, 0.0, 1,
		0.0, 1.0, 0.0, 1,
		0.0, 1.0, 0.0, 1,

		0.0, 1.0, 0.0, 1,
		0.0, 1.0, 0.0, 1,
		0.0, 1.0, 0.0, 1,

		//Baksiden:
		1.0, 0, 0.0, 1,
		1.0, 0, 0.0, 1,
		1.0, 0, 0.0, 1,

		1.0, 0, 0.0, 1,
		1.0, 0, 0.0, 1,
		1.0, 0, 0.0, 1,

		//Venstre side:
		0.0, 0.0, 1.0, 1,
		0.0, 0.0, 1.0, 1,
		0.0, 0.0, 1.0, 1,

		0.0, 0.0, 1.0, 1,
		0.0, 0.0, 1.0, 1,
		0.0, 0.0, 1.0, 1,

		//Topp
		0.0, 0.0, 1, 1,
		0.0, 0.0, 1, 1,
		0.0, 0.0, 1, 1,

		0.0, 0.0, 1, 1,
		0.0, 0.0, 1, 1,
		0.0, 0.0, 1, 1,

		//Bunn:
		0.5, 0.7, 0.3, 1,
		0.5, 0.7, 0.3, 1,
		0.5, 0.7, 0.3, 1,

		0.5, 0.7, 0.3, 1,
		0.5, 0.7, 0.3, 1,
		0.5, 0.7, 0.3, 1

	]);

	// Verteksbuffer for trekanten:
	cubePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
	cubePositionBuffer.itemSize = 3; 		// NB!!
	cubePositionBuffer.numberOfItems = 36;	// NB!!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! M� kople fra n�r det opereres med flere buffer! Kopler til i draw().

	//Fargebuffer: oppretter, binder og skriver data til bufret:
	cubeColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
	cubeColorBuffer.itemSize = 4; 			// 4 float per farge.
	cubeColorBuffer.numberOfItems = 36; 	// 36 farger.
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

//NB! Denne tar i mot aktuelt shaderprogram som parameter:
function initUniforms(shaderProgram) {
	// Kopler shaderparametre med Javascript-variabler:
	// Matriser: u_modelviewMatrix & u_projectionMatrix
	u_modelviewMatrix = gl.getUniformLocation(shaderProgram, "u_modelviewMatrix");
	u_projectionMatrix = gl.getUniformLocation(shaderProgram, "u_projectionMatrix");
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

function drawCube() {

	// NB! PASS PÅ DENNE DERSOM FLERE SHADERPAR ER I BRUK!
	// Binder shaderparametre:
	if (!initUniforms(gl.myShaderProgram))
		return;
	gl.useProgram(gl.myShaderProgram);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
	let a_Position = gl.getAttribLocation(gl.myShaderProgram, "a_Position");
	gl.vertexAttribPointer(a_Position, cubePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
	let a_Color = gl.getAttribLocation(gl.myShaderProgram, "a_Color");
	gl.vertexAttribPointer(a_Color, cubeColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Color);

	//Still inn kamera:
	setupCamera();
	modelMatrix.setIdentity();
	//Roter  om egen y-akse:
	modelMatrix.rotate(yRot, 0, 1, 0);
	// Slår sammen modell & view til modelview-matrise:
	modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!
	// Sender matriser til shader:
	gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
	// Tegner trekanten:
	gl.drawArrays(gl.TRIANGLES, 0, cubePositionBuffer.numberOfItems);
}

function draw(currentTime) {

	//Sørger for at draw kalles p� nytt:
	window.requestAnimationFrame(draw);

	// GJENNOMSIKTIGHET:
	// Aktiverer fargeblanding (&indirekte gjennomsiktighet).
	//gl.enable(gl.BLEND);
	// Angir blandefunksjon:
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//Enables depth testing
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

	//Backface Culling:
	gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

	if (currentTime === undefined)
		currentTime = 0; 	//Udefinert f�rste gang.

	//Beregner og viser FPS:
	if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forl�pt...
		//Viser FPS i .html ("fps" er definert i .html fila):
		document.getElementById("fps").innerHTML = fpsData.frameCount;
		fpsData.frameCount = 0;
		fpsData.lastTimeStamp = currentTime; //Brukes for � finne ut om det har g�tt 1 sekund - i s� fall beregnes FPS p� nytt.
	}

	//Tar høyde for varierende frame rate:
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

	//TEGNER:
	drawCube();

	//Øker antall frames med 1
	fpsData.frameCount++;
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

	document.addEventListener("keyup", handleKeyUp, false);
	document.addEventListener("keydown", handleKeyDown, false);

	return true;
}
