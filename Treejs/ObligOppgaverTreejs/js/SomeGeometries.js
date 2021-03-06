import * as THREE from '../../lib/three/build/three.module.js';
import {TrackballControls} from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import {addCoordSystem} from "../../lib/wfa-coord.js";

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

let helicopter;
let heliSpeed = 0.0;
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
	camera.position.x = 130;
	camera.position.y = 200;
	camera.position.z = 130;
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

	addCup();

	addCube();

	addSphere();

	addPyramide();

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

function addCube() {
	let texturesToLoad = [
		{name: 'cubeTexture', url: 'images/Seamless_Wood.jpg'},
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
					let cube = new THREE.Group();
					cube.position.x = 20;
					cube.position.y = 0;
					cube.position.z = 0;
					cube.scale.x = 10;
					cube.scale.y = 10;
					cube.scale.z = 10;

					// CUBE
					let materialCube = new THREE.MeshPhongMaterial({map : loadedTexures['cubeTexture'], side: THREE.DoubleSide});	//NB! MeshPhongMaterial
					let geometryCube = new THREE.BoxGeometry(2,2,2)
					let cubeMesh = new THREE.Mesh( geometryCube, materialCube );
					cubeMesh.castShadow = true;
					cubeMesh.name = "Cube";
					cubeMesh.position.x = 0;
					cubeMesh.position.y = 1;
					cubeMesh.position.z = 6;
					cube.add(cubeMesh);

					scene.add(cube)

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

function addCup() {

	let texturesToLoad = [
		{name: 'cubTexture', url: 'images/Tileable_Mosaic.jpg'},
		{name: 'coffeeTexture', url: 'images/chocchip.png'}
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
					let cup = new THREE.Group();
					cup.position.x = 20;
					cup.position.y = 0;
					cup.position.z = 0;
					cup.scale.x = 10;
					cup.scale.y = 10;
					cup.scale.z = 10;

					let materialCup = new THREE.MeshPhongMaterial({map : loadedTexures['cubTexture'], side: THREE.DoubleSide});	//NB! MeshPhongMaterial

					// Bunnen
					let geometryCylinder = new THREE.CylinderGeometry( 0.4, 0.4, 0.05, 32 );
					let bottomMesh = new THREE.Mesh( geometryCylinder, materialCup );

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
					let meshTorus = new THREE.Mesh( geometryTorus, materialCup );
					meshTorus.rotation.z = -Math.PI/2 - Math.PI/14;
					meshTorus.scale.x=0.035;
					meshTorus.scale.y=0.035;
					meshTorus.scale.z=0.035;
					meshTorus.position.x = 0.8;
					meshTorus.position.y = 1;
					bottomMesh.add( meshTorus );

					cup.add( bottomMesh );
					scene.add(cup);

					// //Cockpit:
					// let gCockpit = new THREE.SphereGeometry(5, 32, 32);
					// let mCockpit = new THREE.MeshPhongMaterial({ map: loadedTexures['imageCockpit']  });
					// let meshCockpit = new THREE.Mesh(gCockpit, mCockpit);
					// meshCockpit.castShadow = true;
					// meshCockpit.name = "cockpit";
					// meshCockpit.position.x = 0;
					// meshCockpit.position.y = 0;
					// meshCockpit.position.z = 0;
					// helicopter.add(meshCockpit);
					//
					// //Body:
					// let gBody = new THREE.CylinderGeometry(1.0, 4, 12, 8, 4, false);
					// let mBody = new THREE.MeshPhongMaterial({ map: loadedTexures['imageBody']  });
					// let meshBody = new THREE.Mesh(gBody, mBody);
					// meshBody.castShadow = true;
					// meshBody.name = "body";
					// meshBody.rotation.z = Math.PI / 2;
					// meshBody.position.x = -7;
					// meshBody.position.y = 0;
					// meshBody.position.z = 0;
					// helicopter.add(meshBody);
					//
					// //Rotor:
					// let gRotor = new THREE.BoxGeometry(0.2, 20, 1);
					// let mRotor = new THREE.MeshBasicMaterial({ color:0x00de88});
					// let meshRotor = new THREE.Mesh(gRotor, mRotor);
					// meshRotor.name = "rotor";
					// meshRotor.rotation.z = Math.PI / 2;
					// meshRotor.rotation.y = Math.PI / 5;
					// meshRotor.position.x = 0;
					// meshRotor.position.y = 5;
					// meshRotor.position.z = 0;
					// meshRotor.castShadow = true;
					// helicopter.add(meshRotor);
					//
					// //Bakrotor:
					// let gBRotor = new THREE.BoxGeometry(5, 1, 0.2);
					// let mBRotor = new THREE.MeshBasicMaterial({ color:0x00de88});
					// let meshBRotor = new THREE.Mesh(gBRotor, mBRotor);
					// meshBRotor.name = "bakrotor";
					// meshBRotor.position.x = -13.0;
					// meshBRotor.position.y = 1;
					// meshBRotor.position.z = 0;
					// helicopter.add(meshBRotor);
					//
					// scene.add(helicopter);
					//
					// //Flytter hele helikoptret:
					// helicopter.position.y = 100;

					// Starter l??kka!
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

function addSphere() {
	let texturesToLoad = [
		{name: 'SphereTexture', url: 'images/interior-stone.jpeg'},
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
					let sphere = new THREE.Group();
					sphere.position.x = 20;
					sphere.position.y = 0;
					sphere.position.z = 0;
					sphere.scale.x = 10;
					sphere.scale.y = 10;
					sphere.scale.z = 10;

					// SPHERE
					let materialSphere = new THREE.MeshPhongMaterial({map : loadedTexures['SphereTexture'], side: THREE.DoubleSide});	//NB! MeshPhongMaterial
					let geometrySphere = new THREE.SphereGeometry(2.0, 32, 16, 0, Math.PI * 2, 0.0, Math.PI)
					let sphereMesh = new THREE.Mesh( geometrySphere, materialSphere );
					sphereMesh.castShadow = true;
					sphereMesh.name = "Sphere";
					sphereMesh.position.x = -7;
					sphereMesh.position.y = 2;
					sphereMesh.position.z = 0;
					sphere.add(sphereMesh);

					scene.add(sphere)

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

function addPyramide() {
	let texturesToLoad = [
		{name: 'PyramideTexture', url: 'images/water1.png'},
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
					let pyramide = new THREE.Group();
					pyramide.position.x = 20;
					pyramide.position.y = 0;
					pyramide.position.z = 0;
					pyramide.scale.x = 10;
					pyramide.scale.y = 10;
					pyramide.scale.z = 10;

					// SPHERE
					let materialPyramide = new THREE.MeshPhongMaterial({map : loadedTexures['PyramideTexture'], side: THREE.DoubleSide});	//NB! MeshPhongMaterial
					let geometryPyramide = new THREE.ConeGeometry(2.0, 4, 8, 1, false, 0.0, 2*Math.PI)
					let pyramideMesh = new THREE.Mesh( geometryPyramide, materialPyramide );
					pyramideMesh.castShadow = true;
					pyramideMesh.name = "Sphere";
					pyramideMesh.position.x = 1;
					pyramideMesh.position.y = 2;
					pyramideMesh.position.z = -6;
					pyramide.add(pyramideMesh);

					scene.add(pyramide)

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
	    currentTime = 0; //Udefinert f??rste gang.

	let elapsed = 0.0; 			// Forl??pt tid siden siste kall p?? draw().
	if (lastTime !== 0.0) 		// F??rst gang er lastTime = 0.0.
		elapsed = (currentTime - lastTime)/1000; //Opererer med sekunder.

	lastTime = currentTime;

	// let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.
	// angle = angle + (rotationSpeed * elapsed);
	// angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

	// //Roterer helikoptrets rotor:
	// let rotor = helicopter.getObjectByName("rotor", true);  //true = recursive...
	// if (rotor !== undefined)
	// 	rotor.rotation.y = angle;
	// let bakrotor = helicopter.getObjectByName("bakrotor", true);  //true = recursive...
	// if (bakrotor !== undefined)
	// 	bakrotor.rotation.z = angle;

	// // Oppdaterer posisjonsvektoren vha. fartsvektoren:
	// positionVector.x = positionVector.x + (speedVector.x * heliSpeed);
	// positionVector.y = 0;
	// positionVector.z = positionVector.z + (speedVector.z * heliSpeed);

	// // Bruker posisjonsvektoren til ?? oppdatere helikoptrets posisjon:
	// helicopter.position.x = positionVector.x;
	// helicopter.position.z = positionVector.z;
	//
	// // Roterer helikoptret i forhold til fartsvektoren:
	// helicopter.rotation.y = getRotationAngleUsingAtan2();
	//
	// // Illustrerer fartsvektoren:
	// arrowHelper.setDirection(speedVector);
	// arrowHelper.setLength(heliSpeed*100);

	//Sjekker input:
	keyCheck();

	//Oppdater trackball-kontrollen:
	controls.update();

	//Tegner scenen med gitt kamera:
	render();
}

function keyCheck() {

	if (currentlyPressedKeys[65]) { //A
		camera.lookAt(0,50,10);
		// controls.rotateX(10)
		// controls.update();
	}
	if (currentlyPressedKeys[68]) { //S
		//camera.position.x.rotate(2,0,1,0)
		//camera.position.rotate(2,0,1,0)
	}
	if (currentlyPressedKeys[87]) { //S
		//camera.position.x.rotate(2,0,1,0)
		//camera.position.rotate(2,0,1,0)
	}
	if (currentlyPressedKeys[83]) { //D
		//camera.position.x.rotate(2,0,1,0)
		//camera.position.rotate(2,0,1,0)
	}
	//RETNING
	if (currentlyPressedKeys[74]) { //J
		let matrix = new THREE.Matrix4().makeRotationAxis( axis, delta );
	   	speedVector.applyMatrix4( matrix );
    }
    if (currentlyPressedKeys[75]) {	//K
    	heliSpeed-=0.01;
		if (heliSpeed<=0)
			heliSpeed = 0.0;
    }
    if (currentlyPressedKeys[73]) {	//I
    	heliSpeed+=0.01;
		if (heliSpeed>=10)
			heliSpeed = 1.0;
    }
    if (currentlyPressedKeys[76]) {	//L
    	let matrix = new THREE.Matrix4().makeRotationAxis( axis, -delta );
	   	speedVector.applyMatrix4( matrix );
    }

    //H??YDE
    if (currentlyPressedKeys[78]) { //N
    	helicopter.position.y -= 0.3;
    }
    if (currentlyPressedKeys[77]) {	//M
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

function getRotationAngleUsingAtan2()
{
	return Math.atan2(speedVector.x, speedVector.z) - Math.PI / 2;
}
