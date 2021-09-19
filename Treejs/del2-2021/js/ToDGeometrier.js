/**
 * Lystest.
 *
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
let controls; //rotere, zoone hele scenen.

let SIZE = 500;

//Tar vare p� tastetrykk:
let currentlyPressedKeys = {};

export function main() {
    //Henter referanse til canvaset:
    let mycanvas = document.getElementById('webgl');

    //Lager en scene:
    scene = new THREE.Scene();

    //Lager et rendererobjekt (og setter st�rrelse):
    renderer = new THREE.WebGLRenderer({ canvas: mycanvas, antialias: true });
    renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true; //NB! For skygge.
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //Kamera:
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 230;
    camera.position.y = 400;
    camera.position.z = 350;
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

    //H�ndterer endring av vindusst�rrelse:
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
    //Plan:
    let gPlane = new THREE.PlaneGeometry(SIZE * 2, SIZE * 2);
    let mPlane = new THREE.MeshLambertMaterial({ color: 0xFF0000, side: THREE.DoubleSide, wireframe: false, wireframeLinewidth: 1 });
    let meshPlane = new THREE.Mesh(gPlane, mPlane);
    meshPlane.rotation.x = Math.PI / 2;
    //scene.add(meshPlane);

	//Circle:
    let radius = SIZE/20;
    let segments = 100;
    let thetaStart = 0;
    let thetaLength = 2*Math.PI;
    let mCircle = new THREE.MeshPhongMaterial({ color: 0xff6611, side: THREE.DoubleSide });
    let gCircle = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength);
    let meshCircle = new THREE.Mesh(gCircle, mCircle);
    meshCircle.rotation.x = Math.PI / 2;
	meshCircle.position.x = 0;
    meshCircle.position.y = 20;
	meshCircle.position.z = -20;
    scene.add(meshCircle);

    //Kube best�ende av delkuber. NB! Bruker multimaterial:
    let mCubeMat1 = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 1 });
    let mCubeMat2 = new THREE.MeshPhongMaterial({ color: 0x10ED09 });

    let gBox = new THREE.BoxGeometry(10, 10, 10, 5, 5, 5);
    let meshBox = SceneUtils.createMultiMaterialObject(gBox, [mCubeMat1, mCubeMat2]);

	meshBox.position.x = 80;
	meshBox.position.y = 10;
    scene.add(meshBox);

	//Ring
	let gRing = new THREE.RingGeometry( 1, 5, 32 );
	let mRing = new THREE.MeshBasicMaterial( { color: 0xf2ff0a, side: THREE.DoubleSide } );
	//let meshRing = new THREE.Mesh( gRing, mRing );
	let meshRing = SceneUtils.createMultiMaterialObject(gRing, [mCubeMat1, mRing]);
	scene.add( meshRing );

	//Shapes:
	addHeartShapeModel();
	addOddShapeModel();

	//Polyhedron
	createPolyhedron();
}

function addHeartShapeModel() {
	let heartShape = new THREE.Shape();

	heartShape.moveTo( 25, 25 );
	heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
	heartShape.bezierCurveTo( 30, 0, 30, 35,30,35 );
	heartShape.bezierCurveTo( 30, 55, 10, 77, 25, 95 );
	heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
	heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
	heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );

	let extrudeSettings = { depth: 100, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

	let geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );

	let hearthMesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
	hearthMesh.rotation.x = Math.PI / 2;
	hearthMesh.position.x = -30;
	hearthMesh.position.y = 40;
	hearthMesh.position.z = -60;
	scene.add(hearthMesh);
}

function addOddShapeModel() {
    // create a basic shape
    let shape = new THREE.Shape();

    // startpoint
    shape.moveTo(10, 10);

    // straight line upwards
    shape.lineTo(10, 40);

    // the top of the figure, curve to the right
    shape.bezierCurveTo(15, 25, 25, 25, 30, 40);

    // spline back down
    shape.splineThru(
      [new THREE.Vector2(32, 30),
        new THREE.Vector2(28, 20),
        new THREE.Vector2(30, 10),
      ])

    // curve at the bottom
    shape.quadraticCurveTo(20, 15, 10, 10);

    // add 'eye' hole one
    let hole1 = new THREE.Path();
    hole1.absellipse(16, 24, 10, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole1);

    // add 'eye hole 2'
    let hole2 = new THREE.Path();
    hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole2);

    // add 'mouth'
    let hole3 = new THREE.Path();
    hole3.absarc(20, 16, 2, 0, Math.PI, true);
    shape.holes.push(hole3);

    let gShape = new THREE.ShapeGeometry(shape);
    //let mShape = new THREE.MeshLambertMaterial({ color: 0x9000EE, side: THREE.DoubleSide });
    let mShape = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 10 });

    let shapeMesh = new THREE.Mesh(gShape, mShape);
    shapeMesh.rotation.x = Math.PI / 2;
    shapeMesh.position.x = -50;
    shapeMesh.position.y = 40;
    scene.add(shapeMesh);
}

//en kube
function createPolyhedron() {
	let verticesOfCube = [
		-1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
		-1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
	];

	let indicesOfFaces = [
		2,1,0,    0,3,2,
		0,4,7,    7,3,0,
		0,1,5,    5,4,0,
		1,2,6,    6,5,1,
		2,3,7,    7,6,2,
		4,5,6,    6,7,4
	];

	let mPoly = new THREE.MeshLambertMaterial({ color: 0x9000EE, side: THREE.DoubleSide });
	let mPolyWireframe = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 10 });
	let gPoly = new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, 6, 1 );  //radius, detail
	//let polyMesh = new THREE.Mesh(gPoly, mPoly);
	let polyMesh = SceneUtils.createMultiMaterialObject(gPoly, [mPoly, mPolyWireframe]);

	//polyMesh.scale.x = 20;
	polyMesh.position.z = -50;
	polyMesh.position.y = 20;
	scene.add(polyMesh);

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
