import * as THREE from '../../../../Treejs/lib/three/build/three.module.js';
import { TrackballControls } from '../../../../Treejs/lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from '../../../../Treejs/lib/wfa-coord.js';

let renderer;
let scene;
let camera;
let controls;
let lastTime = 0.0;
let bicycle;
let wheel;
let frontWheel;
let pedalGroup;
let wheelRotation = Math.PI;
let swingRotation = 0;
let currentlyPressedKeys = {};
let frontBikePart;

let SIZE = 500;

const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
//const loader = new THREE.TextureLoader();
const materials = [
    new THREE.MeshPhongMaterial({ map: loader.load('images/peakpx.jpg')}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/wheelPattern.PNG')}),
    new THREE.MeshPhongMaterial({ map: loader.load('images/metalgold.jpg')}),
    new THREE.MeshPhongMaterial({ map: loader.load('images/bluedrops.jpg')}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/leather.jpg')}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/grass.jpg'), side: THREE.DoubleSide}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/whiteseat.jpg')}),
    new THREE.MeshPhongMaterial({ map: loader.load('images/goldpattern.jpg')}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/metalholes.jpg')}),
    new THREE.LineBasicMaterial({color: 0x000000, linewidth: 50, linecap:'round'}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/wall.jpg')}),
    new THREE.MeshPhongMaterial({ map: loader.load('images/glass.jpg'), emissive: 0xffffcc, emissiveIntensity: 0.4}),
    new THREE.MeshPhongMaterial({ map: loader.load('images/silver.jpg')}),
    new THREE.MeshLambertMaterial({ map: loader.load('images/black.jpg')}),
];

export function main(){
    let myCanvas = document.getElementById('webgl');

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({canvas: myCanvas, antialias: true});
    renderer.setClearColor(0xBFD104, 0xff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.x = -20;
    camera.position.y = 30;
    camera.position.z = 60;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 300, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0;
    directionalLight.shadow.camera.far = 301;
    directionalLight.shadow.camera.left = -250;
    directionalLight.shadow.camera.right = 250;
    directionalLight.shadow.camera.top = 250;
    directionalLight.shadow.camera.bottom = -250;
    directionalLight.shadow.camera.visible = true;

    //Hjelpeklasse for å vise lysets utstrekning:
    let lightCamHelper = new THREE.CameraHelper( directionalLight.shadow.camera );
    scene.add( lightCamHelper );
    scene.add(directionalLight);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    addModels();
    addCoordSystem(scene);

    window.addEventListener('resize', onWindowResize, false);


    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);
}

function addModels() {
    //Plan:
    addPlainPlane();

    //addGrass(); //If grass texture.

    addBicycle();
    bicycle.position.y = 16;

    //wall to show spotlight
    let wall = makeSimpleBoxMesh(10, 50, 50, materials[10]);
    scene.add(wall);
    wall.position.x = 100;
    wall.position.y = 25;

}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
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

function makeSimpleBoxMesh(width, height, depth, material){
    let boxGeo = new THREE.BoxGeometry(width, height, depth);
    let boxMesh = new THREE.Mesh(boxGeo, material);
    return boxMesh
}


function addBicycle(){
    bicycle = new THREE.Group(); //holder hele sykkelen
    //wheel = new THREE.Group(); //gruppe for hjul
    frontBikePart = new THREE.Group(); //gruppe for frontdelen av sykkel (med hjul) - for å gjøre det mulig å svinge
    let frame = new THREE.Group(); // ramma til sykkel
    let gearGroup = new THREE.Group(); //alle tre girsylindre
    pedalGroup = new THREE.Group(); //for å synkronisere rotasjon av pedaler

    loadManager.onLoad = () => {
        //Wheel object
        makeWheel();

        //front bike part
        frontWheel = wheel.clone();


        let middleOfFrontWheel = makeCylinderMesh(0.05, 0.05, 15, 64,1,false,0, 6.3, materials[2]);
        middleOfFrontWheel.rotation.x = Math.PI/2;
        middleOfFrontWheel.scale.x = 6;
        middleOfFrontWheel.scale.z = 6;
        middleOfFrontWheel.scale.y = 0.37;
        frontWheel.add(middleOfFrontWheel);
        frontWheel.position.x = 4;
        frontBikePart.add(frontWheel);

        let brake1 = makeSimpleBoxMesh(2, 4, 2, materials[13]);
        let brake2 = brake1.clone();
        brake1.position.z = -1.5;
        brake1.rotation.z = 0.7;
        brake1.position.x = 7;
        brake1.position.y = 3.5;
        frontBikePart.add(brake1);

        let brakeHolderOnWheel = makeSimpleBoxMesh(5, 2, 1, materials[12]);
        let brakeHolderBack = brakeHolderOnWheel.clone();
        let gearChanger = brakeHolderOnWheel.clone();
        brakeHolderOnWheel.position.z = -1.7;
        brakeHolderOnWheel.rotation.z = 0.7;
        brakeHolderOnWheel.position.x = 6;
        brakeHolderOnWheel.position.y = 2;
        frontBikePart.add(brakeHolderOnWheel);



        let pedalConnectionMiddleHorizontal =  makeCylinderMesh(0.05, 0.05, 15, 64,1,false,0, 6.3, materials[2]);

        //frontframe
        let frontTorsoMesh = makeCylinderMesh(0.5, 0.5, 17, 64, 1, false, 0, 6.3, materials[3]);
        let frontOverWheel = frontTorsoMesh.clone();
        let sideBarWheel = frontTorsoMesh.clone();
        let middleSteeringVertical = frontTorsoMesh.clone();
        let bottomFrame = frontTorsoMesh.clone();
        let seatSupportFrame = frontTorsoMesh.clone();
        let aroundTorsoMesh = frontTorsoMesh.clone();
        frontTorsoMesh.translateY(25.7);
        //frontTorsoMesh.translateX(3);
        frontTorsoMesh.scale.x = 1.5;
        frontTorsoMesh.scale.z = 1.5;
        frontBikePart.add(frontTorsoMesh);

        frontOverWheel.rotation.x = Math.PI/2;
        frontOverWheel.scale.y = 0.3;
        frontOverWheel.scale.x = 1.7;
        frontOverWheel.scale.z = 1.7;
        let steeringBar = frontOverWheel.clone();

        let wheelHolder = frontOverWheel.clone();
        wheelHolder.scale.set(1.5, 0.06, 1.5);
        wheelHolder.position.x = 4
        let wheelHolderFrontLeft = wheelHolder.clone();
        let wheelHolderBackRight = wheelHolder.clone();
        wheelHolder.position.z = 2;
        frontBikePart.add(wheelHolder);

        wheelHolderFrontLeft.position.z = -2;
        frontBikePart.add(wheelHolderFrontLeft);

        frontOverWheel.position.y = 17;
        frontBikePart.add(frontOverWheel);
        sideBarWheel.scale.y = 1.0;

        let sideBarBackWheel = sideBarWheel.clone();
        let upperSideBarBackWheel = sideBarWheel.clone();
        sideBarWheel.position.y = 8.2;
        sideBarWheel.rotation.z = 0.23;
        sideBarWheel.position.x = 2;
        let sideBarWheel2 = sideBarWheel.clone();
        sideBarWheel.position.z = 2;
        frontBikePart.add(sideBarWheel);

        sideBarWheel2.position.z = -2;
        frontBikePart.add(sideBarWheel2);

        steeringBar.position.y = 34.5;
        let middleSteeringHorizontal = steeringBar.clone();
        steeringBar.scale.x = 1;
        steeringBar.scale.y = 0.8;
        steeringBar.scale.z = 1;
        frontBikePart.add(steeringBar);

        middleSteeringVertical.scale.y = 0.07;
        middleSteeringVertical.scale.x = 1.7;
        middleSteeringVertical.scale.z = 1.7;
        middleSteeringVertical.position.y = 34;
        frontBikePart.add(middleSteeringVertical);

        middleSteeringHorizontal.scale.y = 0.2;
        middleSteeringHorizontal.scale.z = 1.7;
        middleSteeringHorizontal.scale.x = 1.7;
        frontBikePart.add(middleSteeringHorizontal);

        let handle1Mesh = makeCylinderMesh(0.5, 0.5, 3, 64, 1, false, 0, 6.3, materials[4]);
        handle1Mesh.scale.x = 1.2;
        handle1Mesh.scale.z = 1.2;
        handle1Mesh.scale.y = 2;
        handle1Mesh.position.y = 34.5;
        //handle1Mesh.position.x = -3;
        handle1Mesh.rotation.x = Math.PI/2;
        let handle2 = handle1Mesh.clone();
        handle1Mesh.position.z = 8;
        frontBikePart.add(handle1Mesh);

        handle2.position.z = -8;
        frontBikePart.add(handle2);

        let bikeLightMesh = makeCylinderMesh(2, 1, 3, 64, 1, false, 0, 6.3, materials[3]);
        bikeLightMesh.rotation.z = Math.PI + Math.PI/2;
        bikeLightMesh.position.x = 1.5;
        bikeLightMesh.position.y = 34;
        frontBikePart.add(bikeLightMesh);

        let bikeLightGlass = makeSphereMesh(3.5, 48, 15, 0, 6.3, 0, 0.6, materials[11]);
        frontBikePart.add(bikeLightGlass);
        bikeLightGlass.rotation.z = 2*Math.PI - Math.PI/2;
        bikeLightGlass.position.x = 0.0;
        bikeLightGlass.position.y = 34;

        const spotLight = new THREE.SpotLight( 0xffffff );
        frontBikePart.add( spotLight );
        frontBikePart.add( spotLight.target );
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;
        spotLight.position.set( -42, 18.5, 0);
        spotLight.castShadow = true;
        spotLight.target.position.set(120, 34, 0);

        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        frontBikePart.add(spotLightHelper);

        let brakeControllerMesh = makeCylinderMesh(0.4, 0.1, 11.8, 8, 1, false, 0, 6.3, materials[2]);
        let brakeControllerLeft = brakeControllerMesh.clone();
        brakeControllerMesh.position.y = 34.5;
        brakeControllerMesh.position.x = 1.5;
        brakeControllerMesh.position.z = 4.8;
        brakeControllerMesh.rotation.z = -0.2;
        brakeControllerMesh.rotation.x= 1.6;
        frontBikePart.add(brakeControllerMesh);

        brakeControllerLeft.position.y = 34.5;
        brakeControllerLeft.position.x = 1.5;
        brakeControllerLeft.position.z = -4.8;
        brakeControllerLeft.rotation.z = -0.2;
        brakeControllerLeft.rotation.x= -1.6;
        frontBikePart.add(brakeControllerLeft);

        let gearControl = makeCylinderMesh(0.4, 0.1, 6, 8, 1, false, 0, 6.3, materials[12]);
        let gearControlLeft = gearControl.clone();
        gearControl.rotation.x = 1.6;
        gearControl.rotation.z = 0.5;
        gearControl.position.y = 35;
        gearControl.position.x = -1;
        gearControl.position.z = 3;
        frontBikePart.add(gearControl);

        gearControlLeft.rotation.x = -1.6;
        gearControlLeft.rotation.z = 0.5;
        gearControlLeft.position.y = 35;
        gearControlLeft.position.x = -1;
        gearControlLeft.position.z = -3;
        frontBikePart.add(gearControlLeft);

        let gearBrakeHolder = makeSimpleBoxMesh(3, 2,4, materials[13]);
        gearBrakeHolder.position.y = 34.5;
        frontBikePart.add(gearBrakeHolder);



        //frame
        brake2.rotation.z = Math.PI/2;
        brake2.position.z = -3;
        brake2.position.y = 4;
        frame.add(brake2);

        brakeHolderBack.position.z = -3.7;
        brakeHolderBack.rotation.z = Math.PI/2;

        brakeHolderBack.position.y = 1.2;
        frame.add(brakeHolderBack);

        aroundTorsoMesh.scale.x = 1.7;
        aroundTorsoMesh.scale.z = 1.7;
        aroundTorsoMesh.scale.y = 0.6;
        aroundTorsoMesh.position.x = 45;
        aroundTorsoMesh.position.y = 24;
        frame.add(aroundTorsoMesh);
        wheelHolderBackRight.position.x = -0.02;
        let wheelHolderBackLeft = wheelHolderBackRight.clone();
        wheelHolderBackRight.position.z = 4;
        frame.add(wheelHolderBackRight);

        wheelHolderBackLeft.position.z = -4;
        frame.add(wheelHolderBackLeft);

        sideBarBackWheel.scale.y = 0.75;
        sideBarBackWheel.rotation.z = Math.PI/2;
        sideBarBackWheel.position.x = 6.6;
        let sideBarBackWheel2 = sideBarBackWheel.clone();
        let inwardSideBarBackWheel = sideBarBackWheel.clone();
        sideBarBackWheel.position.z = 4;
        frame.add(sideBarBackWheel);

        sideBarBackWheel2.position.z = -4;
        frame.add(sideBarBackWheel2);

        inwardSideBarBackWheel.scale.y = 0.45;
        inwardSideBarBackWheel.position.x = 16;
        let inwardSideBarBackWheel2 = inwardSideBarBackWheel.clone();

        inwardSideBarBackWheel.rotation.y = 0.55;
        inwardSideBarBackWheel.position.z = 2.1;
        frame.add(inwardSideBarBackWheel);

        inwardSideBarBackWheel2.rotation.y = Math.PI - 0.55;
        inwardSideBarBackWheel2.position.z = -2.1;
        frame.add(inwardSideBarBackWheel2);

        bottomFrame.position.x = 31.8;
        bottomFrame.position.y = 10.3;
        bottomFrame.scale.x = 1.7;
        bottomFrame.scale.y = 1.97;
        bottomFrame.scale.z = 1.7;
        let upperFrame = bottomFrame.clone();
        bottomFrame.rotation.z = Math.PI - 0.9;
        frame.add(bottomFrame);

        upperFrame.position.y = 18;
        upperFrame.position.x = 30;
        upperFrame.scale.y = 2.07;
        upperFrame.rotation.z = Math.PI - 1;
        frame.add(upperFrame);

        seatSupportFrame.position.x = 13.5;
        seatSupportFrame.position.y = 13.3;
        seatSupportFrame.scale.x = 1.7;
        seatSupportFrame.scale.y = 1.75;
        seatSupportFrame.scale.z = 1.7;
        seatSupportFrame.rotation.z = 0.4;
        frame.add(seatSupportFrame);

        upperSideBarBackWheel.rotation.z = Math.PI/2 +0.7;
        upperSideBarBackWheel.position.z = 4;
        upperSideBarBackWheel.position.x = 5.2;
        upperSideBarBackWheel.position.y = 4;
        upperSideBarBackWheel.scale.y = 0.75;
        let upperSideBarBackWheel2 = upperSideBarBackWheel.clone();
        frame.add(upperSideBarBackWheel);

        upperSideBarBackWheel2.position.z = -4;
        frame.add(upperSideBarBackWheel2);

        let upperInwardSideBarBackWheel = inwardSideBarBackWheel.clone();
        let upperInwardSideBarBackWheel2 = inwardSideBarBackWheel2.clone();
        upperInwardSideBarBackWheel.position.y = 10.57;
        upperInwardSideBarBackWheel.position.x = 11.63;
        upperInwardSideBarBackWheel.position.z = 2.03
        upperInwardSideBarBackWheel.rotation.z = Math.PI/2 + 0.79;
        upperInwardSideBarBackWheel.rotation.y =  0.86;
        frame.add(upperInwardSideBarBackWheel);

        upperInwardSideBarBackWheel2.position.y = 10.57;
        upperInwardSideBarBackWheel2.position.x = 11.63;
        upperInwardSideBarBackWheel2.position.z = -2.03;
        upperInwardSideBarBackWheel2.rotation.z = Math.PI/2 - 0.79;
        upperInwardSideBarBackWheel2.rotation.y = 0.86;
        frame.add(upperInwardSideBarBackWheel2);

        let underSeat = new THREE.BoxGeometry(10, 1, 10);
        let underSeatMesh = new THREE.Mesh(underSeat, materials[2]);
        underSeatMesh.scale.z = 0.5;
        underSeatMesh.scale.x = 1.2;
        underSeatMesh.scale.y = 0.5;
        underSeatMesh.position.x = 8;
        underSeatMesh.position.y = 27;
        frame.add(underSeatMesh);

        //pedal holder
        let pedalHolderMesh = makeTorusMesh(1, 2.5, 5, 60, materials[3]);
        pedalHolderMesh.scale.z = 0.9;
        pedalHolderMesh.position.x = 21;
        pedalHolderMesh.position.y = 2;
        frame.add(pedalHolderMesh);



        //seat
        let seatMesh = makeCylinderMesh(3, 3, 12, 50, 2, false,0, Math.PI, materials[6]);
        seatMesh.rotation.z = Math.PI/2;
        seatMesh.position.x = 8;
        seatMesh.position.y = 27;
        seatMesh.scale.x = 0.7;
        frame.add(seatMesh);

        //back gear cylinder
        let gearCylinderMesh = makeCylinderMesh(2, 2, 0.4, 50, 2, false,0, Math.PI *2, materials[7]);
        let gearSpikeGeo = createSpikeSplineShape();
        let gearSpikeMesh = createSpikeMesh(gearSpikeGeo, materials[2]);
        gearSpikeMesh.scale.set(0.15, 0.12, 1);
        gearSpikeMesh.rotation.x = Math.PI/2;
        gearSpikeMesh.position.z = 4;
        gearSpikeMesh.position.y = 0.2;
        let step = (2*Math.PI)/30;
        for (let i = 0; i < 2*Math.PI; i+=step){
            let gearSpikeClone = gearSpikeMesh.clone();
            gearSpikeClone.rotation.z = i - 1.6;
            gearSpikeClone.position.x = 2 * Math.cos(i);
            gearSpikeClone.position.z = 2 * Math.sin(i);
            gearCylinderMesh.add(gearSpikeClone);
        }

        //gearCylinderMesh.scale.y = 0.5;
        gearCylinderMesh.rotation.x = Math.PI/2;
        gearCylinderMesh.position.z = 1.25;
        gearCylinderMesh.scale.y = 0.5;
        let gearCylinder7 = gearCylinderMesh.clone();
        let pedalGearConnection = gearCylinderMesh.clone();
        gearGroup.add(gearCylinderMesh);

        //middle gear cylinder
        gearCylinder7.position.z = 1.55;
        gearCylinder7.scale.set(0.9, 0.5, 0.9);
        let gearCylinder6= gearCylinder7.clone();
        gearGroup.add(gearCylinder7);

        //front gear cylinder
        gearCylinder6.position.z = 1.85;
        gearCylinder6.scale.set(0.8, 0.5, 0.8);
        let gearCylinder5 = gearCylinder6.clone();
        gearGroup.add(gearCylinder6);

        gearCylinder5.scale.set(0.7, 0.5, 0.7);
        gearCylinder5.position.z = 2.15;
        let gearCylinder4 = gearCylinder5.clone();
        gearGroup.add(gearCylinder5);

        gearCylinder4.scale.set(0.6, 0.5, 0.6);
        gearCylinder4.position.z = 2.45;
        let gearCylinder3 = gearCylinder4.clone();
        gearGroup.add(gearCylinder4);

        gearCylinder3.scale.set(0.5, 0.5, 0.5);
        gearCylinder3.position.z = 2.75;
        let gearCylinder2 = gearCylinder3.clone();
        gearGroup.add(gearCylinder3);

        gearCylinder2.scale.set(0.4, 0.5, 0.4);
        gearCylinder2.position.z = 3.05;
        let gearCylinder1 = gearCylinder3.clone();
        gearGroup.add(gearCylinder2);

        gearCylinder1.scale.set(0.3, 0.5, 0.3);
        gearCylinder1.position.z = 3.35;
        gearGroup.add(gearCylinder1);

        //
        let frontBrakeMesh = makeCylinderMesh(2.5, 2.5, 0.2, 50, 2, false,0, Math.PI *2, materials[2]);
        frontBrakeMesh.rotation.x = Math.PI/2;
        frontBrakeMesh.position.z = -1.2;
        let backBrake = frontBrakeMesh.clone();
        frontWheel.add(frontBrakeMesh);

        backBrake.position.z = -2.9;
        wheel.add(backBrake);

        pedalGroup.position.x = 21;
        pedalGroup.position.y = 2;
        pedalGroup.position.z = 1.5;
        pedalGearConnection.scale.set(1.5, 0.5, 1.5);
        pedalGroup.add(pedalGearConnection);


        pedalConnectionMiddleHorizontal.scale.set(7, 0.7, 7);
        pedalConnectionMiddleHorizontal.position.z = -1.45;
        let pedalConnectionVertical = pedalConnectionMiddleHorizontal.clone();
        let pedalLowerHorizontal = pedalConnectionMiddleHorizontal.clone();
        pedalConnectionMiddleHorizontal.rotation.x = Math.PI/2;
        pedalGroup.add(pedalConnectionMiddleHorizontal);

        pedalConnectionVertical.scale.y = 0.6;
        pedalConnectionVertical.position.y = -4.4;
        let pedalConnectionVerticalLeft = pedalConnectionVertical.clone();
        pedalConnectionVertical.position.z = 3.45;
        pedalGroup.add(pedalConnectionVertical);

        pedalConnectionVerticalLeft.position.y = 4.3;
        pedalConnectionVerticalLeft.position.z = -6.4;
        pedalGroup.add(pedalConnectionVerticalLeft);

        pedalLowerHorizontal.rotation.x = Math.PI/2;
        pedalLowerHorizontal.scale.y = 0.2;
        pedalLowerHorizontal.position.y = -8.65;
        let pedalLowerHorizontalLeft = pedalLowerHorizontal.clone();
        pedalLowerHorizontal.position.z = 4.8;
        pedalGroup.add(pedalLowerHorizontal);

        pedalLowerHorizontalLeft.position.z = -7.6;
        pedalLowerHorizontalLeft.position.y = 9;
        pedalGroup.add(pedalLowerHorizontalLeft);


        let pedalFootRightMesh = makeSimpleBoxMesh(3, 1, 5, materials[8]);
        let pedalFootLeft = pedalFootRightMesh.clone();
        pedalFootRightMesh.position.y = -8.75;
        pedalFootRightMesh.position.z = 7;
        pedalGroup.add(pedalFootRightMesh);

        pedalFootLeft.position.y = 9;
        pedalFootLeft.position.z = -10;
        pedalGroup.add(pedalFootLeft);


        let line = makeRightWire();
        bicycle.add(line);

        let leftLine = makeLeftBackWire();
        bicycle.add(leftLine);

        let chains = makeChains();
        bicycle.add(chains);

        /* rotasjon på y-aksen av frontBikePart brukes til å svinge)*/
        //frontBikePart.rotation.y = 1.2;

        frontBikePart.position.x = 45;


        wheel.add(gearGroup);
        bicycle.add(pedalGroup);
        bicycle.add(wheel);
        bicycle.add(frontBikePart);
        bicycle.add(frame);
        scene.add(bicycle);

        animate();

    }
}

function createSpikeMesh(shape, material) {
    let extrudeSettings = {
        depth: 0.4,
        bevelEnabled: false,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 1,
        bevelThickness: 0.2
    };
    let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    let spikeMesh = new THREE.Mesh( geometry, material );
    spikeMesh.translateOnAxis(new THREE.Vector3(0,-0.2,0), 1);
    spikeMesh.scale.set(0.3, 0.25, 1);
    return spikeMesh;
}

// Smoooth...
function createSpikeSplineShape() {
    let spikeShape = new THREE.Shape();
    spikeShape.moveTo( -4, 0 );
    spikeShape.splineThru([
        new THREE.Vector2(-3, 0.4),
        new THREE.Vector2(-2, 1.2),
        new THREE.Vector2(-1, 3),
        new THREE.Vector2(0, 5),
        new THREE.Vector2(1, 3),
        new THREE.Vector2(2, 1.2),
        new THREE.Vector2(3, 0.4),
        new THREE.Vector2(4, 0),
    ]);
    spikeShape.lineTo(4,-1);
    spikeShape.lineTo(-4,-1);
    spikeShape.lineTo(-4,0);
    return spikeShape;
}


function animate(currentTime) {
    requestAnimationFrame(animate);
    if (currentTime == undefined)
        currentTime = 0; //Udefinert f�rste gang.

    let elapsed = 0.0; 			// Forl�pt tid siden siste kall p� draw().
    if (lastTime != 0.0) 		// F�rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime) / 1000; //Opererer med sekunder.
    lastTime = currentTime;
    //let rotationSpeed = (Math.PI / 3); // Bestemmer rotasjonshastighet.
    //wheelRotation = wheelRotation - (rotationSpeed * elapsed);
    //wheelRotation %= (Math.PI * 2); // "Rull rundt
    wheel.rotation.z = wheelRotation;
    frontWheel.rotation.z = wheelRotation;
    pedalGroup.rotation.z = wheelRotation;
    frontBikePart.rotation.y = swingRotation;
    keyCheck(elapsed);


    controls.update();
    render();
}

function makeTorusMesh(radius, tube, radialSegments, tubularSegments, material){
    let wheelGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
    let wheelMesh = new THREE.Mesh(wheelGeometry, material);
    return wheelMesh;
}

function makeCylinderMesh(radiusTop, radiusBottom, height, radialSegments, heightegments, openEnded, thetaStart, thetaLength, material){
    let cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments,heightegments,openEnded,thetaStart, thetaLength);
    let cylinderMesh = new THREE.Mesh(cylinderGeometry, material);
    return cylinderMesh;
}

function makeWheel(){
    wheel = new THREE.Group();
    let rubberWheelMesh = makeTorusMesh(7, 1.0, 30, 100, materials[1]);
    wheel.add(rubberWheelMesh);
    let innerWheelMesh = makeTorusMesh(6.4, 0.9, 3, 100, materials[0]);
    wheel.add(innerWheelMesh);
    let thinCylinderMesh = makeCylinderMesh(0.05, 0.05, 15, 64,1,false,0, 6.3, materials[2]);
    wheel.add(thinCylinderMesh);
    for (let i = 0; i < Math.PI; i+=Math.PI/10){
        let thinTubeCopy = thinCylinderMesh.clone();
        thinTubeCopy.rotation.z = i;
        wheel.add(thinTubeCopy);
    }
    let middleCylinderMesh = thinCylinderMesh.clone();
    middleCylinderMesh.rotation.x = Math.PI/2;
    middleCylinderMesh.scale.x = 6;
    middleCylinderMesh.scale.z = 6;
    wheel.scale.x = 2;
    wheel.scale.y = 2;
    middleCylinderMesh.scale.y = 0.7;
    wheel.add(middleCylinderMesh);

}

function makeSphereMesh(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, material){
    let sphereGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, material);
    let sphereMesh = new THREE.Mesh(sphereGeo, material);
    return sphereMesh;
}

function makeRightWire(){
    const points = [];
    points.push(new THREE.Vector3(46, 34, 0));
    points.push(new THREE.Vector3(46, 32, 0));
    points.push(new THREE.Vector3(46, 31, 0));
    points.push(new THREE.Vector3(46, 30, 0));
    points.push(new THREE.Vector3(45, 29, 0));
    points.push(new THREE.Vector3(45, 28, 0));
    points.push(new THREE.Vector3(44.5, 27, 0));
    points.push(new THREE.Vector3(44, 26, 0));
    points.push(new THREE.Vector3(44, 24, 0));
    points.push(new THREE.Vector3(44, 23, 0));
    points.push(new THREE.Vector3(44, 22, 0));
    points.push(new THREE.Vector3(43.5, 21, 0));
    points.push(new THREE.Vector3(24, 4.3, 0));
    points.push(new THREE.Vector3(23, 4.7, 0));
    points.push(new THREE.Vector3(20, 4.8, 0));
    points.push(new THREE.Vector3(18, 4.6, 0));
    points.push(new THREE.Vector3(17.7, 2, 0));
    points.push(new THREE.Vector3(17.5, 0.5, 0));
    points.push(new THREE.Vector3(16, 0.5, 1));
    points.push(new THREE.Vector3(13.3, 0.5, 2.7));
    points.push(new THREE.Vector3(12.8, 0.5, 3));
    points.push(new THREE.Vector3(2, 0.5, 3.5));
    points.push(new THREE.Vector3(1, 0.3, 3.8));
    points.push(new THREE.Vector3(0.5, -0.5, 3.8));
    points.push(new THREE.Vector3(0, -1, 3.8));
    points.push(new THREE.Vector3(-1, -1, 3.5));


    let frontWireGeo = new THREE.BufferGeometry().setFromPoints(points);
    let line = new THREE.Line(frontWireGeo, materials[9]);
    line.position.z = 1;
    return line;
}

function makeLeftBackWire(){
    const points = [];
    points.push(new THREE.Vector3(46, 34, 0));
    points.push(new THREE.Vector3(46, 32, 0));
    points.push(new THREE.Vector3(46, 31, 0));
    points.push(new THREE.Vector3(46, 30, 0));
    points.push(new THREE.Vector3(45, 29, 0));
    points.push(new THREE.Vector3(45, 28, 0));
    points.push(new THREE.Vector3(44.5, 27, 0));
    points.push(new THREE.Vector3(44, 26, 0));
    points.push(new THREE.Vector3(44, 24, 0));
    points.push(new THREE.Vector3(44, 23, 0));
    points.push(new THREE.Vector3(44, 22, 0));
    points.push(new THREE.Vector3(43.5, 21, 0));
    points.push(new THREE.Vector3(24, 4.3, 0));
    points.push(new THREE.Vector3(23, 4.7, 0));
    points.push(new THREE.Vector3(20, 4.8, 0));
    points.push(new THREE.Vector3(18, 4.6, 0));
    points.push(new THREE.Vector3(17.7, 2, 0));
    points.push(new THREE.Vector3(17.5, 0.5, 0));
    points.push(new THREE.Vector3(16, 0.5, -1));
    points.push(new THREE.Vector3(13.3, 0.5, -2.7));
    points.push(new THREE.Vector3(12.8, 0.5, -3));
    points.push(new THREE.Vector3(2, 0.5, -3.5));
    points.push(new THREE.Vector3(1, 0.3, -3.8));
    points.push(new THREE.Vector3(0.5, -0.5, -3.8));
    points.push(new THREE.Vector3(0, -1, -3.8));
    points.push(new THREE.Vector3(-1, -1, -3.5));

    let frontWireGeo = new THREE.BufferGeometry().setFromPoints(points);
    let line = new THREE.Line(frontWireGeo, materials[9]);
    line.position.z = -1;
    return line;

}

function keyCheck(elapsed) {
    let rotationSpeed = (Math.PI); // Bestemmer rotasjonshastighet.
    if (currentlyPressedKeys[70]) { //F
        wheelRotation = wheelRotation + (rotationSpeed * elapsed);
        wheelRotation %= (Math.PI * 2);
        if (swingRotation==0 && bicycle.position.x!=-200){
            bicycle.position.x-=1;
        }
    }
    if (currentlyPressedKeys[71]) {	//G
        wheelRotation = wheelRotation - (rotationSpeed * elapsed);
        wheelRotation %= (Math.PI * 2);
        if (swingRotation==0 && bicycle.position.x != 30){
            bicycle.position.x+=1;
        }
    }

    if (currentlyPressedKeys[65]) { //A
        if (camera.position.x < -100) {
            camera.position.z = (-1)
        }
        if (camera.position.z < 0){
            camera.position.x -= 1
        }
        //camera.position.x = camera.position.x - 30 * (Math.PI/90)
        camera.position.z = camera.position.z - 20
        controls.update();
    }

    if (currentlyPressedKeys[68]) { //D
        if (camera.position.x > 100) {
            camera.position.z = (-1)
        }
        if (camera.position.z < 0){
            camera.position.x +=1
        }
        //camera.position.x = (camera.position.x + 30 * (Math.PI/90))
        camera.position.z = camera.position.z + 20
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

    if (currentlyPressedKeys[86]) { //V
        if (swingRotation <= Math.PI/2){
            swingRotation = swingRotation + (rotationSpeed * elapsed);
        }
    }
    if (currentlyPressedKeys[66]) {	//B
        if (swingRotation >= -Math.PI/2){
            swingRotation = swingRotation - (rotationSpeed * elapsed);
        }

    }
}

function makeChains(){
    let wholeChain = new THREE.Group();
    let chainGroup = new THREE.Group();
    let chainElement = makeTorusMesh(0.5, 0.1,16, 100, materials[12]);
    let chainElementRotatedX = chainElement.clone();
    chainElement.scale.x = 0.85;
    chainElement.scale.y = 0.4;
    chainElement.position.x = -1.5;
    chainElement.position.y = 4.7;



    chainElementRotatedX.position.y = 4.7 ;
    chainElementRotatedX.position.x = chainElement.position.x +0.5;
    chainElementRotatedX.scale.x = 0.4;
    chainElementRotatedX.scale.y = 0.2;
    chainElement.rotation.x = Math.PI/2;
    chainGroup.add(chainElement);
    chainGroup.add(chainElementRotatedX);
    for (let i = 0; i < 25; i++){
        let newLongChainElement = chainElement.clone();
        newLongChainElement.position.x = chainElement.position.x +i;
        chainGroup.add(newLongChainElement);
        let newShortElementChain = chainElementRotatedX.clone();
        newShortElementChain.position.x = chainElementRotatedX.position.x + i;
        chainGroup.add(newShortElementChain);
    }
    let chainGroupBelow = chainGroup.clone();
    chainGroup.position.z =1.3;
    chainGroup.rotation.z =0.04;
    chainGroup.rotation.y = -0.07;

    chainGroupBelow.position.y = -9.3;
    chainGroupBelow.position.z =1.3;
    chainGroupBelow.position.x = 1;
    chainGroupBelow.rotation.y = -0.07;
    chainGroupBelow.rotation.z = 0.15;
    let cChainGroup = new THREE.Group();
    let step = Math.PI/15;
    for (let i = 0; i < Math.PI; i+= step){
        let newLongRotatedChainElement = makeTorusMesh(0.5, 0.1,16, 100, materials[12]);
        newLongRotatedChainElement.scale.x = 0.85;
        newLongRotatedChainElement.scale.y = 0.4;
        newLongRotatedChainElement.rotation.x = Math.PI/2;
        newLongRotatedChainElement.rotation.y = i- 1.5;
        newLongRotatedChainElement.position.x = 4.5* Math.cos(i) ;
        newLongRotatedChainElement.position.y = 2.5*Math.sin(i);
        cChainGroup.add(newLongRotatedChainElement);
    }
    let cChainGroupRight = cChainGroup.clone();
    cChainGroupRight.rotation.z = 2*Math.PI - Math.PI/2;
    cChainGroupRight.position.x = 23.1;
    cChainGroupRight.position.z = 2.8;
    cChainGroupRight.position.y = 2.1;
    cChainGroupRight.scale.x = 0.75;
    cChainGroupRight.scale.y = 0.5;


    cChainGroup.rotation.z = Math.PI/2;
    cChainGroup.position.x = -2.3;
    cChainGroup.position.z = 1.3;

    /*for (let i = 0; i < 2*Math.PI; i+=step){
        let gearSpikeClone = gearSpikeMesh.clone();
        gearSpikeClone.rotation.z = i - 1.6;
        gearSpikeClone.position.x = 2 * Math.cos(i);
        gearSpikeClone.position.z = 2 * Math.sin(i);
        gearCylinderMesh.add(gearSpikeClone);
    }*/

    wholeChain.add(chainGroup);
    wholeChain.add(chainGroupBelow);
    wholeChain.add(cChainGroup);
    wholeChain.add(cChainGroupRight);
    //wholeChain.add(chainGroupBelowRight);
    return wholeChain;
}

function addGrass(){
    //Plane med gress-farge
    let planeGeo = new THREE.PlaneGeometry(SIZE * 2, SIZE * 2);
    let planeMesh = new THREE.Mesh(planeGeo, materials[5]);
    planeMesh.rotation.x = Math.PI / 2;
    planeMesh.receiveShadow = true;	//NB!
    scene.add(planeMesh);

}

function addPlainPlane(){
    let gPlane = new THREE.PlaneGeometry(SIZE * 2, SIZE * 2);
    let mPlane = new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide });
    let meshPlane = new THREE.Mesh(gPlane, mPlane);
    meshPlane.rotation.x = Math.PI / 2;
    meshPlane.receiveShadow = true;	//NB!
    scene.add(meshPlane);
}