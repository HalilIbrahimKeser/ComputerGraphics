"use strict";
/*
    Tegner en kubemann.
*/
let steeringRot = 20;
let craneBaseRot = 0;
let leftArmRot = 210;
let leftLowerArmRot = -45;

function initCubemanBuffers() {
    initCubeBuffers();
}

function drawCubeman(elapsed) {
    setupCamera();

    // Viser styrevinkel:
    document.getElementById("angle").innerHTML = steeringRot;

    modelMatrix.setIdentity();
    pushMatrix(modelMatrix);	 	//Legges på toppen av stacken.
    // HUSK: I*T*O*R*S  der O = R * T
    //TORSO:
    modelMatrix.scale(4, 6, 1);     // 8 bred, 12 høy
    drawCube();
    //HALSEN:
    modelMatrix = peekMatrix();     // Bruker toppen av stack som utgangspunkt
    modelMatrix.translate(0, 6, 0); // Legger til en translate
    modelMatrix.scale(0.4, 1, 1);
    drawCube();
    //HODET:
    modelMatrix = peekMatrix();         // Bruker toppen av stack som utgangspunkt
    modelMatrix.translate(0, 8.5, 0);   // osv ...
    modelMatrix.scale(2, 2, 1);
    drawCube();
    //*** HØYRE ARM & FINGRER:
    //** Overarm:
    modelMatrix = peekMatrix();
    //* Translate
    modelMatrix.translate(4, 6, 0);     // 4) Flytt til korrekt posisjon på torso, dvs. 4 til høyre og 6 opp.
    //* Orbit
    modelMatrix.rotate(45, 0, 0, 1);    // 3) Roter om Z-aksen
    modelMatrix.translate(2, 0, 0);     // 2) Flytter 2 til høyre slik at venstre kant kommer i X=0
    pushMatrix(modelMatrix);	        // PUSHER!
    //* Scale
    modelMatrix.scale(2, 0.5, 0.5);     // 1) Skaler, armlengde = 4 (kuben er i utgangspunktet 2x2x2, fra -1 til 1 i alle akser)
    drawCube();

    //** Underarm:
    modelMatrix = peekMatrix();
    //* Translate
    modelMatrix.translate(2, 0, 0);     // 4) Flytt til korrekt posisjon på overarm, dvs. 2 til høyre (side overarmen er 2 lang).
    //* Orbit
    modelMatrix.rotate(60, 0, 0, 1);   // 3) Roter om Z-aksen
    modelMatrix.translate(3, 0, 0);     // 2) Flytter 3 til høyre slik at venstre kant kommer i X=0
    pushMatrix(modelMatrix);	        // PUSHER!
    modelMatrix.scale(3, 0.5, 0.5);     // 1) Skaler, armlengde = 6:
    drawCube();

    //** Finger-1:
    //* Translate
    modelMatrix = peekMatrix();
    modelMatrix.translate(3, 0, 0);     // 4) Flytt til korrekt posisjon på underarm, dvs. 3 til høyre (side overarmen er 2 lang).
    //* Orbit:
    modelMatrix.rotate(-30, 0, 0, 1);   // 3) Roter om Z-aksen
    modelMatrix.translate(1, 0, 0);     // 2) Flytter 1 til høyre slik at venstre kant kommer i X=0
    //* Scale:
    modelMatrix.scale(1, 0.15, 0.15);   // 1) Skaler, fingerlengde=2:
    drawCube();

    //** Finger-2:
    //* Translate
    modelMatrix = peekMatrix();
    modelMatrix.translate(3, 0, 0);
    //* Orbit:
    modelMatrix.rotate(0, 0, 0, 1);
    modelMatrix.translate(1, 0, 0);
    //* Scale:
    modelMatrix.scale(1, 0.15, 0.15);
    drawCube();

    //** Finger-3:
    //* Translate
    modelMatrix = peekMatrix();
    modelMatrix.translate(3, 0, 0);
    //* Orbit:
    modelMatrix.rotate(30, 0, 0, 1);
    modelMatrix.translate(1, 0, 0);
    //* Scale:
    modelMatrix.scale(1, 0.15, 0.15);
    drawCube();

    //Tømmer stacken ...:
    while (matrixStack.length > 0)
        matrixStack.pop();

}
