/**
 * Enkel roterende teksturert kube MED LYS.
 * Nå med rotasjon m.m. av hele scenen (trackballcontrol).
 *
 * Bruker trackball - Kontrollen
 * Endret på kameraparametre (lookat og up).
 *
 * Bruker hele vindusstørrelsen: renderer.setSize(window.innerWidth, window.innerHeight);
 * Legger til en render() funksjon som kaller renderer.render().
 * Legger til en controls.addEventListener( 'change', render);
 *   - ved endringer kalles render() metoden
 * Håndterer endring av vindusstørrelse: window.addEventListener('resize', onWindowResize, false);
 * Må kalle på controls.update(); i animate()
 */
import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';

//Globale varianbler:
let renderer;
let cube;
let scene;
let camera;

//rotasjoner
let angle = 0.0;
let lastTime = 0.0;

let SIZE = 200;

//Lys:
let light;

let controls; //rotere, zoone hele scenen.

export function main() {
	//Henter referanse til canvaset:
	let mycanvas = document.getElementById('webgl');
	//Lager en scene:
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xdddddd );

	//Lager et rendererobjekt (og setter st�rrelse):
	renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
	renderer.setClearColor(0xBFD1FF, 0xff);  //farge, alphaverdi.
	renderer.setSize(window.innerWidth, window.innerHeight);

	//Kamera:
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 100;
	camera.position.z = 90;
	camera.position.y = 140;
	camera.up = new THREE.Vector3(0, 1, 0);			//Endrer p� kameraets oppretning.
	let target = new THREE.Vector3(0.0, 0.0, 0.0);
	camera.lookAt(target);

	//Modeller:
	addModels();

	//Lys:
	light = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
	light.position.set(2, 1, 4);
	scene.add(light);

	// TrackballControls
	controls = new TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render);

	//H�ndterer endring av vindusst�rrelse:
	window.addEventListener('resize', onWindowResize, false);
}

function addModels() {
	//Plan:
	let gPlane = new THREE.PlaneGeometry( SIZE*2, SIZE*2 );
	let mPlane = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	let meshPlane = new THREE.Mesh( gPlane, mPlane);
	meshPlane.rotation.x = Math.PI / 2;
	scene.add(meshPlane);

	//Definerer geometri og materiale (her kun farge) for en kube:
	let gCube = new THREE.BoxGeometry(50, 50, 50);

	const loader = new THREE.TextureLoader();
	loader.load(
		'images/bird1.png',
		function ( mintekstur ) {

			let mCube = new THREE.MeshPhongMaterial({map : mintekstur});	//NB! MeshPhongMaterial
			cube = new THREE.Mesh(gCube, mCube);
			//Legger kuben til scenen:
			scene.add(cube);

			//NÅh kan vi kalle på animate():
			animate();
		},
		undefined,
		function ( err ) {
			console.error( 'Feil ved lasting av teksturfil...' );
		}
	);
}

function animate(currentTime) {
	window.requestAnimationFrame(animate);
	if (currentTime === undefined)
		currentTime = 0; //Udefinert f�rste gang.

	let elapsed = 0.0; 			// Forl�pt tid siden siste kall p� draw().
	if (lastTime !== 0.0) 		// F�rst gang er lastTime = 0.0.
		elapsed = (currentTime - lastTime)/1000; //Opererer med sekunder.

	lastTime = currentTime;
	// F�lgende gir 60 graders rotasjon per sekund og 6 sekunder for en hel rotasjon:
	let rotationSpeed = (Math.PI / 3); // Bestemmer rotasjonshastighet.
	angle = angle + (rotationSpeed * elapsed);
	angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

	//Transformerer (roterer) kuben:
	//cube.rotation.x = angle;
	//cube.rotation.y = angle;

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

