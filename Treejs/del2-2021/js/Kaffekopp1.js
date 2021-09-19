/**
 * Kaffekoppen.
 * Merk:
 * Bruker THREE.Group
 * Bruker Torus til hank og Lathe til koppen.
 * Laster flere teksturer.
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
let loadedTexures={};

import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem} from "../../lib/wfa-coord.js";

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
    camera.position.x = 5;
    camera.position.y = 3;
    camera.position.z = 5;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Retningsorientert lys (som gir skygge):
    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight1.position.set(0, 15, 0);
    directionalLight1.target.position.set(0, 0, 0);
    scene.add(directionalLight1);

    //Retningsorientert lys (som gir skygge):
    let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight2.position.set(1, 0.5, 10);
    directionalLight2.target.position.set(0, 0, 0);
    scene.add(directionalLight2);

    //H?ndterer endring av vindusst?rrelse:
    window.addEventListener('resize', onWindowResize, false);

    //Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    //Roter/zoom hele scenen:
    controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);
    addCoordSystem(scene);
    loadTextures();
    animate();
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function loadTextures() {
    // Laster ned FLERE teksturer:
    let texturesToLoad = [
        {name: 'coffeeTexture', url: 'images/water1.png'},
        {name: 'cupTexture', url: 'images/metal_tread_plate1.jpg'},
    ];
    const loader = new THREE.TextureLoader();
    for ( let image of texturesToLoad ) {
        loader.load(
            image.url,
            (texture) => {
                // Legger lastet tekstur i loadedTexures:
                loadedTexures[image.name] = texture;
                // Fjerner et og et element fra texturesToLoad:
                texturesToLoad.splice( texturesToLoad.indexOf(image), 1);
                // Når texturesToLoad er tomt er vi ferdig med lasting av teksturer:
                if ( texturesToLoad.length === 0) {
                    createCup();
                }
            },
            () => {
            },
            ()=> {
                console.error( 'Feil ved lasting av teksturfil...' );
            }
        );
    }
}

function createCup() {
    let cup = new THREE.Group();
    cup.position.x = 0;
    cup.position.y = 0;
    cup.position.z = 0;

    let materialCup = new THREE.MeshPhongMaterial({map : loadedTexures['cupTexture'], side: THREE.DoubleSide});	//NB! MeshPhongMaterial

    // Bunnen
    let geometryCylinder = new THREE.CylinderGeometry( 0.4, 0.4, 0.05, 32 );
    let materialCylinder = materialCup; //new THREE.MeshLambertMaterial({ color: 0x88EE79, side: THREE.DoubleSide });
    let bottomMesh = new THREE.Mesh( geometryCylinder, materialCylinder );

    //Koppen/Lathe:
    let points = [];
    for (let x = 0; x < 1; x=x+0.01) {
        let y = Math.pow(x,5)*2;
        points.push(new THREE.Vector2(x,y));
    }
    let geometryCup = new THREE.LatheGeometry(points, 128, 0, 2 * Math.PI);
    let meshCup = new THREE.Mesh(geometryCup, materialCup);
    bottomMesh.add(meshCup);

    // Kaffen
    let geometryCoffee = new THREE.CircleGeometry( 0.9, 32 );
    let materialCoffee = new THREE.MeshPhongMaterial({color:0x7F4600, map : loadedTexures['coffeeTexture']});	//NB! MeshPhongMaterial
    let coffeeMesh = new THREE.Mesh( geometryCoffee, materialCoffee );
    coffeeMesh.rotation.x = -Math.PI/2;
    coffeeMesh.position.y = 1.4;
    bottomMesh.add( coffeeMesh );

    // Hanken/torus
    let geometryTorus = new THREE.TorusGeometry( 15, 3, 16, 100, Math.PI );
    let materialTorus = materialCup; //new THREE.MeshLambertMaterial({ color: 0x88EE79, side: THREE.DoubleSide });
    let meshTorus = new THREE.Mesh( geometryTorus, materialTorus );
    meshTorus.rotation.z = -Math.PI/2 - Math.PI/14;
    meshTorus.scale.x=0.035;
    meshTorus.scale.y=0.035;
    meshTorus.scale.z=0.035;
    meshTorus.position.x = 0.8;
    meshTorus.position.y = 1;
    bottomMesh.add( meshTorus );

    cup.add( bottomMesh );
    scene.add(cup);

    // Kloner koppen:
    let cupClone = cup.clone();
    cupClone.position.x = -10;
    cupClone.position.y = 0;
    cupClone.position.z = 7;
    cupClone.rotation.z = -Math.PI/5;
    cupClone.scale.x=3;
    cupClone.scale.y=3;
    cupClone.scale.z=3;

    scene.add(cupClone);
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
}

//Sjekker tastaturet:
function keyCheck(elapsed) {
    if (currentlyPressedKeys[65]) { //A
    }
    if (currentlyPressedKeys[68]) {	//D
    }
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
