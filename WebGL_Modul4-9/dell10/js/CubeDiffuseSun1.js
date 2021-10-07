// Globale variabler:
/*
	LEGG MERKE TIL:
	- I dette eksemplet brukes to ulike shaderpar, et for koordinatsystemet og et for tegning av teksturert kube.
	- Har derfor to forskjellige referanser til shaderprogrammene (gl.coordShaderProgram og gl.cubeShaderProgram).
	- Må også aktivere korrekt shaderprogram før man tegner, f.eks.: gl.useProgram(gl.coordShaderProgram). Se draw-funksjonene.
	- Legg også merke til bruk av funksjonene initUniforms(shaderProgram). Denne kalles i toppen av drawCoord() OG drawCube() for å kople til matrisene.
 */

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
let cubePositionBuffer = null;
let cubeNormalBuffer = null;

let coordPositionBuffer = null;
let coordColorBuffer = null;

let COORD_BOUNDARY = 100;

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
let scale = 1.0;

//Lysvariablene:
let lightDirection = [-10, 6.0, 10.0];
//let lightDirection = [1.0, 0.0, 0.0];
let ambientLightColor = [0.2, 0.2, 0.2];
let diffuseLightColor = [0.1, 0.9, 0.3];

//Variabel for � beregne og vise FPS:
let fpsData = new Object();//{}; //Setter fpsData til en tomt objekt.

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

function initCoordBuffer() {
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
	let coordColors = new Float32Array([
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

function initCubeBuffer() {

	// POSISJONER:
	let cubePositions = new Float32Array([
		//Forsiden (pos):
		-1, 1, 1,
		-1, -1, 1,
		1, -1, 1,

		-1, 1, 1,
		1, -1, 1,
		1, 1, 1,

		//H�yre side:
		1, 1, 1,
		1, -1, 1,
		1, -1, -1,

		1, 1, 1,
		1, -1, -1,
		1, 1, -1,

		//Baksiden:
		1, -1, -1,
		-1, -1, -1,
		1, 1, -1,

		-1, -1, -1,
		-1, 1, -1,
		1, 1, -1,

		//Venstre side:
		-1, -1, -1,
		-1, 1, 1,
		-1, 1, -1,

		-1, -1, 1,
		-1, 1, 1,
		-1, -1, -1,

		//Topp:
		-1, 1, 1,
		1, 1, 1,
		-1, 1, -1,

		-1, 1, -1,
		1, 1, 1,
		1, 1, -1,

		//Bunn:
		-1, -1, -1,
		1, -1, 1,
		-1, -1, 1,

		-1, -1, -1,
		1, -1, -1,
		1, -1, 1
	]);
	cubePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
	cubePositionBuffer.itemSize = 3;
	cubePositionBuffer.numberOfItems = 36;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// NORMALVEKTORER:
	var cubeNormals = new Float32Array([
		//Forsiden:
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,

		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,

		//H�yre side:
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,

		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,

		//Baksiden:
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		//Venstre side:
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,

		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,

		//Topp
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		//Bunn:
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,

		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0
	]);

	cubeNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);
	cubeNormalBuffer.itemSize = 3;
	cubeNormalBuffer.numberOfItems = 36;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
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

	document.getElementById('camera').innerHTML = String(camPosX.toFixed(2)) + ',' + String(camPosY.toFixed(2)) + ',' + String(camPosZ.toFixed(2)) + ',';

	setupCamera();
}

function drawCoord() {
	// NB! PASS PÅ DENNE DERSOM FLERE SHADERPAR ER I BRUK!
	// Binder shaderparametre:
	if (!initUniforms(gl.coordShaderProgram))
		return;
	gl.useProgram(gl.coordShaderProgram);

	gl.bindBuffer(gl.ARRAY_BUFFER, coordPositionBuffer);
	let a_Position = gl.getAttribLocation(gl.coordShaderProgram, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	gl.bindBuffer(gl.ARRAY_BUFFER, coordColorBuffer);
	let a_Color = gl.getAttribLocation(gl.coordShaderProgram, 'a_Color');
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

function drawCube() {

	// NB! PASS PÅ DENNE DERSOM FLERE SHADERPAR ER I BRUK!
	// Binder shaderparametre:
	if (!initUniforms(gl.cubeShaderProgram))
		return;
	gl.useProgram(gl.cubeShaderProgram);

	// Posisjon:
	gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
	let a_Position = gl.getAttribLocation(gl.cubeShaderProgram, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Normalvektor:
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
	let a_Normal = gl.getAttribLocation(gl.cubeShaderProgram, 'a_Normal');
	if (a_Normal !== -1) {  //-1 dersom a_Normal ikke er i bruk i shaderen.
		gl.vertexAttribPointer(a_Normal, cubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Normal);
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Lysvariabler:
	let u_DiffuseLightColor = gl.getUniformLocation(gl.cubeShaderProgram, 'u_diffuseLightColor');
	let u_AmbientLightColor = gl.getUniformLocation(gl.cubeShaderProgram, 'u_ambientLightColor');
	let u_lightDirection = gl.getUniformLocation(gl.cubeShaderProgram, 'u_lightDirection');

	let u_normalMatrix = gl.getUniformLocation(gl.cubeShaderProgram, 'u_normalMatrix');

	gl.uniform3fv(u_lightDirection, lightDirection);
	gl.uniform3fv(u_AmbientLightColor, ambientLightColor);
	gl.uniform3fv(u_DiffuseLightColor, diffuseLightColor);

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

	//Beregner og sender inn matrisa som brukes til å transformere normalvektorene:
	let normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, modelMatrix.elements);  //NB!!! mat3.normalFromMat4! SE: gl-matrix.js
	gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);

	// Tegner:
	gl.drawArrays(gl.TRIANGLES, 0, cubePositionBuffer.numberOfItems);
}

function draw(currentTime) {

	//Sørger for at draw kalles p� nytt:
	window.requestAnimationFrame(draw);

	// GJENNOMSIKTIGHET:
	// Aktiverer fargeblanding (&indirekte gjennomsiktighet):
	//gl.enable(gl.BLEND);
	// Angir blandefunksjon:
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//NB! Backface Culling:
	gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

	if (currentTime === undefined)
		currentTime = 0; 	//Udefinert f�rste gang.

	//Beregner og viser FPS:
	if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forl�pt...
		//Viser FPS i .html ("fps" er definert i .html fila):
		document.getElementById('fps').innerHTML = fpsData.frameCount;
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
	drawCoord();
	drawCube();

	//Øker antall frames med 1
	fpsData.frameCount++;
}

function initContext() {
	// Hent <canvas> elementet
	canvas = document.getElementById('webgl');

	// Rendering context for WebGL:
	gl = canvas.getContext('webgl');
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return false;
	}

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	return true;
}

function main() {

	if (!initContext())
		return;

	// Initialiser shadere (cuon-utils).
	// I dette eksemplet brukes to ulike shaderpar.

	// Coord-shader (fra html-fila):
	let coordVertexShaderSource = document.getElementById('coord-vertex-shader').innerHTML;
	let coordFragmentShaderSource = document.getElementById('coord-fragment-shader').innerHTML;
	gl.coordShaderProgram = createProgram(gl, coordVertexShaderSource, coordFragmentShaderSource);
	if (!gl.coordShaderProgram) {
		console.log('Feil ved initialisering av shaderkoden til coord. Sjekk shaderkoden.');
		return;
	}
	// Cube-shader:
	let cubeVertexShaderSource = document.getElementById('cube-vertex-shader').innerHTML;
	let cubeFragmentShaderSource = document.getElementById('cube-fragment-shader').innerHTML;
	gl.cubeShaderProgram = createProgram(gl, cubeVertexShaderSource, cubeFragmentShaderSource);
	if (!gl.cubeShaderProgram) {
		console.log('Feil ved initialisering av shaderkoden. Sjekk shaderkoden.');
		return;
	}

	//Initialiserer matrisene:
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

	// Setter bakgrunnsfarge:
	gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA

	document.getElementById('light-direction').innerHTML = String(lightDirection);
	document.getElementById('diffuse-light-color').innerHTML = String(diffuseLightColor);
	document.getElementById('ambient-light').innerHTML = String(ambientLightColor);
	document.getElementById('camera').innerHTML = String(camPosX) + ',' + String(camPosY) + ',' + String(camPosZ) + ',';

	// Initialiserer verteksbuffer:
	initCubeBuffer();
	initCoordBuffer();
	// Start animasjonsløkka:
	draw();
}
