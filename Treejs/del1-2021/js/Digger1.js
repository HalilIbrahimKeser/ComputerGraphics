/**
 * Graverarm vha. Object3D - objekter.
 *
 */
//Globale varianbler:
let renderer;
let scene;
let camera;

//rotasjoner
let baseRot = 0.0;
let joint1Rot = 0.0;
let joint2Rot = 0.0;
let lastTime = 0.0;

//Roter & zoom:
let controls; //rotere, zoone hele scenen.

let SIZE = 500;

let digger;										//Hele graverearmen.

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

    renderer.shadowMap.enabled = true; //NB!
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //Oppretter et kamera:
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 230;
    camera.position.y = 400;
    camera.position.z = 350;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Lys:
    /*
	let spotLight = new THREE.SpotLight(0xffffff); //hvitt lys
	spotLight.position.set( 0, 800, 0 );
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;
	spotLight.shadowCameraNear = 200;
	spotLight.shadowCameraFar = 810;
	spotLight.shadowCameraVisible = true;		//NB!! Viser lyskildens posisjon og utstrekning.
	scene.add(spotLight);
    */

    //Retningsorientert lys (som gir skygge):
    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight1.position.set(50, 300, 50);;
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.near = 0;
    directionalLight1.shadow.camera.far = 301;
    directionalLight1.shadow.camera.left = -250;
    directionalLight1.shadow.camera.right = 250;
    directionalLight1.shadow.camera.top = 250;
    directionalLight1.shadow.camera.bottom = -250;
    directionalLight1.shadow.camera.visible = true;

    //Hjelpeklasse for å vise lysets utstrekning:
	let lightCamHelper = new THREE.CameraHelper( directionalLight1.shadow.camera );
	scene.add( lightCamHelper );

    scene.add(directionalLight1);

	/*
	let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	directionalLight2.position.set(-2, 1, -4);
	scene.add(directionalLight2);
	*/

    //Roter/zoom hele scenen:
    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    //Legg modeller til scenen:
    addModels();

    //Koordinatsystem:
    addCoordSystem(scene);

    //Håndterer endring av vindusstørrelse:
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
    //Plan:
    let gPlane = new THREE.PlaneGeometry(SIZE * 2, SIZE * 2);
    let mPlane = new THREE.MeshLambertMaterial({ color: 0x91aff11, side: THREE.DoubleSide });
    let meshPlane = new THREE.Mesh(gPlane, mPlane);
    meshPlane.rotation.x = Math.PI / 2;
    meshPlane.receiveShadow = true;	//NB!
    scene.add(meshPlane);

    //Gravearm:
    addDiggerModel();
}

function addDiggerModel() {
    //Konteiner for hele armen:
    digger = new THREE.Object3D();

    const loader = new THREE.TextureLoader();
    //Foot
    loader.load(
        'images/metal1.jpg',
        function ( texture ) {
            let material = new THREE.MeshPhongMaterial({ map: texture });
            let gFoot = new THREE.CylinderGeometry(20, 30, 10, 20, 5, false);
            let meshFoot = new THREE.Mesh(gFoot, material);
            meshFoot.name = "foot";
            meshFoot.position.x = 0;
            meshFoot.position.y = 5;
            meshFoot.position.z = 0;
            digger.add(meshFoot);

            //LowerArm:
            let gLowerArm = new THREE.CylinderGeometry(4, 4, 100, 8, 1, false);
            let meshLowerArm = new THREE.Mesh(gLowerArm, material);
            meshLowerArm.name = "LowerArm";
            meshLowerArm.position.x = 0;
            meshLowerArm.position.y = 60;	//Flytter opp 50 (halvparten av sylinderens h�yde) + 10 (h�yde p� foten)
            meshLowerArm.position.z = 0;
            digger.add(meshLowerArm);

            //ArmAndJoint1:
            let armAndJoint1 = new THREE.Object3D();
            armAndJoint1.position.x = 0;
            armAndJoint1.position.y = 10 + 100;
            armAndJoint1.position.z = 0;
            armAndJoint1.name = "armAndJoint1";
            //joint1:
            let gJoint1 = new THREE.SphereGeometry(10, 8, 6);					//radius, widthSegments, heightSegments,
            let meshJoint1 = new THREE.Mesh(gJoint1, material);
            meshJoint1.castShadow = true;
            meshJoint1.name = "joint1";
            armAndJoint1.add(meshJoint1);
            //armAndJoint1.rotation.x = Math.PI / 3;
            //arm1:
            let gMidArm = new THREE.CylinderGeometry(4, 4, 100, 8, 1, false);
            let meshMidArm = new THREE.Mesh(gMidArm, material);
            meshMidArm.castShadow = true;
            meshMidArm.name = "MidArm";
            meshMidArm.position.x = 0;
            meshMidArm.position.y = 50;
            meshMidArm.position.z = 0;
            armAndJoint1.add(meshMidArm);
            digger.add(armAndJoint1);

            //ArmAndJoint2:
            let armAndJoint2 = new THREE.Object3D();
            armAndJoint2.position.x = 0;
            armAndJoint2.position.y = 10 + 100;
            armAndJoint2.position.z = 0;
            armAndJoint2.name = "armAndJoint2";
            //joint1:
            let gJoint2 = new THREE.SphereGeometry(10, 8, 6);					//radius, widthSegments, heightSegments,
            let meshJoint2 = new THREE.Mesh(gJoint2, material);
            meshJoint2.name = "joint2";
            meshJoint2.castShadow = true;
            armAndJoint2.add(meshJoint2);
            //armAndJoint2.rotation.x = Math.PI / 3;
            //arm2:
            let gUpperArm = new THREE.CylinderGeometry(4, 4, 100, 8, 1, false);
            let meshUpperArm = new THREE.Mesh(gUpperArm, material);
            meshUpperArm.castShadow = true;
            meshUpperArm.name = "UpperArm";
            meshUpperArm.position.x = 0;
            meshUpperArm.position.y = 50;
            meshUpperArm.position.z = 0;
            armAndJoint2.add(meshUpperArm);

            armAndJoint1.add(armAndJoint2);

            scene.add(digger);

            //NÅh er vi klar til å starte loopen:
            animate();
        },
        // onProgress callback currently not supported
        undefined,
        // onError callback
        function ( err ) {
            console.error( 'An error happened.' );
        }
    );
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    if (currentTime == undefined)
        currentTime = 0; //Udefinert f�rste gang.

    let elapsed = 0.0; 			// Forl�pt tid siden siste kall p� draw().
    if (lastTime != 0.0) 		// F�rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime) / 1000; //Opererer med sekunder.

    lastTime = currentTime;

    //Roterer heile skjiten:
    digger.rotation.y = baseRot;
    let armAndJoint1 = digger.getObjectByName("armAndJoint1", true);  //true = recursive...
    armAndJoint1.rotation.x = joint1Rot;

    let armAndJoint2 = digger.getObjectByName("armAndJoint2", true);  //true = recursive...
    armAndJoint2.rotation.x = joint2Rot;

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
        baseRot = baseRot + (rotationSpeed * elapsed);
        baseRot %= (Math.PI * 2); // "Rull rundt" dersom baseRot >= 360 grader.
    }
    if (currentlyPressedKeys[68]) {	//D
        baseRot = baseRot - (rotationSpeed * elapsed);
        baseRot %= (Math.PI * 2); // "Rull rundt" dersom baseRot >= 360 grader.
    }

    //Roter joint1:
    if (currentlyPressedKeys[83]) {	//S
        joint1Rot = joint1Rot + (rotationSpeed * elapsed);
        joint1Rot %= (Math.PI * 2); // "Rull rundt" dersom joint1Rot >= 360 grader.
    }
    if (currentlyPressedKeys[87]) {	//W
        joint1Rot = joint1Rot - (rotationSpeed * elapsed);
        joint1Rot %= (Math.PI * 2); // "Rull rundt" dersom joint1Rot >= 360 grader.
    }

    //Roter joint2:
    if (currentlyPressedKeys[86]) { //V
        joint2Rot = joint2Rot + (rotationSpeed * elapsed);
        joint2Rot %= (Math.PI * 2); // "Rull rundt" dersom joint2Rot >= 360 grader.
    }
    if (currentlyPressedKeys[66]) {	//B
        joint2Rot = joint2Rot - (rotationSpeed * elapsed);
        joint2Rot %= (Math.PI * 2); // "Rull rundt" dersom joint2Rot >= 360 grader.
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
