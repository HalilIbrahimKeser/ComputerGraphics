/**
 * 3D-varianten av papirmannen. Bygger sammensatt figur vha. Object3D - objekter.
 *
 */
//Globale varianbler:
let renderer;
let scene;
let camera;

//rotasjoner
let rightArmRot = 0.0;
let rightUArmRot = 0.0;
let lastTime = 0.0;

//Roter & zoom:
let controls; //rotere, zoone hele scenen.

//Tar vare på tastetrykk:
let currentlyPressedKeys = {};

import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from "../../lib/wfa-coord.js";

export function main() {
	//Henter referanse til canvaset:
	let mycanvas = document.getElementById(`webgl`);

	//Lager en scene:
	scene = new THREE.Scene();

	//Lager et rendererobjekt (og setter størrelse):
	renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
	renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true; //NB!
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

	//Oppretter et kamera:
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 30;
	camera.position.y = 70;
	camera.position.z = 80;
	camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Lys:
	let spotLight = new THREE.SpotLight(0xffffff); //hvitt lys
	spotLight.position.set( 0, 800, 0 );
	spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	spotLight.shadow.camera.near = 200;
	spotLight.shadow.camera.far = 810;
	//spotLight.shadowCameraVisible = true;		//NB!! Viser lyskildens posisjon og utstrekning.
	scene.add(spotLight);

	//Retningsorientert lys:
	let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	directionalLight1.position.set(2, 1, 4);
	scene.add(directionalLight1);

	let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	directionalLight2.position.set(-2, 1, -4);
	scene.add(directionalLight2);

	//Legg modeller til scenen:
	addModels();

	//Koordinatsystem:
	addCoordSystem(scene);
	//Eller...
	//let axisHelper = new THREE.AxisHelper( 500 );
	//scene.add( axisHelper );

	//Roter/zoom hele scenen:
	controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

    //H�ndterer endring av vindusst�rrelse:
    window.addEventListener('resize', onWindowResize, false);

    //Input - standard Javascript / WebGL:
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
	//BoxMan:
	addBoxManModel();
}

let meshTorso;
//Størrelser:
let tW = 10, tH=20, tD=5; 				//torso-Width, Height, Depth
let raW=tW*1.2, raH=tH/10.0, raD=raH;	//righttarm
let laW = tW * 1.2, laH = tH / 10.0, laD = laH;	//righttarm

function addBoxManModel() {
	const loader = new THREE.TextureLoader();
	loader.load(
		'images/metal1.jpg',
		function ( texture ) {
			// Fortsetter . . .:
			let mat = new THREE.MeshPhongMaterial({ map: texture });

			//Geometri-objekter:
			let geoTorso = new THREE.BoxGeometry(tW, tH, tD);
			let geoRA = new THREE.BoxGeometry(raW, raH, raD);
			let geoRUA = new THREE.BoxGeometry(raW, raH, raD);
			let geoLA = new THREE.BoxGeometry(laW, laH, laD);
			let geoLUA = new THREE.BoxGeometry(laW, laH, laD);

			//Rotmesh (Object3D):
			meshTorso = new THREE.Mesh(geoTorso, mat);
			meshTorso.name = "boxManObj";

			//RIGHT arm:
			let meshRA = new THREE.Mesh(geoRA, mat);
			meshRA.name = "rightArmObj";
			meshRA.translateY(tH / 2);	            //Flytter OPP i forhold til torsoen.
			meshRA.translateX(tW / 2 + raW / 2);    //Flytter til HøYRE i forhold til torsoen.
			meshTorso.add(meshRA);
			//Right under arm:
			let meshRUA = new THREE.Mesh(geoRUA, mat);
			meshRUA.name = "rightUnderArmObj";
			meshRUA.translateX(raW);    //Flytter til HØYRE i forhold til RA.
			meshRA.add(meshRUA);        //Legges til overarmen.

			//LETF (over)arm:
			let meshLA = new THREE.Mesh(geoLA, mat);
			meshLA.name = "leftArmObj";
			meshLA.translateY(tH / 2);	    //Flytter OPP i forhold til torsoen.
			meshLA.translateX(-tW / 2 - raW / 2);   //Flytter til VENSTRE i forhold til torsoen.
			meshTorso.add(meshLA);
			//Left under arm:
			let meshLUA = new THREE.Mesh(geoLUA, mat);
			meshLUA.name = "leftUnderArmObj";
			meshLUA.translateX(-raW);   //Flytter til VENSTRE i forhold til LA.
			meshLA.add(meshLUA);        //Legges til overarmen.

			scene.add(meshTorso);

			//NÅ er vi klar til å starte loopen:
			animate();
		},
		undefined,
		function ( err ) {
			console.error( 'Feil ved lasting av teksturfil...' );
		}
	);
}

function animate(currentTime) {
	requestAnimationFrame(animate);
	if (currentTime == undefined)
	    currentTime = 0;

	let elapsed = 0.0;
	if (lastTime != 0.0)
		elapsed = (currentTime - lastTime)/1000;

	lastTime = currentTime;

    //H�YRE ARM (over&under):
	let rightarm = meshTorso.getObjectByName("rightArmObj", true);
	rightarm.translateX(-raW / 2);	    //Flytt til sentrum ...
	rightarm.rotation.z = rightArmRot   //roter ...
	rightarm.translateX(raW / 2);	    //flytt tilbake.

	let rightUarm = meshTorso.getObjectByName("rightUnderArmObj", true);
	rightUarm.translateX(-raW / 2);
	rightUarm.rotation.z = rightUArmRot
	rightUarm.translateX(raW / 2);

    //VENSTRE ARM (over&under)
	let leftarm = meshTorso.getObjectByName("leftArmObj", true);
	leftarm.translateX(raW / 2);
	leftarm.rotation.z = rightArmRot
	leftarm.translateX(-raW / 2);

	let leftUarm = meshTorso.getObjectByName("leftUnderArmObj", true);
	leftUarm.translateX(raW / 2);
	leftUarm.rotation.z = rightUArmRot
	leftUarm.translateX(-raW / 2);

	//Sjekker input:
	keyCheck(elapsed);

	//Oppdater trackball-kontrollen:
	controls.update();

	//Tegner scenen med gitt kamera:
	render();
}

//Sjekker tastaturet:
function keyCheck(elapsed) {
	let rotationSpeed = (Math.PI);

	if (currentlyPressedKeys[65]) { //A
		rightUArmRot = rightUArmRot + (rotationSpeed * elapsed);
		rightUArmRot %= (Math.PI * 2);
    }
	if (currentlyPressedKeys[68]) {	//D
		rightUArmRot = rightUArmRot - (rotationSpeed * elapsed);
		rightUArmRot %= (Math.PI * 2);
    }

    if (currentlyPressedKeys[83]) {	//S
    	rightArmRot = rightArmRot + (rotationSpeed * elapsed);
		rightArmRot %= (Math.PI * 2);
    }
    if (currentlyPressedKeys[87]) {	//W
    	rightArmRot = rightArmRot - (rotationSpeed * elapsed);
		rightArmRot %= (Math.PI * 2);
    }

    if (currentlyPressedKeys[86]) { //V

    }
    if (currentlyPressedKeys[66]) {	//B

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
