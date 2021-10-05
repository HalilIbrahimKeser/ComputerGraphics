'use strict';
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
let cubeTextureBuffer = null;
let cubeTexture = null;

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

function initCubeBuffer(textureImage) {
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

	//Setter uv-koordinater for hver enkelt side av terningen vha. en enkel tekstur.
	//Teksturen / .png-fila må se slik ut, dvs. 2 linjer og 3 kolonner, der hver celle
	//inneholder et "bilde" av et tall (1-6).
	// -------------
	// | 1 | 2 | 3 |
	// |-----------|
	// | 4 | 5 | 6 |
	// -------------

	//Holder etter hvert p� alle uv-koordinater for terningen.
	let uvCoords = [];
	//Front (1-tallet):
	let tl1=[0,1];
	let bl1=[0,0.5];
	let tr1=[0.33333,1];
	let br1=[0.33333,0.5];
	uvCoords = uvCoords.concat(tl1, bl1, br1, tl1, br1, tr1);

	//H�yre side (2-tallet):
	let tl2=[0.33333,1];
	let bl2=[0.33333,0.5];
	let tr2=[0.66666,1];
	let br2=[0.66666,0.5];
	uvCoords = uvCoords.concat(tl2, bl2, br2, tl2, br2, tr2);

	//Baksiden (6-tallet):
	let tl3=[0.66666,0.5];
	let bl3=[0.66666,0];
	let tr3=[1,0.5];
	let br3=[1,0];
	uvCoords = uvCoords.concat(bl3, br3, tl3, br3, tr3, tl3);

	//Venstre (5-tallet):
	let tl4=[0.33333,0.5];
	let bl4=[0.33333,0];
	let tr4=[0.66666,0.5];
	let br4=[0.66666,0];
	uvCoords = uvCoords.concat(bl4, tr4, tl4, br4, tr4, bl4);

	//Toppen (3-tallet):
	let tl5=[0.66666,1];
	let bl5=[0.66666,0.5];
	let tr5=[1,1];
	let br5=[1,0.5];
	uvCoords = uvCoords.concat(bl5, br5, tl5, tl5, br5, tr5);

	//Bunnen (4-tallet):
	let tl6=[0,0.5];
	let bl6=[0,0];
	let tr6=[0.33333,0.5];
	let br6=[0.33333,0];
	// uvCoords = uvCoords.concat(tr6, br6,bl6,tr6,bl6,tl6);
	uvCoords = uvCoords.concat(tr6, bl6, br6,tr6,tl6, bl6);
	let cubeUVs = new Float32Array(uvCoords);

	// POSISJON:
	cubePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
	cubePositionBuffer.itemSize = 3;
	cubePositionBuffer.numberOfItems = 36;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//TEKSTUR-RELATERT:
	cubeTexture = gl.createTexture();
	//Teksturbildet er nå lastet fra server, send til GPU:
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);

	//Unngaa at bildet kommer opp-ned:
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);   //NB! FOR GJENNOMSIKTIG BAKGRUNN!! Sett også gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	//Laster teksturbildet til GPU/shader:
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);

	//Teksturparametre:
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	gl.bindTexture(gl.TEXTURE_2D, null);

	cubeTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubeUVs, gl.STATIC_DRAW);
	cubeTextureBuffer.itemSize = 2;
	cubeTextureBuffer.numberOfItems = 36;
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

	//Teksturspesifikt:
	//Bind til teksturkoordinatparameter i shader:
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
	let a_TextureCoord = gl.getAttribLocation(gl.cubeShaderProgram, 'a_TextureCoord');
	gl.vertexAttribPointer(a_TextureCoord, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_TextureCoord);
	//Aktiver teksturenhet (0):
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	//Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
	let samplerLoc = gl.getUniformLocation(gl.cubeShaderProgram, 'uSampler');
	gl.uniform1i(samplerLoc, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Posisjonsspesifikt:
	gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
	let a_Position = gl.getAttribLocation(gl.cubeShaderProgram, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Still inn kamera:
	setupCamera();

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
	gl.drawArrays(gl.TRIANGLES, 0, cubePositionBuffer.numberOfItems);
}

function draw(currentTime) {

	//Sørger for at draw kalles p� nytt:
	window.requestAnimationFrame(draw);

	// GJENNOMSIKTIGHET:
	// Aktiverer fargeblanding (&indirekte gjennomsiktighet):
	gl.enable(gl.BLEND);
	// Angir blandefunksjon:
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//NB! Backface Culling:
	gl.frontFace(gl.CCW);		//indikerer at trekanter med vertekser angitt i CCW er front-facing!
	gl.enable(gl.CULL_FACE);	//enabler culling.
	gl.cullFace(gl.BACK);		//culler baksider.

	//gl.enable(gl.DEPTH_TEST);
	//gl.depthFunc(gl.LESS)

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

// Teksturen er nå lastet, fortsetter:
function textureLoadedContinue(textureImage) {
	// Initialiserer verteksbuffer:
	initCubeBuffer(textureImage);
	initCoordBuffer();
	// Start animasjonsløkka:
	draw();
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

	// Laster ned teksturfil fra server, fortsetter i textureLoadedContinue() når nedlastinga er ferdig:
	let textureUrl = 'textures/dice2.png';
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
