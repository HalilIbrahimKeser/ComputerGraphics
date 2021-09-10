/**
 * Styrbaert helikopter med roterende rotor.
 *
 * Tegner et plan.
 * Tegner koordinatsystemet.
 *
 * Definerer et helikopter vha. Object3D-klassen.
 *
 */

//Globale varianbler:
let renderer;
let scene;
let camera;

//rotasjoner
let angle = 0.0;
let lastTime = 0.0;

//Lys:
let light;

//Roter & zoom:
let controls; //rotere, zoone hele scenen.

let SIZE = 200;

let helicopter;									//Helikoptermodellen.
let heliSpeed = 0.2;							//Helokoptrets hastighet.
let speedVector = new THREE.Vector3(3,0,1);		//Fartsvektor.
let positionVector = new THREE.Vector3(3,0,1); 	//Posisjonsvetor.
let delta = Math.PI/100;  						//Hvor mye fartsvektoren roterer
let axis = new THREE.Vector3( 0, 1, 0 );		//Hvilken akse fartsvektoren roterer rundt.

//Tar vare p� tastetrykk:
let currentlyPressedKeys = {};

import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from "../../lib/wfa-coord.js";

export function main() {
	//Henter referanse til canvaset:
	let mycanvas = document.getElementById('webgl');

	//Lager en scene:
	scene = new THREE.Scene();

	//Lager et rendererobjekt (og setter st�rrelse):
	renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
	renderer.setClearColor(0xBFD1FF, 0xff);  //farge, alphaverdi.
	renderer.setSize(window.innerWidth, window.innerHeight);

	//Oppretter et kamera:
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 13;
	camera.position.y = 25;
	camera.position.z = 20;
	camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Lys:
	light = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	light.position.set(2, 1, 4);
	scene.add(light);

	//Legg modeller til scenen:
	addModels();

	//Koordinatsystem:
	addCoordSystem(scene);

	//Roter/zoom hele scenen:
	controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

    //H�ndterer endring av vindusst�rrelse:
	document.addEventListener('resize', onWindowResize, false);
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function addModels() {
	//Plan:
	let gPlane = new THREE.PlaneGeometry( SIZE*2, SIZE*2 );
	let mPlane = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	let meshPlane = new THREE.Mesh( gPlane, mPlane);
	meshPlane.rotation.x = Math.PI / 2;
	scene.add(meshPlane);

	//Helikopter:
	addHeliModel();
}

function addHeliModel() {
	//Konteiner:
	helicopter = new THREE.Object3D();

	// Laster ned FLERE teksturer:
	let texturesToLoad = [
		{name: 'imageCockpit', url: 'images/metal1.jpg'},
		{name: 'imageBody', url: 'images/chocchip.png'},
	];
	let loadedTexures={};
	const loader = new THREE.TextureLoader();
	for ( let image of texturesToLoad ) {
		// Laster bilde vha. TextureLoader:
		loader.load(
			image.url,
			( texture ) => {
				// Legger lastet tekstur i loadedTexures:
				loadedTexures[image.name] = texture;
				// Fjerner et og et element fra texturesToLoad:
				texturesToLoad.splice( texturesToLoad.indexOf(image), 1);
				// Når texturesToLoad er tomt er vi ferdig med lasting av teksturer:
				if ( !texturesToLoad.length ) {
					//Alle teksturer er nå lastet... FORTSETTER:
					//Cockpit:
					let gCockpit = new THREE.SphereGeometry(5, 32, 32);
					let mCockpit = new THREE.MeshPhongMaterial({ map: loadedTexures['imageCockpit'] });
					let meshCockpit = new THREE.Mesh(gCockpit, mCockpit);
					//meshCockpit.castShadow = true;
					meshCockpit.name = "cockpit";
					meshCockpit.position.x = 0;
					meshCockpit.position.y = 0;
					meshCockpit.position.z = 0;
					helicopter.add(meshCockpit);

					//Body:
					let gBody = new THREE.CylinderGeometry(1.0, 4, 12, 8, 4, false);
					let mBody = new THREE.MeshPhongMaterial({ map: loadedTexures['imageBody'] });
					let meshBody = new THREE.Mesh(gBody, mBody);
					//meshBody.castShadow = true;
					meshBody.name = "body";
					meshBody.rotation.z = Math.PI / 2;
					meshBody.position.x = -7;
					meshBody.position.y = 0;
					meshBody.position.z = 0;
					helicopter.add(meshBody);

					//Rotor:
					let gRotor = new THREE.BoxGeometry(0.2, 20, 1);
					let mRotor = new THREE.MeshBasicMaterial({ color:0x00de88});
					let meshRotor = new THREE.Mesh(gRotor, mRotor);
					meshRotor.name = "rotor";
					meshRotor.rotation.z = Math.PI / 2;
					meshRotor.rotation.y = Math.PI / 5;
					meshRotor.position.x = 0;
					meshRotor.position.y = 5;
					meshRotor.position.z = 0;
					helicopter.add(meshRotor);

					//Bakrotor:
					let gBRotor = new THREE.BoxGeometry(5, 1, 0.2);
					let mBRotor = new THREE.MeshBasicMaterial({ color:0x00de88});
					let meshBRotor = new THREE.Mesh(gBRotor, mBRotor);
					meshBRotor.name = "bakrotor";
					meshBRotor.position.x = -13.0;
					meshBRotor.position.y = 1;
					meshBRotor.position.z = 0;
					helicopter.add(meshBRotor);

					scene.add(helicopter);

					//Flytter hele helikoptret:
					helicopter.position.y = 20;

					// Starter løkka!
					animate();
				}
				console.log('[TextureLoader] Loaded %o', image.name);
			},
			undefined,
			function ( err ) {
				console.error( 'Feil ved lasting av teksturfil...' );
			});
	}
}

//Legger til roter/zoom av scenen:
function addControls() {
	controls = new TrackballControls(camera);
	controls.addEventListener( 'change', render);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 10;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
}

function animate(currentTime) {
	requestAnimationFrame(animate);
	if (currentTime == undefined)
	    currentTime = 0; //Udefinert f�rste gang.

	let elapsed = 0.0; 			// Forl�pt tid siden siste kall p� draw().
	if (lastTime != 0.0) 		// F�rst gang er lastTime = 0.0.
		elapsed = (currentTime - lastTime)/1000; //Opererer med sekunder.

	lastTime = currentTime;

	let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.
	angle = angle + (rotationSpeed * elapsed);
	angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

	//Roterer helikoptrets rotor:
	let rotor = helicopter.getObjectByName("rotor", true);  //true = recursive...
	//showDebug("rotor.name=" + rotor.name);
	if (rotor != undefined)
		rotor.rotation.y = angle;
	let bakrotor = helicopter.getObjectByName("bakrotor", true);  //true = recursive...
	if (bakrotor != undefined)
		bakrotor.rotation.z = angle;

	positionVector.x = positionVector.x + (speedVector.x * heliSpeed);
	//positionVector.y = 0;
	positionVector.z = positionVector.z + (speedVector.z * heliSpeed);

	helicopter.position.x = positionVector.x;
	helicopter.position.z = positionVector.z;

	helicopter.rotation.y = getRotationAngleUsingAtan2();

	//Sjekker input:
	keyCheck();

	//Oppdater trackball-kontrollen:
	controls.update();
	//Tegner scenen med gitt kamera:
	render();
};

//Sjekker tastaturet:
function keyCheck() {
	if (currentlyPressedKeys[65]) { //A
		let matrix = new THREE.Matrix4().makeRotationAxis( axis, delta );
		speedVector.applyMatrix4( matrix );
	}
	if (currentlyPressedKeys[83]) {	//S
		heliSpeed-=0.01;
		if (heliSpeed<=0)
			heliSpeed = 0.0;
	}
	if (currentlyPressedKeys[87]) {	//W
		heliSpeed+=0.01;
		if (heliSpeed>=10)
			heliSpeed = 1.0;
	}
	if (currentlyPressedKeys[68]) {	//D
		let matrix = new THREE.Matrix4().makeRotationAxis( axis, -delta );
		speedVector.applyMatrix4( matrix );
	}

	//H�yde (V/B):
	if (currentlyPressedKeys[86]) { //V
		helicopter.position.y -= 0.3;
	}
	if (currentlyPressedKeys[66]) {	//B
		helicopter.position.y += 0.3;
	}
}

function render()
{
     renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
    render();
}

/*
	Fra: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
	The Math.atan2() function returns the angle in the plane (in radians) between the positive x-axis and the ray from (0,0) to the point (x,y), for Math.atan2(y,x).

	Math.atan2() opererer med et standard 2D koordinatsystem med positiv Y oppover og positiv X til høyre.
	Her opererer vi imidlertid i x/z-planet der z-aksen vil ha motsatt fortegn i forhold til
	tilsvarende y-akse i 2D. Tenk deg at du "bikker" XY-systemet bakover slik at det blir liggende
	oppå XZ-planet: +Y vil da tilsvare -Z

	Math.atan2() opererer med et "normalt" 2D XY-system.
	Vi må derfor trekke fra 90 grader når vi bruker Atan2() funksjonen.
 */
function getRotationAngleUsingAtan2()
{
	return Math.atan2(speedVector.x, speedVector.z) - Math.PI / 2;
};
