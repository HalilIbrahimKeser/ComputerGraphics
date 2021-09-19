/**
 * En drone bestående av ulike deler som avhenger av hverandre.
 * Merk følgende:
 * Bruker THREE.Group (i stedet for THREE.Object3D)
 * Bruker hjelpefunksjoner fra en annen fil (DroneHelper.js) til å bygge dronen.
 * Bruker .name egenskapen på grupper som skal animeres. Bruker getObjectByName(...) i animate().
 * Bruker emissive for "lysende" kuler.
 * Bruker THREE.Clock for å finne delta i animate()
 * Propellene kan rotere med ulik hastighet (her roterer alle likt).
 */
import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from "../../lib/wfa-coord.js";
import {
	createArmBaseMesh,
	createDroneBaseMesh,
	createEngineMesh,
	createFootMesh,
	createPropellerCoverMesh,
	createPropellerMesh,
	createSphereMesh
} from "./DroneHelper.js";

//Globale varianbler:
let renderer;
let scene;
let camera;

let propellerAngle = 0;
let clock = new THREE.Clock();

let controls;
let currentlyPressedKeys = {};

export function main() {
    let mycanvas = document.getElementById('webgl');
    scene = new THREE.Scene();

    //Rendererobjekt:
    renderer = new THREE.WebGLRenderer({ canvas: mycanvas, antialias: true });
    renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; //NB! For skygge.
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //Kamera:
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.x = 7;
    camera.position.y = 8;
    camera.position.z = 20;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Retningsorientert lys (som gir skygge):
    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight1.position.set(100, 300, 300);
    directionalLight1.target.position.set(0, 0, 0);
    scene.add(directionalLight1);

    //Legg modeller til scenen:
    addModels();

    //Koordinatsystem:
    addCoordSystem(scene);

    //Roter/zoom hele scenen:
    controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

    //Håndterer endring av vindusstørrelse:
    window.addEventListener('resize', onWindowResize, false);
    //Input:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    // Start animasjonsløkka:
    animate();
}

function addModels() {
	let drone = createDrone();
	drone.name = "drone";
	scene.add(drone);
}

/**
 * Hele dronen.
 * @returns {Group}
 */
function createDrone() {
	// Dronekroppen:
	let droneBaseDiameter = 6;
	let droneHeight = 1;
	// Merk: droneBase er et Mesh-objekt (som igjen arver fra Object3D):
	let droneBase = createDroneBaseMesh(droneBaseDiameter, droneHeight);
	//droneBase.position.set(-10, 23, -44);

	// "Pynter" droneBase med noen kuler:
	let radius = droneBaseDiameter/2;
	let noSpheres = 20;     //numberOfSpheres
	let step = (2*Math.PI)/noSpheres;
	for (let angle=0; angle <2*Math.PI; angle+=step) {
		let sphereMesh = createSphereMesh(0.4);
		// Beregne x/z-posisjonen:
		sphereMesh.position.x = radius * Math.cos(angle);
		sphereMesh.position.z = radius * Math.sin(angle);
		// Samme høyde på alle kulene:
		sphereMesh.position.y = droneHeight/2;

		droneBase.add(sphereMesh);
	}

	let droneArm1 = createDroneArm(droneBaseDiameter, droneHeight, 1,  0);
	droneBase.add(droneArm1);

	let droneArm2 = createDroneArm(droneBaseDiameter, droneHeight, 2, Math.PI/2);
	droneBase.add(droneArm2);

	let droneArm3 = createDroneArm(droneBaseDiameter, droneHeight, 3, Math.PI);
	droneBase.add(droneArm3);

	let droneArm4 = createDroneArm(droneBaseDiameter, droneHeight, 4, Math.PI + Math.PI/2);
	droneBase.add(droneArm4);

	return droneBase;
}

/**
 * En dronearm inkludert motor og propell.
 * @param droneDiameter
 * @returns {Group}
 */
function createDroneArm(droneDiameter, droneHeight, armNumber, angle) {
	// Merk: armBase er et Mesh-objekt.
	let armBase = createArmBaseMesh(droneDiameter, droneHeight);
	armBase.rotateY(angle);
	armBase.translateX(droneDiameter);

	let engineBase = createEngineBase(armNumber, droneHeight);
	engineBase.translateX(droneDiameter/2);
	armBase.add(engineBase);

	let footHeight = 2;
	let armFoot = createFootMesh(footHeight);
	armFoot.translateY(-footHeight/2)
	armBase.add(armFoot);

	return armBase;
}

/**
 * Motor og propell m.m.
 * @returns {Group}
 */
function createEngineBase(armNumber, droneHeight) {
	let group = new THREE.Group();
	let height = droneHeight*1.3;
	let motor = createEngineMesh(height);
	group.add(motor);

	let propLengt=6, propHeight=0.1, propWidth=0.7;
	let propeller = createPropeller(armNumber, propLengt, propHeight, propWidth);
	propeller.position.set(0,height/2 + propHeight/2,0)
	//propeller.rotateY(Math.PI/5);
	motor.add(propeller);

	let cover = createPropellerCoverMesh(3);
	cover.translateY(0.5);
	group.add(cover);

	return group;
}

function createPropeller(armNumber, propLengt, propHeight, propWidth) {
	let group = new THREE.Group();
	let blade1 = createPropellerMesh(propLengt/2, propHeight, propWidth);
	blade1.rotateX(Math.PI/7);
	blade1.translateX(propLengt/4)
	group.add(blade1);
	let blade2 = createPropellerMesh(propLengt/2, propHeight, propWidth);
	blade2.rotateX(-Math.PI/7);
	blade2.translateX(-propLengt/4)
	group.add(blade2);

	group.name = "propeller" + String(armNumber);
	return group;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

//Legger til roter/zoom av scenen:
function addControls() {
    controls = new TrackballControls(camera);
    controls.addEventListener('change', render);
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
	// Forløpt tid siden siste kall på draw().
    let elapsed = clock.getDelta();

	let rotationSpeed = 5*Math.PI; // Bestemmer rotasjonshastighet.
	propellerAngle = propellerAngle + (rotationSpeed * elapsed);
	propellerAngle = propellerAngle % (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

    // Roterer propellene:
	let drone = scene.getObjectByName("drone", true);
	let propeller1 = drone.getObjectByName("propeller1", true);
	let propeller2 = drone.getObjectByName("propeller2", true);
	let propeller3 = drone.getObjectByName("propeller3", true);
	let propeller4 = drone.getObjectByName("propeller4", true);
	propeller1.rotation.y = propellerAngle;
	propeller2.rotation.y = propellerAngle;
	propeller3.rotation.y = propellerAngle;
	propeller4.rotation.y = propellerAngle;

    //Sjekker input:
    keyCheck(elapsed);

    //Oppdater trackball-kontrollen:
    controls.update();

    //Tegner scenen med gitt kamera:
    render();
}

//Sjekker tastaturet:
function keyCheck(elapsed) {
    let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.
    //Roter foten:
    if (currentlyPressedKeys[65]) { //A

    }
    if (currentlyPressedKeys[68]) {	//D

    }

    //Roter joint1:
    if (currentlyPressedKeys[83]) {	//S

    }
    if (currentlyPressedKeys[87]) {	//W

    }
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
    render();
}
