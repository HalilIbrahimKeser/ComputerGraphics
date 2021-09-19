"use strict";

class MyApp {

    constructor() {
        this.gl = null;
        this.canvas = null;
        this.camera = null;

        this.currentlyPressedKeys = [];
        this.lastTime = 0.0;
        this.fpsData = {};
    }

    start() {
        this.initContext();
        document.getElementById("uri").innerHTML = document.baseURI;

        let vertexShaderSource = document.getElementById("my-vertex-shader").innerHTML;
        let fragmentShaderSource = document.getElementById("my-fragment-shader").innerHTML;
        if (!initShaders(this.gl, vertexShaderSource, fragmentShaderSource)) {
            console.log("Feil ved initialisering av shaderkoden - se over koden på nytt.");
            return;
        }

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        // Kamera:
        this.camera = new Camera(this.canvas, this.currentlyPressedKeys);
        this.camera.setCamera();

        // Koord:
        this.coord = new Coord(this.gl, this.camera);
        this.coord.initBuffers();

        // Enkeltkube:
        this.cube1 = new Cube(this.gl, this.camera, {red:1, green:0, blue:1, alpha:1});
        this.cube1.initBuffers();

        // Sykkel:
        this.sykkel = new Sykkel(this.gl, this.camera);
        this.sykkel.initBuffers();

        // XZPlane:
        this.xzplane = new XZPlane(this.gl, this.camera, this.canvas);
        this.xzplane.initBuffers();

        // Bakgrunnsfarge:
        this.gl.clearColor(0.810, 0.873, 0.910, 0.7); //RGBA

        this.fpsData.antallFrames = 0;
        this.fpsData.forrigeTidsstempel = 0;

        this.draw();
    }

    initContext() {
        this.canvas = document.getElementById("webgl");
        this.gl = this.canvas.getContext("webgl");
        if (!this.gl) {
            console.log("Fikk ikke tak i rendering context for WebGL");
            return false;
        }
        this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
        document.addEventListener("keyup", this.handleKeyUp.bind(this), false);
        document.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    }

    handleKeyUp(event) {
        this.currentlyPressedKeys[event.which] = false;
    }
    handleKeyDown(event) {
        this.currentlyPressedKeys[event.which] = true;
    }

    handleKeys(elapsed) {
        this.camera.handleKeys(elapsed);
        this.sykkel.handleKeys(elapsed, this.currentlyPressedKeys);
    }

    draw(currentTime) {
        window.requestAnimationFrame(this.draw.bind(this));

        if (currentTime === undefined)
            currentTime = 0;

        if (currentTime - this.fpsData.forrigeTidsstempel >= 1000) {
            document.getElementById("fps").innerHTML = this.fpsData.antallFrames;
            this.fpsData.antallFrames = 0;
            this.fpsData.forrigeTidsstempel = currentTime;
        }
        document.getElementById("rotantion-angle").innerHTML = this.sykkel.steeringRot;

        // document.getElementById("rotantion-velocity").innerHTML = this.sykkel.wheelRot;

        let elapsed = 0.0;
        if (this.lastTime !== 0.0)
            elapsed = (currentTime - this.lastTime)/1000;
        this.lastTime = currentTime;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // TEGNER...
        this.coord.draw(elapsed);
        this.xzplane.draw(elapsed);

        // Enkelkube:
        //let modelMatrix1 = new Matrix4();
        //modelMatrix1.translate(-10, 2, 4);
        //this.cube1.draw(elapsed, modelMatrix1);

        let modelMatrix2 = new Matrix4();
        modelMatrix2.setIdentity();
        modelMatrix2.translate(0, 6.75, 2);
        this.sykkel.draw(elapsed, modelMatrix2);

        // BRUKERINPUT;
        this.handleKeys(elapsed);

        this.fpsData.antallFrames++;
    }
}
