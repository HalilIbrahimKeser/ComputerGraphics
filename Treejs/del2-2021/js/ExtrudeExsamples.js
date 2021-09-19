/**
 * ExtrudeGeometry.
 */
import * as THREE from '../../lib/three/build/three.module.js';
import * as SceneUtils from '../../lib/three/examples/jsm/utils/SceneUtils.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from "../../lib/wfa-coord.js";

//Globale varianbler:
let renderer;
let scene;
let camera;
let lastTime;

//Roter & zoom:
let controls;
let SIZE = 500;
let currentlyPressedKeys = {};

export function main() {
    let mycanvas = document.getElementById('webgl');
    scene = new THREE.Scene();
    //Lager et rendererobjekt:
    renderer = new THREE.WebGLRenderer({ canvas: mycanvas, antialias: true });
    renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true; //NB! For skygge.
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //Kamera:
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 150;
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

    //Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    animate();
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function addModels() {
	// Spike vha spline:
	let spikeShape1 = createSpikeSplineShape();
	let spikeMesh1 = createSpikeMesh(spikeShape1);
	spikeMesh1.position.set(-50,0, 0);
	spikeMesh1.scale.set(10,10, 10);
	scene.add(spikeMesh1);

	// Spike vha line:
	let spikeShape2 = createSpikeLineShape();
	let spikeMesh2 = createSpikeMesh(spikeShape2);
	spikeMesh2.position.set(50,0, 0);
	spikeMesh2.scale.set(10,10, 10);
	scene.add(spikeMesh2);

	let halfTube = createHalftube();
	halfTube.position.set(-30, 50, 0);
	scene.add(halfTube);
}

function createSpikeMesh(shape) {
	let extrudeSettings = {
		depth: 0.4,
		bevelEnabled: false,
		bevelSegments: 1,
		steps: 1,
		bevelSize: 1,
		bevelThickness: 0.2
	};
	let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	let spikeMesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color: 0xFF00FF}) );
	spikeMesh.translateOnAxis(new THREE.Vector3(0,-0.2,0), 1);
	spikeMesh.scale.set(0.3, 0.25, 1);
	return spikeMesh;
}

// Smoooth...
function createSpikeSplineShape() {
	let spikeShape = new THREE.Shape();
	spikeShape.moveTo( -4, 0 );
	spikeShape.splineThru([
		new THREE.Vector2(-3, 0.4),
		new THREE.Vector2(-2, 1.2),
		new THREE.Vector2(-1, 3),
		new THREE.Vector2(0, 5),
		new THREE.Vector2(1, 3),
		new THREE.Vector2(2, 1.2),
		new THREE.Vector2(3, 0.4),
		new THREE.Vector2(4, 0),
	]);
	spikeShape.lineTo(4,-1);
	spikeShape.lineTo(-4,-1);
	spikeShape.lineTo(-4,0);
	return spikeShape;
}

// Rette streker
function createSpikeLineShape() {
	let spikeShape = new THREE.Shape();
	spikeShape.moveTo( -4, 0 );
	spikeShape.lineTo(-3, 0.4);
	spikeShape.lineTo(-2, 1.2);
	spikeShape.lineTo(-1, 3);
	spikeShape.lineTo(0, 5);
	spikeShape.lineTo(1, 3);
	spikeShape.lineTo(2, 1.2);
	spikeShape.lineTo(3, 0.4);
	spikeShape.lineTo(4, 0);
	spikeShape.lineTo(4,-1);
	spikeShape.lineTo(-4,-1);
	spikeShape.lineTo(-4,0);
	return spikeShape;
}

// Lokal klasse
class HalfTubeCurve extends THREE.Curve {
	constructor( scale = 1, radius = 1 ) {
		super();
		this.scale = scale;
		this.radius = radius;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		let angle = Math.PI*t;
		const tx = this.radius * Math.sin(angle);
		const ty = this.radius * Math.cos(angle);
		const tz = 0;
		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
	}
}

function createHalftube() {
	let group = new THREE.Group(); // Object3D

	let halfTubeLength = 50;
	const path = new HalfTubeCurve( 8 );
	const geometry = new THREE.TubeGeometry( path, 20, 1.5, 8, false );
	const material = new THREE.MeshBasicMaterial( {color: 0xAAAA00, side: THREE.DoubleSide} );
	const bend = new THREE.Mesh( geometry, material );
	bend.position.set(halfTubeLength,0, 0);
	group.add(bend);

	const geometryCyl = new THREE.CylinderGeometry( 1.5, 1.5, halfTubeLength, 100 );
	const rod1 = new THREE.Mesh( geometryCyl, material );
	rod1.position.set(halfTubeLength/2,8, 0);
	rod1.rotateZ(Math.PI/2);
	group.add(rod1);

	const rod2 = new THREE.Mesh( geometryCyl, material );
	rod2.position.set(halfTubeLength/2,-8, 0);
	rod2.rotateZ(Math.PI/2);
	group.add(rod2);

	group.rotateX(Math.PI/2);
	return group;
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
    if (currentTime == undefined)
        currentTime = 0; //Udefinert f�rste gang.

    let elapsed = 0.0; 			// Forl�pt tid siden siste kall p� draw().
    if (lastTime != 0.0) 		// F�rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime) / 1000; //Opererer med sekunder.

    lastTime = currentTime;

    //Sjekker input:
    keyCheck(elapsed);

    //Oppdater trackball-kontrollen:
    controls.update();

    //Tegner scenen med gitt kamera:
    render();
};

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
