"use strict";
/*
    Tegner koordinatsystemet.
*/
class CubeMan {

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;

        this.steeringRot = 20;
        this.leftArmRot = 210;
        this.leftLowerArmRot = -45;

        this.stack = new Stack();
        this.cube1 = null;  // Hode ...
        this.cube2 = null;  // Armer og fingre.
        this.cube3 = null;  // Torso.
    }

    initBuffers() {
        this.cube1 = new Cube(this.gl, this.camera, {red:0.5, green:0.9, blue:0, alpha:1});
        this.cube1.initBuffers();

        this.cube2 = new Cube(this.gl, this.camera, {red:0.9, green:0.4, blue:0.4, alpha:1});
        this.cube2.initBuffers();

        this.cube3 = new Cube(this.gl, this.camera, {red:0.2, green:0.4, blue:1, alpha:1});
        this.cube3.initBuffers();
    }

    handleKeys(elapsed, currentlyPressedKeys) {
        // for styring av armer osv.
    }

    draw(elapsed, modelMatrix) {
        //modelMatrix.setIdentity();
        this.stack.pushMatrix(modelMatrix);	 	//Legges på toppen av stacken.
        // HUSK: I*T*O*R*S  der O = R * T
        //TORSO:
        modelMatrix.scale(4, 6, 1);     // 8 bred, 12 høy
        this.cube3.draw(elapsed, modelMatrix);
        //HALSEN:
        modelMatrix = this.stack.peekMatrix();     // Bruker toppen av stack som utgangspunkt
        modelMatrix.translate(0, 6.2, 0); // Legger til en translate
        modelMatrix.scale(0.4, 0.3, 1);
        this.cube2.draw(elapsed, modelMatrix);
        //HODET:
        modelMatrix = this.stack.peekMatrix();         // Bruker toppen av stack som utgangspunkt
        modelMatrix.translate(0, 8.5, 0);   // osv ...
        modelMatrix.scale(2, 2, 1);
        this.cube1.draw(elapsed, modelMatrix);
        //*** HØYRE ARM & FINGRER:
        //** Overarm:
        modelMatrix = this.stack.peekMatrix();
        //* Translate
        modelMatrix.translate(4, 6, 0);     // 4) Flytt til korrekt posisjon på torso, dvs. 4 til høyre og 6 opp.
        //* Orbit
        modelMatrix.rotate(45, 0, 0, 1);    // 3) Roter om Z-aksen
        modelMatrix.translate(2, 0, 0);     // 2) Flytter 2 til høyre slik at venstre kant kommer i X=0
        this.stack.pushMatrix(modelMatrix);	        // PUSHER!
        //* Scale
        modelMatrix.scale(2, 0.5, 0.5);     // 1) Skaler, armlengde = 4 (kuben er i utgangspunktet 2x2x2, fra -1 til 1 i alle akser)
        this.cube2.draw(elapsed, modelMatrix);

        //** Underarm:
        modelMatrix = this.stack.peekMatrix();
        //* Translate
        modelMatrix.translate(2, 0, 0);     // 4) Flytt til korrekt posisjon på overarm, dvs. 2 til høyre (side overarmen er 2 lang).
        //* Orbit
        modelMatrix.rotate(60, 0, 0, 1);   // 3) Roter om Z-aksen
        modelMatrix.translate(3, 0, 0);     // 2) Flytter 3 til høyre slik at venstre kant kommer i X=0
        this.stack.pushMatrix(modelMatrix);	        // PUSHER!
        modelMatrix.scale(3, 0.5, 0.5);     // 1) Skaler, armlengde = 6:
        this.cube2.draw(elapsed, modelMatrix);

        //** Finger-1:
        //* Translate
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(3, 0, 0);     // 4) Flytt til korrekt posisjon på underarm, dvs. 3 til høyre (side overarmen er 2 lang).
        //* Orbit:
        modelMatrix.rotate(-30, 0, 0, 1);   // 3) Roter om Z-aksen
        modelMatrix.translate(1, 0, 0);     // 2) Flytter 1 til høyre slik at venstre kant kommer i X=0
        //* Scale:
        modelMatrix.scale(1, 0.15, 0.15);   // 1) Skaler, fingerlengde=2:
        this.cube1.draw(elapsed, modelMatrix);

        //** Finger-2:
        //* Translate
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(3, 0, 0);
        //* Orbit:
        modelMatrix.rotate(0, 0, 0, 1);
        modelMatrix.translate(1, 0, 0);
        //* Scale:
        modelMatrix.scale(1, 0.15, 0.15);
        this.cube2.draw(elapsed, modelMatrix);

        //** Finger-3:
        //* Translate
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(3, 0, 0);
        //* Orbit:
        modelMatrix.rotate(30, 0, 0, 1);
        modelMatrix.translate(1, 0, 0);
        //* Scale:
        modelMatrix.scale(1, 0.15, 0.15);
        this.cube1.draw(elapsed, modelMatrix);

        //Tømmer stacken ...:
        this.stack.empty();
    }
}


