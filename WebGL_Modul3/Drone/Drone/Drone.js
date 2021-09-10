'use strict';

class Drone {

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;
        this.stack = new Stack();
        this.cube1 = null;

        this.propellerRotation = 0;
        this.rotationsSpeed = 1000;
    }

    initBuffers() {
        this.cube1 = new Cube(this.gl, this.camera, {red:0.1, green:0.5, blue:0.5, alpha:1});
        this.cube1.initBuffers();
        this.cube2 = new Cube(this.gl, this.camera, {red:0.5, green:0.1, blue:0.5, alpha:1});
        this.cube2.initBuffers();

        this.cylinder = new Cylinder(this.gl,
            this.camera,
            {red:0.5, green:0.9, blue:0, alpha:1},
            {red:0.5, green:0.3, blue:0.7, alpha:1});
        this.cylinder.initBuffers();
    }

    handleKeys(elapsed, currentlyPressedKeys) {
        //...
    }

    // ROTA:
    drawRoot(elapsed, modelMatrix) {
        modelMatrix.setIdentity();
        modelMatrix.scale(2.5, 0.3, 2.5);   // Tar med skalering.
        this.stack.pushMatrix(modelMatrix);
        this.cylinder.draw(elapsed, modelMatrix);

        // ARM1:
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(2, 1.3, 0);
        this.stack.pushMatrix(modelMatrix); // Tar IKKE med skalering.
        modelMatrix.scale(1, 1, 0.2);
        this.cube1.draw(elapsed, modelMatrix);
        // Arm1-propellholder:
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(1, 1.3, 0);
        //modelMatrix.rotate(this.propellerRotation, 0, 1, 0);  //Roterer hele propellholderen.
        this.stack.pushMatrix(modelMatrix); // Tar IKKE med skalering.
        modelMatrix.scale(0.2, 1.4, 0.2);
        this.cylinder.draw(elapsed, modelMatrix);
        // Arm1-propellholder-propell-1:
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, 3, 0);
        modelMatrix.rotate(0, 0,1,0);
        modelMatrix.scale(1.2, 0.2, 0.1);
        this.cube2.draw(elapsed, modelMatrix);
        // Arm1-propellholder-propell-2:
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, 3, 0);
        modelMatrix.rotate(90, 0,1,0);
        modelMatrix.scale(1.2, 0.2, 0.1);
        this.cube2.draw(elapsed, modelMatrix);

        // ARM2:
        this.stack.popMatrix(); //NB!
        this.stack.popMatrix(); //NB!
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(90, 0,1,0);      //O
        modelMatrix.translate(2, 1.3, 0);   //O
        modelMatrix.scale(1, 1, 0.2);
        this.cube1.draw(elapsed, modelMatrix);
        // ARM3:
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(180, 0,1,0);      //O
        modelMatrix.translate(2, 1.3, 0);   //O
        modelMatrix.scale(1, 1, 0.2);
        this.cube1.draw(elapsed, modelMatrix);
        // ARM4:
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(270, 0,1,0);      //O
        modelMatrix.translate(2, 1.3, 0);   //O
        modelMatrix.scale(1, 1, 0.2);
        this.cube1.draw(elapsed, modelMatrix);
    }

    draw(elapsed, modelMatrix) {
        this.propellerRotation = this.propellerRotation + (this.rotationsSpeed * elapsed);
        this.propellerRotation %= 360;
        this.drawRoot(elapsed, modelMatrix);
    }
}


