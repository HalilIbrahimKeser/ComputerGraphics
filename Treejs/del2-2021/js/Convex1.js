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

//Tar vare p? tastetrykk:
let currentlyPressedKeys = {};
let myFont;

import * as THREE from '../../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem} from "../../lib/wfa-coord.js";
import { ConvexGeometry } from '../../lib/three/examples/jsm/geometries/ConvexGeometry.js';

export function main() {
    //Henter referanse til canvaset:
    let mycanvas = document.getElementById('webgl');

    //Lager en scene:
    scene = new THREE.Scene();

    //Lager et rendererobjekt (og setter st?rrelse):
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
    directionalLight1.position.set(100, 50, 100);
    directionalLight1.target.position.set(0, 0, 0);
    scene.add(directionalLight1);

    //H?ndterer endring av vindusst?rrelse:
    window.addEventListener('resize', onWindowResize, false);

    //Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    //Roter/zoom hele scenen:
    controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

    //Legg modeller til scenen:
    loadFont();  //Laster font
}

//Laster font til 3D-tekst:
function loadFont() {
    let loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (response) {
        myFont = response;

        //Fortsetter;
        addModels();
        //Koordinatsystem:
        addCoordSystem(scene);
        animate();
    });
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function addModels() {

    //Convex hull:
    createConvexMesh();

    //Lathe:
    createLatheMesh();

    //Extrudemesh:
    createExtrudeMesh();

    //3D text:
    add3DText("Hei verden!", 100, 100, -50);
}


function createConvexMesh() {
    // add 100 random points / spheres:
    let points = [];
    for (let i = 0; i < 100; i++) {
        let randomX = -255 + Math.round(Math.random() * 510);
        let randomY = -150 + Math.round(Math.random() * 300);
        let randomZ = -200 + Math.round(Math.random() * 400);
        points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }

    /*
    let group = new THREE.Object3D();
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false });
    points.forEach(function (point) {
        let geom = new THREE.SphereGeometry(0.2);
        let mesh = new THREE.Mesh(geom, material);
        mesh.position.clone(point);
        group.add(mesh);
    });
    */
    //scene.add(group);

    // add the points as a group to the scene
    let mConvex = new THREE.MeshLambertMaterial({ color: 0xff6611, side: THREE.DoubleSide });
    let gConvex = new ConvexGeometry(points);
    let meshConvex = new THREE.Mesh(gConvex, mConvex);
    meshConvex.position.x = -400;
    meshConvex.position.z = -400;
    scene.add(meshConvex);
}

function createLatheMesh() {
    let points = [];
    let height = 5;
    let count = 30;
    for (let i = 0; i < count; i++) {
        points.push(new THREE.Vector2((Math.sin(i * 0.2) + Math.cos(i * 0.3)) * height + 12, (i - count) + count / 2));
    }
    let gLathe = new THREE.LatheGeometry(points, 12, 0, 2 * Math.PI);
    let mLathe = new THREE.MeshLambertMaterial({ color: 0x88EE79, side: THREE.DoubleSide });
    let meshLathe = new THREE.Mesh(gLathe, mLathe);
    scene.add(meshLathe);
}

function createExtrudeMesh() {
    let options = {
        amount: 10,
        bevelThickness: 2,
        bevelSize: 1,
        bevelSegments: 3,
        bevelEnabled: false,
        curveSegments: 12,
        steps: 1
    };

    let gExtrude = new THREE.ExtrudeGeometry(getShape(), options);
    let mExtrude = new THREE.MeshLambertMaterial({ color: 0xFF00EE, side: THREE.DoubleSide });
    let meshExtrude = new THREE.Mesh(gExtrude, mExtrude);
    scene.add(meshExtrude);
}

function getShape() {
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
    hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole1);

    // add 'eye hole 2'
    let hole2 = new THREE.Path();
    hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole2);

    // add 'mouth'
    let hole3 = new THREE.Path();
    hole3.absarc(20, 16, 2, 0, Math.PI, true);
    shape.holes.push(hole3);

    return shape;
}

//Legger til 3D tekst:
function add3DText(text, x, y, z) {
    let options = {
        font: myFont,
        size: 30,
        height: 15,
        curveSegments: 12,
        bevelThickness: 2,
        bevelSize: 4,
        bevelEnabled: true,
        material: 0,
        extrudeMaterial: 1
    };

    let gText = new THREE.TextGeometry(text, options);
    let mText = new THREE.MeshLambertMaterial({ color: 0xFF00EE, side: THREE.DoubleSide });
    let meshText = new THREE.Mesh(gText, mText);
    meshText.position.x = 80;
    meshText.position.z = 80;

    scene.add(meshText);
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
        currentTime = 0; //Udefinert f?rste gang.

    let elapsed = 0.0; 			// Forl?pt tid siden siste kall p? draw().
    if (lastTime != 0.0) 		// F?rst gang er lastTime = 0.0.
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
