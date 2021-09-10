/**
 * Funksjoner og variabler knyttett til kollisjonsdeteksjon.
 * 
 */

//Finner world-posisjonene til de to meshene.
//Beregner summen av radiussen til boundingspheren til begge meshene.
//Dersom summen avstanden mellom de to meshene er mindre enn summen av radiusene returneres true, dvs. kollisjon mellom boundingspherene.
//NB! Denne m�ten � gj�re kollisjonsdeteksjon er ikke optimal for store mesh!
import * as THREE from './three/build/three.module.js';

export function coarseCollisionTest(_mesh1, _collidableMeshList) {
	var _mesh2 = undefined;
	
	for (var modelIndex = 0; modelIndex < _collidableMeshList.length; modelIndex++) {
		_mesh2 = _collidableMeshList[modelIndex];
		
		var mesh1Position = new THREE.Vector3(); 
		mesh1Position.setFromMatrixPosition( _mesh1.matrixWorld );	//Henter posisjonsvektoren fra world-matrisa.
	
		var mesh2Position = new THREE.Vector3();
		mesh2Position.setFromMatrixPosition( _mesh2.matrixWorld );	//Henter posisjonsvektoren fra world-matrisa.
		
		var distanceVector = mesh1Position.sub(mesh2Position);		//Finnver vektoren mellom posisjonene.
		var distance = distanceVector.length();						//Beregner lengden p� vektoren.
		var r1plussr2 = _mesh1.geometry.boundingSphere.radius + _mesh2.geometry.boundingSphere.radius;	//Beregner summen av radiusene.
		if (distance < r1plussr2) 									//Sjekker!
			return true;
	}
	return false;
}

//Baert p�: http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
//Se referert lenke, koden er derfra:
export function fineCollisionTest(_mesh, _collidableMeshList) {
	//Kollisjonsvariabler:
	let localVertex;
	let globalVertex;
	let directionVector;
	let ray;
	let collisionResults;
	
	//Gjennoml�per alle vertekser til meshet:
	for (let vertexIndex = 0; vertexIndex < _mesh.geometry.vertices.length; vertexIndex++)
	{	
		//Modell/lokale koordinater for meshets vertekser:
		localVertex = _mesh.geometry.vertices[vertexIndex].clone();
		//Transformerer modellkoordinat vha. meshets matrise: 
		globalVertex = localVertex.applyMatrix4(_mesh.matrixWorld);
		//Lager en RAY fra meshets posisjon (globale koordinater) til transformert verteks:
		var meshPosition = new THREE.Vector3();
		meshPosition.setFromMatrixPosition( _mesh.matrixWorld );	//Henter posisjonsvektoren fra world-matrisa.
		directionVector = globalVertex.sub( meshPosition );
		
		//Lager et Raycaster-objekt vha. 
		ray = new THREE.Raycaster( meshPosition, directionVector.clone().normalize() ); //fra, retning
		
		//Returnerer en liste med objekter som _mesh kolliderer med (n�rmeste f�rst):
		collisionResults = ray.intersectObjects( _collidableMeshList );
	
		//Dersom denne rayen treffer noen av modellene og 
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
			return true;
	}
	return false;
}
