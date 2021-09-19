"use strict";

// eslint-disable-next-line no-unused-vars
class Sykkel {

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;

        this.steeringRot = 0;
        this.wheelRot = 0;

        // eslint-disable-next-line no-undef
        this.stack = new Stack();
        this.cube1 = null;
        this.cube2 = null;
        this.cube3 = null;
    }

    initBuffers() {
        // eslint-disable-next-line no-undef
        this.cube1 = new Cube(this.gl, this.camera, {red:0.540, green:0.0756, blue:0.501, alpha:1});
        this.cube1.initBuffers();

        // eslint-disable-next-line no-undef
        this.cube2 = new Cube(this.gl, this.camera, {red:0.9, green:0.4, blue:0.4, alpha:1});
        this.cube2.initBuffers();

        // eslint-disable-next-line no-undef
        this.cube3 = new Cube(this.gl, this.camera, {red:0.2, green:0.4, blue:1, alpha:1});
        this.cube3.initBuffers();

        // eslint-disable-next-line no-undef
        this.circle1 = new Circle(this.gl, this.camera, {red:0.2, green:0.4, blue:1, alpha:1});
        this.circle1.initBuffers();

        // eslint-disable-next-line no-undef
        this.cylinder1 = new Cylinder(this.gl, this.camera, {red:0.540, green:0.0756, blue:0.501, alpha:1});
        this.cylinder1.initBuffers();

        // eslint-disable-next-line no-undef
        this.cylinder2 = new Cylinder(this.gl, this.camera, {red:0.325, green:0.0240, blue:0.400, alpha:1});
        this.cylinder2.initBuffers();

        // eslint-disable-next-line no-undef
        this.cylinder3 = new Cylinder(this.gl, this.camera, {red:0.325, green:0.0240, blue:0.400, alpha:1});
        this.cylinder3.initBuffers();

        // eslint-disable-next-line no-undef
        this.torus1 = new Torus(this.gl, this.camera, {red:0.325, green:0.0240, blue:0.400, alpha:1});
        this.torus1.initBuffers();

        // eslint-disable-next-line no-undef
        this.circleLine1 = new CircleLines(this.gl, this.camera, {red:0.325, green:0.0240, blue:0.400, alpha:1});
        this.circleLine1.initBuffers();

        // eslint-disable-next-line no-undef
        this.line1 = new Lines(this.gl, this.camera, {red:0.325, green:0.0240, blue:0.400, alpha:1});
        this.line1.initBuffers();
    }

    handleKeys(elapsed, currentlyPressedKeys) {
        //Sving på hjulene
        this.steeringRot = this.steeringRot % 360;
        if (currentlyPressedKeys[89]) { //Y  ++++++++++
            if (this.steeringRot > -45 && this.steeringRot < 45) {
                this.steeringRot+=1;
            }else if (this.steeringRot === -45) {
                this.steeringRot+=1;
            }
            else {
                this.steeringRot+=0;
            }
        }
        if (currentlyPressedKeys[85]) {	//U ------------
            if (this.steeringRot > -45 && this.steeringRot < 45) {
                this.steeringRot-=1;
            }else if (this.steeringRot === 45) {
                this.steeringRot-=1;
            }
            else {
                this.steeringRot-=0;
            }
        }
        if (currentlyPressedKeys[70]) { //F
            if (this.wheelRot > 100 || this.wheelRot < -100) {
                this.wheelRot+=10;
            }
            this.wheelRot+=1;
        }
        if (currentlyPressedKeys[71]) {	//G
            if (this.wheelRot > 100 || this.wheelRot < -100) {
                this.wheelRot-=10;
            }
            this.wheelRot-=1;
        }
    }

    draw(elapsed, modelMatrix) {
        //modelMatrix.setIdentity();
        this.stack.pushMatrix(modelMatrix);	 	//Legges på toppen av stacken.

        // //RAMME:    xyz
        //nedre bak opp
        modelMatrix.translate(0, -3.65, 2.65);
        modelMatrix.rotate(36, 1, 0, 0);
        modelMatrix.scale(2, 1.5, 1.5);
        this.cylinder1.draw(elapsed, modelMatrix);

        //nedrebak
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5.2, 2.5);
        modelMatrix.rotate(-5, 1, 0, 0);
        modelMatrix.scale(2, 1.4, 1.4);
        this.cylinder1.draw(elapsed, modelMatrix);

        //undersete
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -3.4, 0.6);
        modelMatrix.rotate(-80, 1, 0, 0);
        modelMatrix.scale(1.5, 1.5, 1.5);
        this.cylinder1.draw(elapsed, modelMatrix);

        //øvre ramme
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -2.1, -2.1);
        modelMatrix.rotate(5, 1, 0, 0);
        modelMatrix.scale(2, 2, 2);
        this.cylinder1.draw(elapsed, modelMatrix);

        //nedre ramme
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -3.7, -2.3);
        modelMatrix.rotate(35, 1, 0, 0);
        modelMatrix.scale(2, 2, 2.2);
        this.cylinder1.draw(elapsed, modelMatrix);

        //----------------------------------------
        //GIR og PEDAL
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-0.31, -5.4, 0.2);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(1, 1, 1);
        this.circle1.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.31, -5.4, 0.2);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(1, 1, 1);
        this.circle1.draw(elapsed, modelMatrix);

        //pedal     // HUSK: I*T*O*R*S  der O = R * T
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.53, -5.4, -0.6);
        modelMatrix.scale(0.2, 0.1, 0.8);
        this.cube2.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.83, -5.40, -0.69);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.translate(0.9, 0, 0);
        modelMatrix.scale(0.2, 0.1, 0.5);
        this.cube3.draw(elapsed, modelMatrix);

        //pedal
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-0.53, -5.4, 0.9);
        modelMatrix.scale(0.2, 0.1, 0.8);
        this.cube2.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-0.83, -5.40, 2.8);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.translate(0.9, 0, 0);
        modelMatrix.scale(0.2, 0.1, 0.5);
        this.cube3.draw(elapsed, modelMatrix);


        //-------------------------------------------
        //STEERING og RATT   // // HUSK: I*T*O*R*S  der O = R * T
        //under ratt
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -2.0, -5);
        modelMatrix.rotate(100, 1, 0, 0);
        modelMatrix.scale(1, 0.8, 0.6);
        modelMatrix.rotate(this.steeringRot, 0, 0, 1);
        this.cylinder2.draw(elapsed, modelMatrix);

        //over dekk
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.27, -4, -5.45);
        modelMatrix.rotate(this.steeringRot, 0, 1, 0.2);
        modelMatrix.scale(1, 0.7, 1.6);
        modelMatrix.rotate(95, 1, 0, 0);

        this.cylinder3.draw(elapsed, modelMatrix);
        //over dekk
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-0.27, -4, -5.45);
        modelMatrix.rotate(this.steeringRot, 0, 1, 0.2);
        modelMatrix.scale(1, 0.7, 1.6);
        modelMatrix.rotate(95, 1, 0, 0);
        this.cylinder3.draw(elapsed, modelMatrix);

        //Ratt
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -1.1, -4.8);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.scale(0.8, 1, 1);
        modelMatrix.rotate(this.steeringRot, 0, 1, 0);
        this.cylinder2.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -1.1, -4.8);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.scale(0.2, 0.2, 0.2);
        modelMatrix.rotate(this.steeringRot, 0, 1, 0);
        this.cube1.draw(elapsed, modelMatrix);

        //Ratt ramme
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -3, -5.2);
        modelMatrix.rotate(12, 1, 0, 0);
        modelMatrix.scale(0.25, 0.25, 0.25);
        modelMatrix.rotate(this.steeringRot, 0, 1, 0);
        this.cube1.draw(elapsed, modelMatrix);

        //------------------------------
        //SETE
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -1, 0.95);
        modelMatrix.scale(0.2, 0.2, 0.8);
        this.cube2.draw(elapsed, modelMatrix);

        //------------------------------
        //HJUL foran
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5, -5.7);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.scale(0.7, 0.7, 0.7);
        modelMatrix.rotate(this.steeringRot, -0.2, 1, 0);
        modelMatrix.rotate(this.wheelRot, 0, 0, 1);
        this.torus1.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5, -5.7);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(0.5, 0.5, 0.5);
        modelMatrix.rotate(this.steeringRot, 0.7, 0, 0);
        this.circle1.draw(elapsed, modelMatrix);

        //lines      // HUSK: I*T* O *R*S  der O = R * T
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5, -5.7);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(1.4, 1.5, 1.3);
        modelMatrix.rotate(this.steeringRot, 0.7, 0, 0);
        modelMatrix.rotate(this.wheelRot, 0, -1, 0);
        this.circleLine1.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(1, 1, 1);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(1, 1, 1);
        this.line1.draw(elapsed, modelMatrix);

        //HJUL bak
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5, 4.5);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.scale(0.7, 0.7, 0.7);
        modelMatrix.rotate(this.wheelRot, 0, 0, 1);
        this.torus1.draw(elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5, 4.5);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(0.5, 0.5, 0.5);
        this.circle1.draw(elapsed, modelMatrix);

        //lines
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -5, 4.5);
        modelMatrix.rotate(90, 0, 0, 1);
        modelMatrix.scale(1.4, 1.5, 1.3);
        modelMatrix.rotate(this.wheelRot, 0, -1, 0);
        this.circleLine1.draw(elapsed, modelMatrix);

        this.stack.empty();
    }
}


