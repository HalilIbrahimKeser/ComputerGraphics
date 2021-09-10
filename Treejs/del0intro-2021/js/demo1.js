/**
 * Enkel roterende farget kube - "flat shading".
 *
 * Bruker:
 *  materiale av type MeshBasicMaterial(color)
 */

import * as THREE from '../../lib/three/build/three.module.js';

//Globale varianbler:
let renderer;
let cube;
let scene;
let camera;

let angle = 0.0;
let lastTime = 0.0;

export function main() {
	//Henter referanse til canvaset:
	let mycanvas = document.getElementById('webgl');
	//Lager en scene:
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xdddddd );

	//Oppretter et kamera:
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	//Lager et rendererobjekt (og setter st?rrelse):
	renderer = new THREE.WebGLRenderer({canvas: mycanvas, antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);

	//Definerer geometri og materiale (her kun farge) for en kube:
	let geometry = new THREE.BoxGeometry(1, 1, 1);
	let material = new THREE.MeshBasicMaterial({color: 0xffff00});
	//Oppretter et kubemesh vha. geomatri og materiale:
	cube = new THREE.Mesh(geometry, material);

	//Legger kuben til scenen:
	scene.add(cube);

	//Flytter litt på kamera (står opprinnelig i 0,0,0):
	camera.position.x = 2;
	camera.position.y = 2;
	camera.position.z = 7;

	// Koordinatsystem
	let axesHelper = new THREE.AxesHelper( 30 );
	scene.add( axesHelper );

	animate();
}

function animate(currentTime) {
	window.requestAnimationFrame(animate);
	if (currentTime === undefined)
		currentTime = 0; //Udefinert f?rste gang.

	let elapsed = 0.0; 			// Forl?pt tid siden siste kall p? draw().
	if (lastTime !== 0.0) 		// F?rst gang er lastTime = 0.0.
		elapsed = (currentTime - lastTime) / 1000; //Opererer med sekunder.

	lastTime = currentTime;
	// F?lgende gir 60 graders rotasjon per sekund og 6 sekunder for en hel rotasjon:
	let rotationSpeed = (Math.PI / 3); // Bestemmer rotasjonshastighet.
	angle = angle + (rotationSpeed * elapsed);
	angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

	//Transformerer (roterer) kuben:
	cube.rotation.x = angle;
	//cube.rotation.y = angle;

	//Tegner scenen med gitt kamera:
	renderer.render(scene, camera);
}
