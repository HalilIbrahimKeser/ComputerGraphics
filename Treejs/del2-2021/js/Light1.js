/**
 * Lystest.
 *
 */
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

import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem} from "../../lib/wfa-coord.js";

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
    directionalLight1.position.set(0, 300, 0);
    directionalLight1.target.position.set(0, 0, 0);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.near = 100;
    directionalLight1.shadow.camera.far = 301;
    directionalLight1.shadow.camera.left = -250;
    directionalLight1.shadow.camera.right = 250;
    directionalLight1.shadow.camera.top = 250;
    directionalLight1.shadow.camera.bottom = -250;

	//Hjelpeklasse som her brukes til � vise lysets utstrekning:
	let camHelper = new THREE.CameraHelper( directionalLight1.shadow.camera );
	scene.add( camHelper );
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
    let mPlane = new THREE.MeshLambertMaterial({ color: 0x91aff11, side: THREE.DoubleSide });
    let meshPlane = new THREE.Mesh(gPlane, mPlane);
    meshPlane.rotation.x = Math.PI / 2;
    meshPlane.receiveShadow = true;	//NB!
    scene.add(meshPlane);

    //Kule MeshNormalMaterial:
    let gSphere = new THREE.SphereGeometry(10, 32, 32);
    let mSphere = new THREE.MeshNormalMaterial({ flatShading: true });
    let meshSphereNormal = new THREE.Mesh(gSphere, mSphere);
	meshSphereNormal.position.set(-50, 60, 45);
	meshSphereNormal.castShadow = true;
    //scene.add(meshSphereNormal);


    //Kule MeshLambertMaterial
    let gSphere1 = new THREE.SphereGeometry(10, 8, 8);
    let mSphere1 = new THREE.MeshLambertMaterial({ color: 0x34A1FF });
    //let mSphere1 = new THREE.MeshLambertMaterial({color: 0xEA0000, flatShading: true});
    let meshSphereLambert = new THREE.Mesh(gSphere1, mSphere1);
    meshSphereLambert.position.set(50, 10, -45);
    //scene.add(meshSphereLambert);

    //Kule MeshPongMaterial
    let gSphere2 = new THREE.SphereGeometry(10, 32, 32);
    //let mSphere2 = new THREE.MeshLambertMaterial({ color: 0xEA0000, shading: THREE.SmoothShading });
    let mSphere2 = new THREE.MeshPhongMaterial({ color: 0xEA0000, flatShading: true });
    let meshSpherePhong = new THREE.Mesh(gSphere2, mSphere2);
    meshSpherePhong.position.set(-50, 40, -45);
	meshSpherePhong.castShadow = true;
    scene.add(meshSpherePhong);
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
