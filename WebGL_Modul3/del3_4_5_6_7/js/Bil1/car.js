"use strict";
/*
    Tegner en bil.
*/
let steeringRot = 20;
let craneBaseRot = 0;
let wheelRot = 0;

function initCarBuffers() {
    initCircleBuffers();
    initCubeBuffers();
}

function drawCar(elapsed) {
    setupCamera();

    // Viser styrevinkel:
    document.getElementById("angle").innerHTML = steeringRot;

    modelMatrix.setIdentity();
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(1,1,1);
    pushMatrix(modelMatrix);

    // I*T*O*R*S  der O = R * T
    // Rota/platformen.
    modelMatrix = peekMatrix();
    modelMatrix.translate(0,0,0);
    modelMatrix.scale(15,0.8,6);
    drawCube();
    // Styrhus:
    modelMatrix = peekMatrix();
    modelMatrix.translate(2.5, 2, -2);
    modelMatrix.scale(2,2,1);
    drawCube();

    // *** Aksling og hjul FORAN - med STYRING:
    modelMatrix = peekMatrix();
    modelMatrix.translate(-10.5, -1.2, 0);
    modelMatrix.rotate(steeringRot, 0, 1, 0);
    pushMatrix(modelMatrix);
    //- Aksling:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(0.4,0.4,8);
    drawCube();
    //- Akselbolt:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 1, 0);
    modelMatrix.scale(0.4,1.6,0.4);
    drawCube();
    //- Venstre hjul:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, 8);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.rotate(wheelRot, 0, 1, 0);    //egen akse!!
    modelMatrix.scale(2.5,1,2.5);
    drawCircle();
    //- Høyre hjul:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, -8);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.rotate(wheelRot, 0, 1, 0);    //egen akse!!
    modelMatrix.scale(2.5,1,2.5);
    drawCircle();

    popMatrix();    // Ta utgangspunkt i "rota" igjen.

    // *** Aksling og hjul BAK:
    modelMatrix = peekMatrix();
    modelMatrix.translate(10.5, -1.2, 0);
    pushMatrix(modelMatrix);
    //- Aksling:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(0.4,0.4,8);
    drawCube();
    //- Akselbolt-1:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 1, 3.5);
    modelMatrix.scale(0.4,1.6,0.4);
    drawCube();
    //- Akselbolt-2:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 1, -3.5);
    modelMatrix.scale(0.4,1.6,0.4);
    drawCube();
    //- Venstre hjul:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, 8);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.rotate(wheelRot, 0, 1, 0);    //egen akse!!
    modelMatrix.scale(2.5,1,2.5);
    drawCircle();
    //- Høyre hjul:
    modelMatrix = peekMatrix();
    modelMatrix.translate(0, 0, -8);
    modelMatrix.rotate(90, 1, 0, 0);
    modelMatrix.rotate(wheelRot, 0, 1, 0);    //egen akse!!
    modelMatrix.scale(2.5,1,2.5);
    drawCircle();

    popMatrix();    // Ta utgangspunkt i "rota" igjen.

    //- Boks:
    modelMatrix = peekMatrix();
    modelMatrix.translate(15, 0.1, 0);
    modelMatrix.rotate(craneBaseRot, 0, 1, 0);
    pushMatrix(modelMatrix);
    drawCube();
}
