import * as THREE from '../../../lib/three/build/three.module.js';
import {TrackballControls} from '../../../lib/three/examples/jsm/controls/TrackballControls.js';
import {addCoordSystem} from "../../../lib/wfa-coord.js";

let renderer;
let scene;

let camera;
let angle = 0.0;
let lastTime = 0.0;
let lookAtX;
let lookAtY;
let lookAtZ;

//Roter & zoom:
let controls; //rotere, zoome hele scenen.

let SIZE = 200;

let bicycle;
let heliSpeed = 0.0; //TODO
let speedVector = new THREE.Vector3(0.3,0,0.1);
let positionVector = new THREE.Vector3(0.3,0,0.1);
let delta = Math.PI/100;  						//Hvor mye fartsvektoren roterer
let axis = new THREE.Vector3( 0, 1, 0 );		//Hvilken akse fartsvektoren roterer rundt.
let arrowHelper;                                //Fartsvektor (illustrert)

let currentlyPressedKeys = {};

export function main() {
	let mycanvas = document.getElementById('webgl');
	scene = new THREE.Scene();

	//RENDER OBJECT
	renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
	renderer.setClearColor(0xBFD104, 0xff);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	//KAMERA
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 80;
	camera.position.y = 50;
	camera.position.z = 70;
	camera.up = new THREE.Vector3(0, 1, 0);

	lookAtX = 0.0;
	lookAtY = 0.0;
	lookAtZ = 0.0;
    let target = new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
    camera.lookAt(target);

    //SPOT LIGHT
	let spotLight = new THREE.SpotLight(0xffffff);
	spotLight.position.set( 0, 400, 0 );
	spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 512;
	spotLight.shadow.mapSize.height = 512;
	spotLight.shadow.camera.near = 200;
	spotLight.shadow.camera.far = 410;
	scene.add(spotLight);

	// let shadowCamera = new THREE.CameraHelper( spotLight.shadow.camera )
	// scene.add(shadowCamera);

	//DIRECTIONAL LIGHT
	let directionalLight = new THREE.DirectionalLight(0x5055ff, 1.0); //farge, intensitet (1=default)
	directionalLight.position.set(2, 1, 4);
	scene.add(directionalLight);

	addPlane();

	addBicycle();

	addCoordSystem(scene);

	//TRACK MOUSE
	controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);
    //TRACK RESIZE OF WINDOW
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

function addPlane() {
	//Plan:
	let gPlane = new THREE.PlaneGeometry( SIZE*3, SIZE*3 );
	let mPlane = new THREE.MeshLambertMaterial( {color: 0xffffffff, side: THREE.DoubleSide } );
	let meshPlane = new THREE.Mesh( gPlane, mPlane);
	meshPlane.rotation.x = Math.PI / 2;
	meshPlane.receiveShadow = true;	//NB!
	scene.add(meshPlane);

	//Fartsvektor (illustrert):
	arrowHelper = new THREE.ArrowHelper(speedVector, new THREE.Vector3(0, 0.01, 0), heliSpeed*100, 0xff0000);
	scene.add(arrowHelper)
}

function addBicycle() {
	bicycle = new THREE.Object3D();

	let texturesToLoad = [
		{name: 'rammeTexture', url: '../images/black-metal.jpg'},
		{name: 'wheelTexture', url: '../images/rubber_texture1332.jpg'}
	];

	let loadedTexures={};
	const loader = new THREE.TextureLoader();

	for ( let image of texturesToLoad ) {
		loader.load(
			image.url,
			( texture ) => {
				loadedTexures[image.name] = texture;
				texturesToLoad.splice( texturesToLoad.indexOf(image), 1);

				if ( !texturesToLoad.length ) {
					let frame = new THREE.Group();
					frame.position.x = 0;
					frame.position.y = 50;
					frame.position.z = 0;
					frame.scale.x = 20;
					frame.scale.y = 20;
					frame.scale.z = 20;

					// FRAME
					let materialFrameTop = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameTop = new THREE.CylinderGeometry(0.06, 0.06, 3, 30, 1, false, 0, 2*Math.PI)
					let frameMeshTop = new THREE.Mesh( geometryFrameTop, materialFrameTop );
					frameMeshTop.castShadow = true;
					// ITORS - I * T (position) * O (orbit) * R (rotation) * S (scale)  der O = R * T
					frameMeshTop.name = "RammeTop";
					frameMeshTop.position.x = 0;
					frameMeshTop.position.y = 0;
					frameMeshTop.position.z = 0;
					frameMeshTop.rotation.x = 1.75  //<--NB radianer
					frame.add(frameMeshTop);

					let materialFrameBack = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameBack = new THREE.CylinderGeometry(0.08, 0.08, 2, 30, 1, false, 0, 2*Math.PI)
					let frameMeshBack = new THREE.Mesh( geometryFrameBack, materialFrameBack );
					frameMeshBack.castShadow = true;
					frameMeshBack.name = "RammeBak";
					frameMeshBack.position.x = 0;
					frameMeshBack.position.y = -0.7;
					frameMeshBack.position.z = 1.4;
					frameMeshBack.rotation.x = 0.2
					frame.add(frameMeshBack);

					let materialFrameBackTopRight = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameBackTopRight = new THREE.CylinderGeometry(0.03, 0.03, 1.7, 30, 1, false, 0, 2*Math.PI)
					let frameMeshBackTopRight = new THREE.Mesh( geometryFrameBackTopRight, materialFrameBackTopRight );
					frameMeshBackTopRight.castShadow = true;
					frameMeshBackTopRight.name = "RammeBak";
					frameMeshBackTopRight.position.x = 0.08;
					frameMeshBackTopRight.position.y = -0.85;
					frameMeshBackTopRight.position.z = 2.1;

					frameMeshBackTopRight.rotation.x = -0.8
					frame.add(frameMeshBackTopRight);

					let materialFrameBackDownRight = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameBackDownRight = new THREE.CylinderGeometry(0.04, 0.04, 1.55, 30, 2, false, 0, 2*Math.PI)
					let frameMeshBackDownRight = new THREE.Mesh( geometryFrameBackDownRight, materialFrameBackDownRight );
					frameMeshBackDownRight.castShadow = true;
					frameMeshBackDownRight.name = "RammeBak";
					frameMeshBackDownRight.position.x = 0.08;
					frameMeshBackDownRight.position.y = -1.53;
					frameMeshBackDownRight.position.z = 1.95;
					frameMeshBackDownRight.rotation.x = 1.45
					frame.add(frameMeshBackDownRight);

					let materialFrameBackTopLeft = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameBackTopLeft = new THREE.CylinderGeometry(0.03, 0.03, 1.7, 30, 1, false, 0, 2*Math.PI)
					let frameMeshBackTopLeft = new THREE.Mesh( geometryFrameBackTopLeft, materialFrameBackTopLeft );
					frameMeshBackTopLeft.castShadow = true;
					frameMeshBackTopLeft.name = "RammeBak";
					frameMeshBackTopLeft.position.x = -0.08;
					frameMeshBackTopLeft.position.y = -0.85;
					frameMeshBackTopLeft.position.z = 2.1;

					frameMeshBackTopLeft.rotation.x = -0.8
					frame.add(frameMeshBackTopLeft);

					let materialFrameBackDownLeft = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameBackDownLeft = new THREE.CylinderGeometry(0.04, 0.04, 1.55, 30, 2, false, 0, 2*Math.PI)
					let frameMeshBackDownLeft = new THREE.Mesh( geometryFrameBackDownLeft, materialFrameBackDownLeft );
					frameMeshBackDownLeft.castShadow = true;
					frameMeshBackDownLeft.name = "RammeBak";
					frameMeshBackDownLeft.position.x = -0.08;
					frameMeshBackDownLeft.position.y = -1.53;
					frameMeshBackDownLeft.position.z = 1.95;
					frameMeshBackDownLeft.rotation.x = 1.45
					frame.add(frameMeshBackDownLeft);

					let materialFrameFront = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameFront = new THREE.CylinderGeometry(0.07, 0.07, 3.2, 30, 1, false, 0, 2*Math.PI)
					let frameMeshFront = new THREE.Mesh( geometryFrameFront, materialFrameFront );
					frameMeshFront.castShadow = true;
					frameMeshFront.name = "RammeFront";
					frameMeshFront.position.x = 0;
					frameMeshFront.position.y = -0.912;
					frameMeshFront.position.z = -0.2;
					frameMeshFront.rotation.x = -1.1
					frame.add(frameMeshFront);

					let materialFrameFrontSmall = new THREE.MeshPhongMaterial({map : loadedTexures['rammeTexture'], side: THREE.DoubleSide});
					let geometryFrameFrontSmall = new THREE.CylinderGeometry(0.07, 0.07, 0.56, 30, 1, false, 0, 2*Math.PI)
					let frameMeshFrontSmall = new THREE.Mesh( geometryFrameFrontSmall, materialFrameFrontSmall );
					frameMeshFrontSmall.castShadow = true;
					frameMeshFrontSmall.name = "RammeFront";
					frameMeshFrontSmall.position.x = 0;
					frameMeshFrontSmall.position.y = 0;
					frameMeshFrontSmall.position.z = -1.5;
					frameMeshFrontSmall.rotation.x = 0.30
					frame.add(frameMeshFrontSmall);

					// BACK WHEEL
					let materialWheelBack = new THREE.MeshPhongMaterial({map : loadedTexures['wheelTexture'], side: THREE.DoubleSide});
					let geometryWheelBack = new THREE.TorusGeometry(1, 0.07, 50, 100, Math.PI * 2)
					let wheelBackMesh = new THREE.Mesh( geometryWheelBack, materialWheelBack );
					wheelBackMesh.castShadow = true;
					wheelBackMesh.name = "RammeFront";
					wheelBackMesh.position.x = 0;
					wheelBackMesh.position.y = -1.4;
					wheelBackMesh.position.z = 2.5;
					wheelBackMesh.rotation.y = 1.57
					frame.add(wheelBackMesh);


					// STEERING
					let steering = new THREE.Group();
					steering.position.x = 0;
					steering.position.y = 0;
					steering.position.z = 0;
					steering.scale.x = 1;
					steering.scale.y = 1;
					steering.scale.z = 1;

					// FRONT WHEEL
					let materialWheelFront = new THREE.MeshPhongMaterial({map : loadedTexures['wheelTexture'], side: THREE.DoubleSide});
					let geometryWheelFront = new THREE.TorusGeometry(1, 0.07, 50, 100, Math.PI * 2)
					let wheelFrontMesh = new THREE.Mesh( geometryWheelFront, materialWheelFront );
					wheelFrontMesh.castShadow = true;
					wheelFrontMesh.name = "RammeFront";
					wheelFrontMesh.position.x = 0;
					wheelFrontMesh.position.y = -1.4;
					wheelFrontMesh.position.z = -2;
					wheelFrontMesh.rotation.y = 1.57
					steering.add(wheelFrontMesh);

					bicycle.add(frame)
					bicycle.add(steering)
					scene.add(bicycle)

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
	if (currentTime === undefined)
	    currentTime = 0; //Udefinert første gang.

	let elapsed = 0.0; 			// Forløpt tid siden siste kall på draw().
	if (lastTime !== 0.0) 		// Først gang er lastTime = 0.0.
		elapsed = (currentTime - lastTime)/1000; //Opererer med sekunder.

	lastTime = currentTime;

	//let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.
	//angle = angle + (rotationSpeed * elapsed);
	//angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

	// //Roterer helikoptrets rotor:
	//let rotor = bicycle.getObjectByName("steering", true);  //true = recursive...

	//Sjekker input:
	keyCheck();

	//Oppdater trackball-kontrollen:
	controls.update();

	//Tegner scenen med gitt kamera:
	render();
}

function keyCheck() {

	if (currentlyPressedKeys[65]) { //A
		camera.position.x = camera.position.x - 30 * (Math.PI/180)
		controls.update();

		// camera.rotation.x  += 10 * (Math.PI/180);
		// controls.update();
	}

	if (currentlyPressedKeys[68]) { //D
		camera.position.x = camera.position.x + 30 * (Math.PI/180)
		controls.update();
	}

	if (currentlyPressedKeys[87]) { //W
		camera.position.y = camera.position.y + 30 * (Math.PI/180)
		controls.update();
	}
	if (currentlyPressedKeys[83]) { //S
		camera.position.y = camera.position.y - 30 * (Math.PI/180)
		controls.update();
	}

	// //RETNING
	// if (currentlyPressedKeys[74]) { //J
	// 	let matrix = new THREE.Matrix4().makeRotationAxis( axis, delta );
	//    	speedVector.applyMatrix4( matrix );
    // }
    // if (currentlyPressedKeys[75]) {	//K
    // 	heliSpeed-=0.01;
	// 	if (heliSpeed<=0)
	// 		heliSpeed = 0.0;
    // }
    // if (currentlyPressedKeys[73]) {	//I
    // 	heliSpeed+=0.01;
	// 	if (heliSpeed>=10)
	// 		heliSpeed = 1.0;
    // }
    // if (currentlyPressedKeys[76]) {	//L
    // 	let matrix = new THREE.Matrix4().makeRotationAxis( axis, -delta );
	//    	speedVector.applyMatrix4( matrix );
    // }
	//
    // //HØYDE
    // if (currentlyPressedKeys[78]) { //N
    // 	helicopter.position.y -= 0.3;
    // }
    // if (currentlyPressedKeys[77]) {	//M
    // 	helicopter.position.y += 0.3;
    // }
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

function getRotationAngleUsingAtan2()
{
	return Math.atan2(speedVector.x, speedVector.z) - Math.PI / 2;
}
