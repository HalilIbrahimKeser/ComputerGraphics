/**
 * Diverse generelle funksjoner.
 */
//Finner min & max x,z og y verdi for alle vertekser til meshet.
//Bruker disse til � beregne hvor mye modellen m� flyttes i x,y og z-retning for � sentreres.
//Kalkulerte verdier knyttes til mesh-objektet som henholdsvis: centerX, centerY og centerZ.
//Disse verdiene kan s� brukes til � sentrere modellen f�r evt. rotasjon om en av aksene.
export function calculateCenterValues(mesh) {
	let minX = 100000, maxX = -10000; //Settes til usansynlig stor og liten verdi.
	let minY = 100000, maxY = -10000;
	let minZ = 100000, maxZ = -10000;
	for (let vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
		if (mesh.geometry.vertices[vertexIndex].x < minX)
			minX = mesh.geometry.vertices[vertexIndex].x;
		if (mesh.geometry.vertices[vertexIndex].y < minY)
			minY = mesh.geometry.vertices[vertexIndex].y;
		if (mesh.geometry.vertices[vertexIndex].z < minZ)
			minZ = mesh.geometry.vertices[vertexIndex].z;

		if (mesh.geometry.vertices[vertexIndex].x > maxX)
			maxX = mesh.geometry.vertices[vertexIndex].x;
		if (mesh.geometry.vertices[vertexIndex].y > maxY)
			maxY = mesh.geometry.vertices[vertexIndex].y;
		if (mesh.geometry.vertices[vertexIndex].z > maxZ)
			maxZ = mesh.geometry.vertices[vertexIndex].z;
	}

	mesh.centerX = -((maxX + minX) / 2);
	mesh.centerY = -((maxY + minY) / 2);
	mesh.centerZ = -((maxZ + minZ) / 2);
}


//Roterer mesh om x-aksen:
export function rotateMeshX(_mesh, _angle) {
	if (_mesh != undefined) {
		//Flytt tilbake:
		_mesh.translateX(-_mesh.centerX);
		_mesh.translateY(-_mesh.centerY);
		_mesh.translateZ(-_mesh.centerZ);
		_mesh.rotation.x = _angle;
		//Sentrer:
		_mesh.translateX(_mesh.centerX);
		_mesh.translateY(_mesh.centerY);
		_mesh.translateZ(_mesh.centerZ);
	}
}

//Roterer mesh om y-aksen:
export function rotateMeshY(_mesh, _angle) {
	if (_mesh != undefined) {
		//Flytt tilbake:
		_mesh.translateX(-_mesh.centerX);
		_mesh.translateY(-_mesh.centerY);
		_mesh.translateZ(-_mesh.centerZ);
		_mesh.rotation.y = _angle;
		//Sentrer:
		_mesh.translateX(_mesh.centerX);
		_mesh.translateY(_mesh.centerY);
		_mesh.translateZ(_mesh.centerZ);
	}
}

//Fra: http://blog.thematicmapping.org/2013/10/terrain-building-with-threejs.html
//Returnerer et array (resp) bestående av 16 bits heltall.
export function loadTerrain(file, callback) {
	let xhr = new XMLHttpRequest();
	xhr.responseType = 'arraybuffer';
	xhr.open('GET', file, true);
	xhr.onload = function (evt) {
		if (xhr.response) {
			let resp = new Uint16Array(xhr.response);
			callback(resp);
		}
	};
	xhr.send(null);
}

//Lager heightmap-array basert på bilde (img).
//Returnerer et array med en høydeverdi for hver piksel. Denne er beregnet som r+g+b / n;
//Fra; https://github.com/mrdoob/three.js/issues/1003
export function getHeightData(fileName, _width, _height, callback) {
	let canvas = document.createElement('canvas');
	canvas.width = _width;
	canvas.height = _height;
	let context = canvas.getContext('2d');
	let size = _width * _height;
	let heightData = new Float32Array(size);

	let img = new Image();	//NB! Image-objekt.
	img.onload = function () {
		//Ferdig nedlastet:
		context.drawImage(img, 0, 0);
		for (let i = 0; i < size; i++) {
			heightData[i] = 0;
		}

		//imgd = et ImageData-objekt. Inneholder pikseldata. Hver piksel består av en RGBA-verdi (=4x8 byte).
		let imgd = context.getImageData(0, 0, _width, _height);
		let pix = imgd.data;	//pix = et Uint8ClampedArray - array. 4 byte per piksel. Ligger etter hverandre.

		let j = 0;
		//Gjennomløper pix, piksel for piksel (i += 4). Setter heightData for hver piksel lik summen av fargen / 3 (f.eks.):
		for (let i = 0, n = pix.length; i < n; i += (4)) {
			let all = pix[i] + pix[i + 1] + pix[i + 2];
			heightData[j++] = all / 3;
		}
		callback(heightData);
	};
	//Starter nedlasting:
	img.src = fileName;
}
