/**
 * Funksjoner som tegner et koordinatsystem
 *
 */
import * as THREE from './three/build/three.module.js';

const SIZE = 1000;

//Koordinatsystemet:
export function addCoordSystem(scene) {
	addAxis(1, scene); //x-aksen.
	addAxis(2, scene); //y-aksen.
	addAxis(3, scene); //z-aksen.
}

//Legger til enkeltakse (stiplet for negativ del av aksen)
//Bruker BufferGeometry - klassen.
function addAxis(axis, scene) {
	let fromNeg = [0,0,0];
	let toNeg = [0,0,0];
	let fromPos = [0,0,0];
	let toPos = [0,0,0];
	let axiscolor = 0x000000;

	switch (axis) {
		case 1: //x-aksen
			fromNeg=[-SIZE,0,0];
			toNeg=[0,0,0];
			fromPos=[0,0,0];
			toPos=[SIZE,0,0];
			axiscolor = 0xff0000;
			break;
		case 2: //y-aksen
			fromNeg=[0, -SIZE,0];
			toNeg=[0,0,0];
			fromPos=[0,0,0];
			toPos=[0, SIZE,0];
			axiscolor = 0x00ff00;
			break;
		case 3: //z-aksen
			fromNeg=[0, 0, -SIZE];
			toNeg=[0,0,0];
			fromPos=[0,0,0];
			toPos=[0, 0, SIZE];
			axiscolor = 0x0000ff;
			break;
	}

	let posMat = new THREE.LineBasicMaterial({
		linewidth: 2,
		color: axiscolor
	});
	let negMat = new THREE.LineDashedMaterial( {
		color: 0x000000,
		linewidth: 1,
		scale: 1,
		dashSize: 3,
		gapSize: 1,
	} );

	let gNeg = new THREE.BufferGeometry();
	let gNegVertices = [];
	gNegVertices.push(... fromNeg );
	gNegVertices.push(... toNeg );
	// itemSize = 3 pga. 3 verdier per vertex:
	gNeg.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(gNegVertices), 3 ) );
	let coordNeg = new THREE.Line(gNeg, negMat, THREE.LineSegments);
	coordNeg.computeLineDistances(); // NB!
	scene.add(coordNeg);

	let gPosVertices = [];
	gPosVertices.push(... fromPos );
	gPosVertices.push(... toPos );
	let gPos = new THREE.BufferGeometry();
	// itemSize = 3 pga. 3 verdier per vertex:
	gPos.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(gPosVertices), 3 ) );
	let coordPos = new THREE.Line(gPos, posMat, THREE.LineSegments);
	coordPos.computeLineDistances();
	scene.add(coordPos);
}
