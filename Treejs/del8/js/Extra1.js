/**
 * Sykkel...
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
let currentlyPressedKeys = {};

let loadedTexures={};

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
    camera.position.x = 150;
    camera.position.y = 110;
    camera.position.z = 190;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Retningsorientert lys (som gir skygge):
    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight1.position.set(100, 300, 300);
    directionalLight1.target.position.set(0, 0, 0);
    scene.add(directionalLight1);

	let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	directionalLight2.position.set(-100, -300, -300);
	directionalLight2.target.position.set(0, 0, 0);
	scene.add(directionalLight2);

    //Koordinatsystem:
    addCoordSystem(scene);

    //Roter/zoom hele scenen:
    controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

	loadTextures();
}

function loadTextures() {
	// Laster teksturer:
	let texturesToLoad = [
		{name: 'chocchipTexture', url: '../del2-2021/images/chocchip.png'},
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
					addModels();
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

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function addModels() {
	let tube = createTube();
	scene.add(tube);

	let extrudeShape = createExtrudeShape();
	scene.add(extrudeShape);

	animate();
}

function createExtrudeShape() {
	let shape = new THREE.Shape();
	shape.moveTo(0, 0); //Startpunkt
	shape.lineTo(-10, 40);
	shape.lineTo(48, 50);
	shape.bezierCurveTo(
		52, 50.5,
		 54, 51,
		 52, 48
	);
	shape.lineTo(0, 0);

	let hole1 = new THREE.Path();
	hole1.moveTo(2, 5);
	hole1.lineTo(-7.6, 35);
	hole1.lineTo(-6, 38);
	hole1.lineTo(30, 43);
	hole1.bezierCurveTo(32, 42.5, 35, 30, -1,10);
	shape.holes.push(hole1);

	//let materialShape = new THREE.MeshPhongMaterial( {map: loadedTexures['chocchipTexture'], side: THREE.DoubleSide, wireframe: false} );
	let materialShape = new THREE.MeshPhongMaterial( {color: 0xFFFF00, side: THREE.DoubleSide, wireframe: false} );
	let extrudeSettings = { depth: 2, bevelEnabled: true, bevelSegments: 5, steps: 10, bevelSize: 1, bevelThickness: 1 };
	let geometryShape = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	let shapeMesh = new THREE.Mesh(geometryShape, materialShape);
	return shapeMesh;
}

/**
 * Bruker TubeGeometry sammen med Curve.
 * @returns {Mesh}
 */
function createTube(tubeLength=5) {
	let group = new THREE.Group();

	const tubeCurve = new TorusKnot(); //new SinusCurve(5,4);    //new HelixCurve();
	const geometry = new THREE.TubeGeometry( tubeCurve, 140, 1, 10, false );
	const material = new THREE.MeshPhongMaterial( {color: 0xAAAA00, side: THREE.DoubleSide} );
	const tube = new THREE.Mesh( geometry, material );
	group.add(tube);

	return group;
}

// Hjelpeklasse for sinuskurven:
class SinusCurve extends THREE.Curve {
	constructor( scale = 1, radius = 1 , frequency=10) {
		super();
		this.scale = scale;
		this.radius = radius;
		this.frequency = frequency;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		console.log(t);
		let angle = 2*Math.PI * t;
		const tx = this.frequency * t;
		const ty = this.radius * Math.sin(angle);
		const tz = 0;
		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
	}
}

// *** ANDRE KURVEEKSEMPLER ***//

// HeartCurve
// Fra: https://threejs.org/examples/#webgl_geometry_extrude_splines
class HeartCurve extends THREE.Curve {
	constructor( scale = 5 ) {
		super();
		this.scale = scale;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const point = optionalTarget;
		t *= 2 * Math.PI;
		const x = 16 * Math.pow( Math.sin( t ), 3 );
		const y = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t );
		const z = 0;
		return point.set( x, y, z ).multiplyScalar( this.scale );
	}
}

// TrefoilKnot
// Fra: https://threejs.org/examples/#webgl_geometry_extrude_splines
class TrefoilKnot extends THREE.Curve {
	constructor( scale = 10 ) {
		super();
		this.scale = scale;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const point = optionalTarget;
		t *= Math.PI * 2;
		const x = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t );
		const y = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t );
		const z = Math.sin( 3 * t );
		return point.set( x, y, z ).multiplyScalar( this.scale );
	}
}

// TorusKnot
// Fra: https://threejs.org/examples/#webgl_geometry_extrude_splines
class TorusKnot extends THREE.Curve {
	constructor( scale = 10 ) {
		super();
		this.scale = scale;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const point = optionalTarget;
		const p = 3;
		const q = 4;
		t *= Math.PI * 2;
		const x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		const y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		const z = Math.sin( q * t );
		return point.set( x, y, z ).multiplyScalar( this.scale );
	}
}

// Fra: https://threejs.org/examples/#webgl_geometry_extrude_splines
class HelixCurve extends THREE.Curve {
	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const point = optionalTarget;
		const a = 30; // radius
		const b = 150; // height
		const t2 = 2 * Math.PI * t * b / 30;
		const x = Math.cos( t2 ) * a;
		const y = Math.sin( t2 ) * a;
		const z = b * t;
		return point.set( x, y, z );
	}
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
