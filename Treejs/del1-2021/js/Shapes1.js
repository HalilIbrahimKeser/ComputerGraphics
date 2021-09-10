/**
 * Tegner flere former / shapes.
 * Lager ogs� en egendefinert modell vha. vertekser og faces.
 *
 * Tegner et plan.
 * Tegner koordinatsystemet. Stiplet for negativ del av aksen. Bruker et Geometry-objekt som igjen brukes sammen med THREE.Line.
 * (alle XxxxxGeometry-klasser, f.eks. SphereGeometry, arver fra Geometry).
 * Bruker flere egenskaper til controls (zoomSpeed, panSpeed m.m.)
 *
 */
//Globale varianbler:
let renderer;
let scene;
let camera;

//rotasjoner
let angle = 0.0;
let lastTime = 0.0;

//Lys:
let light;

//Roter & zoom:
let controls; //rotere, zoone hele scenen.

let SIZE = 200;

let clock = new THREE.Clock();
let meshOctahedron;

import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from "../../lib/wfa-coord.js";

export function main() {
	//Henter referanse til canvaset:
	let mycanvas = document.getElementById('webgl');

	//Lager en scene:
	scene = new THREE.Scene();

	//Lager et rendererobjekt (og setter st�rrelse):
	renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
	renderer.setClearColor(0xBFD1FF, 0xff);  //farge, alphaverdi.
	renderer.setSize(window.innerWidth, window.innerHeight);

	//Oppretter et kamera:
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 10;
	camera.position.y = 5;
	camera.position.z = 12;
	camera.up = new THREE.Vector3(0, 1, 0);			//Endrer på kameraets oppretning.
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Lys:
	light = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	light.position.set(0, 10, 0);
	scene.add(light);

	//Legg modeller til scenen:
	addModels();

	//Koordinatsystem:
	addCoordSystem(scene);
	//let axes = new THREE.AxisHelper(SIZE);
	//scene.add(axes);

	//Roter/zoom hele scenen:
	controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

    //Håndterer endring av vindusstørrelse:
    window.addEventListener('resize', onWindowResize, false);

	animate();
}

function addModels() {
	//Definerer modeller:
	let gTorus = new THREE.TorusGeometry(10, 3, 16, 100);
	let mTorus = new THREE.MeshPhongMaterial({color : 0x90ff30});	//NB! MeshPhongMaterial
	let meshTorus = new THREE.Mesh(gTorus, mTorus);
	meshTorus.rotation.x = Math.PI / 2;
	scene.add(meshTorus);

	let gPlane = new THREE.PlaneGeometry( SIZE*2, SIZE*2 );
	let mPlane = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	let meshPlane = new THREE.Mesh( gPlane, mPlane);
	meshPlane.rotation.x = Math.PI / 2;
	scene.add(meshPlane);

	let gOctahedron = new THREE.OctahedronGeometry( 15 );
	let mOctahedron = new THREE.MeshPhongMaterial( {color: 0x000579} );
	meshOctahedron = new THREE.Mesh( gOctahedron, mOctahedron );
	meshOctahedron.position.set( -15, 5, -25 );
	scene.add( meshOctahedron );

	// Egegndefinert plan: NYTT september 2021 => SE https://threejs.org/docs/index.html?q=Geometry#api/en/core/BufferGeometry
	// SE:  https://threejs.org/docs/#api/en/core/BufferGeometry.attributes
	//      https://threejs.org/docs/#api/en/core/BufferAttribute
    let gPlane1 = new THREE.BufferGeometry();
	const vertices = new Float32Array( [
		-20, 20, 0,
		-20, -20, 0,
		20, -20, 0,

		-20, 20, 0,
		20, 20, 0,
		20, -20, 0,
	] );
	// itemSize = 3 pga. 3 verdier per vertex:
	gPlane1.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    let mPlane1 = new THREE.MeshBasicMaterial( { color: 0xccff00 } );
    mPlane1.side = THREE.DoubleSide;	//NB! CULLLING!!
    let plane = new THREE.Mesh(gPlane1, mPlane1);
    plane.rotation.y = Math.PI /3;
    plane.name = "myplane";
    scene.add(plane);
}

function animate() {
	requestAnimationFrame(animate);

	let elapsed = clock.getDelta(); 			// Forl�pt tid siden siste kall p� draw().

	// F�lgende gir 60 graders rotasjon per sekund og 6 sekunder for en hel rotasjon:
	let rotationSpeed = (Math.PI / 3); // Bestemmer rotasjonshastighet.
	angle = angle + (rotationSpeed * elapsed);
	angle = angle % (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

	meshOctahedron.rotation.y = angle;

	//Oppdater trackball-kontrollen:
	controls.update();
	//Tegner scenen med gitt kamera:
	render();
};

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
