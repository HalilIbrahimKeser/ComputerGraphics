'use strict';
// Globale variabler:

/*
	LEGG MERKE TIL:
	- Shaderkoden ligger i scrip-tagger i html-fila.
	- Vertekshaderen tar ikke i mot farge (a_Color) her men i stedet en teksturkoordinat (a_TextureCoord).
	- Denne videresendes så vha en varying, v_Texture.
	- Teksturfila (three.png) må lastes ned før man kan ta den i bruk.
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
let squarePositionBuffer = null;
let squareTextureBuffer = null;
let squareColorBuffer = null;
let squareTexture = null;

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

//Variabel for � beregne og vise FPS:
let fpsData = new Object();//{}; //Setter fpsData til en tomt objekt.

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

function initSquareBuffer(textureImage) {
	// POSISJION
	let squarePositions = new Float32Array([
		-10, 0, 10,
		10, 0, 10,
		-10, 0, -10,
		10, 0, -10
	]);

	// TEKSTUR / UV-koordinater:
	let squareUVs = new Float32Array([
		0, 0,
		1, 0,
		0, 1,
		1, 1
	]);

	//Farge
	var squareColors = new Float32Array([
		0.7, 0.0, 0.1, 1,
		0.7, 0.0, 0.1, 1,
		0.7, 0.0, 0.1, 1,
		0.7, 0.0, 0.1, 1
	]);

	// POSISJON:
	squarePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, squarePositions, gl.STATIC_DRAW);
	squarePositionBuffer.itemSize = 3; // NB!!
	squarePositionBuffer.numberOfItems = 4; // NB!!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// FARGE:
	squareColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, squareColors, gl.STATIC_DRAW);
	squareColorBuffer.itemSize = 4;
	squareColorBuffer.numberOfItems = 4;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//TEKSTUR-RELATERT:
	squareTexture = gl.createTexture();
	//Teksturbildet er nå lastet fra server, send til GPU:
	gl.bindTexture(gl.TEXTURE_2D, squareTexture);

	//Unngaa at bildet kommer opp-ned:
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);   //NB! FOR GJENNOMSIKTIG BAKGRUNN!! Sett også gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	//Laster teksturbildet til GPU/shader:
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);

	//Teksturparametre:
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	gl.bindTexture(gl.TEXTURE_2D, null);

	squareTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, squareUVs, gl.STATIC_DRAW);
	squareTextureBuffer.itemSize = 2;
	squareTextureBuffer.numberOfItems = 4;
}

function initUniforms() {
	// Kopler shaderparametre med Javascript-variabler:
	// Matriser: u_modelviewMatrix & u_projectionMatrix
	u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
	u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');

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

function drawSquare() {
	//Teksturspesifikt:
	//Bind til teksturkoordinatparameter i shader:
	gl.bindBuffer(gl.ARRAY_BUFFER, squareTextureBuffer);
	let a_TextureCoord = gl.getAttribLocation(gl.program, 'a_TextureCoord');
	gl.vertexAttribPointer(a_TextureCoord, squareTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_TextureCoord);
	//Aktiver teksturenhet (0):
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, squareTexture);
	//Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
	let samplerLoc = gl.getUniformLocation(gl.program, 'uSampler');
	gl.uniform1i(samplerLoc, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Posisjonsspesifikt:
	gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);
	let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Fargespesifikt;
	gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	gl.vertexAttribPointer(a_Color, squareColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Color);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

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
	// Tegner trekanten:
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squarePositionBuffer.numberOfItems);
}

function draw(currentTime) {

	//S�rger for at draw kalles p� nytt:
	window.requestAnimationFrame(draw);

	if (currentTime === undefined)
		currentTime = 0; 	//Udefinert f�rste gang.

	//Beregner og viser FPS:
	if (currentTime - fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forl�pt...
		//Viser FPS i .html ("fps" er definert i .html fila):
		document.getElementById('fps').innerHTML = fpsData.frameCount;
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

	//TEGN planet og måne:
	drawSquare();

	//Øker antall frames med 1
	fpsData.frameCount++;
}

// Sjekker om value er POT
function isPowerOfTwo1(value)
{
	if (value === 0)
		return false;
	while (value !== 1)
	{
		if (value % 2 !== 0)
			return false;
		value = value/2;
	}
	return true;
}

// Teksturen er nå lastet, fortsetter:
function textureLoadedContinue(textureImage) {
	// Initialiserer verteksbuffer:
	initSquareBuffer(textureImage);

	// Binder shaderparametre:
	if (!initUniforms())
		return;

	// Start animasjonsløkka:
	draw();
}

function main() {

	if (!initContext())
		return;

	// Initialiser shadere (cuon-utils):
	let squareVertexShaderSource = document.getElementById('square-vertex-shader').innerHTML;
	let squareFragmentShaderSource = document.getElementById('square-fragment-shader').innerHTML;
	if (!initShaders(gl, squareVertexShaderSource, squareFragmentShaderSource)) {
		console.log('Feil ved initialisering av shaderkoden. Sjekk koden en gang til.');
		return;
	}

	//Initialiserer matrisen:
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

	// Setter bakgrunnsfarge:
	gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA

	// Laster ned teksturfil fra server, fortsetter i textureLoadedContinue() når nedlastinga er ferdig:
	let textureUrl = 'textures/tree1.png';
	const image = new Image();
	// onload-event:
	image.onload = function() {
		if (isPowerOfTwo1(image.width) && isPowerOfTwo1(image.height)) {
			document.getElementById('img-width').innerHTML = image.width;
			document.getElementById('img-height').innerHTML = image.height;
			textureLoadedContinue(image);
		} else {
			alert('Teksturens høyde og/eller bredde er ikke POT!');
		}
	};
	// onerror-event:
	image.onerror = function() {
		alert('Finner ikke : ' + textureUrl);
	};
	// Starter nedlasting...
	image.src = textureUrl;
}
