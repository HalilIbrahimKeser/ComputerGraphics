/**
 * Funksjoner som lager meshobjekter til dronen.
 */
import * as THREE from '../../lib/three/build/three.module.js';

export function createDroneBaseMesh(diameter=6, height=1) {
	let geometry = new THREE.CylinderGeometry(diameter/2,diameter/2,height,50);
	let material = new THREE.MeshPhongMaterial({/*wireframe: true,*/ color:0xAAAAAA, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createArmBaseMesh(length, height) {
	let geometry = new THREE.BoxGeometry(length,height,1);
	let material = new THREE.MeshPhongMaterial({color:0xF00D0F, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createEngineMesh(height) {
    let geometry = new THREE.CylinderGeometry(0.5,0.5,height,50);
    let material = new THREE.MeshPhongMaterial({color:0x00DDDD, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createPropellerMesh(propLengt, propHeight, propWidth) {
	let geometry = new THREE.BoxGeometry(propLengt, propHeight, propWidth);
	let material = new THREE.MeshPhongMaterial({color:0x05DD09, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createFootMesh(height) {
	let geometry = new THREE.CylinderGeometry(0.3,0.3,height,6);
	let material = new THREE.MeshPhongMaterial({color:0xAAAAAA});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createSphereMesh(radius) {
	let geometry = new THREE.SphereGeometry(0.3,32, 16);
	let material = new THREE.MeshPhongMaterial({emissive: 0xFFFF00, color:0xEEEEEE, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}

export function createPropellerCoverMesh(radius) {
	let geometry = new THREE.SphereGeometry(radius, 15, 3, 0, Math.PI*2, 1, 0.8);
	let material = new THREE.MeshPhongMaterial({wireframeLinewidth: 5, wireframe: true, color:0xAAAAAA, side: THREE.DoubleSide});
	let mesh = new THREE.Mesh( geometry, material);
	return mesh;
}
