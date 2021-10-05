'use strict';
/*
    Tegner diverse.
*/

class MyApp {

    constructor() {
        // Kontekst og canvas:
        this.gl = null;
        this.canvas = null;

        // Tar vare på tastetrykk:
        this.currentlyPressedKeys = [];

        this.lastTime = 0.0;

        //Variabel for å beregne og vise FPS:
        this.fpsData = new Object(); //Alternativt: let fpsData = {};   //Setter fpsData til en tomt objekt.
    }

    start() {
        this.initContext();

        let uri = document.baseURI;
        document.getElementById('uri').innerHTML = uri;

        // AKTIVERER DYBDETEST:
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        // Kamera:
        this.camera = new Camera(this.canvas, this.currentlyPressedKeys);
        this.camera.setCamera();

        // Koord:
        this.coord = new CoordWithShader(this.gl, this.camera);
        this.coord.init('pos-col-vertex-shader', 'pos-col-fragment-shader');

        // XZPlane:
        this.xzplane = new XZPlaneWithShader(this.gl, this.camera, this.canvas);
        this.xzplane.init('pos-col-tex-vertex-shader','pos-col-tex-fragment-shader', 'textures/leaves.png');

        // Circle:
        this.circle = new CircleWithShader(this.gl, this.camera);
        this.circle.init('pos-col-vertex-shader', 'pos-col-fragment-shader');

        // Setter bakgrunnsfarge:
        this.gl.clearColor(0.4, 1, 1, 1.0); //RGBA

        // Initialiserer variabel for beregning av FPS:
        this.fpsData.frameCount = 0;
        this.fpsData.lastTimeStamp = 0;

        // Start animasjonsløkke:
        this.draw();
    }

    initContext() {
        // Hent <canvas> elementet
        this.canvas = document.getElementById('webgl');

        // Rendering context for WebGL:
        this.gl = this.canvas.getContext('webgl');

        if (!this.gl) {
            console.log('Fikk ikke tak i rendering context for WebGL');
            return false;
        }

        this.gl.viewport(0,0,this.canvas.width,this.canvas.height);

        //NB! Legg merke til .bind(this)
        document.addEventListener('keyup', this.handleKeyUp.bind(this), false);
        document.addEventListener('keydown', this.handleKeyDown.bind(this), false);
    }

    handleKeyUp(event) {
        this.currentlyPressedKeys[event.which] = false;
    }

    handleKeyDown(event) {
        this.currentlyPressedKeys[event.which] = true;
    }

    handleKeys(elapsed) {
        // Kameraet kontrollerer seg selv.
        this.camera.handleKeys(elapsed, this.currentlyPressedKeys);
    }

    draw(currentTime) {
        // Sørger for at draw kalles på nytt:
        window.requestAnimationFrame(this.draw.bind(this)); //Merk bind()

        if (currentTime === undefined)
            currentTime = 0; 	//Udefinert første gang.

        // Beregner og viser FPS:
        if (currentTime - this.fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forløpt...
            //Viser FPS i .html ("fps" er definert i .html fila):
            document.getElementById('fps').innerHTML = this.fpsData.frameCount;
            this.fpsData.frameCount = 0;
            this.fpsData.lastTimeStamp = currentTime; //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
        }

        // Tar høyde for varierende frame rate:
        let elapsed = 0.0;			// Forløpt tid siden siste kalle på draw().
        if (this.lastTime !== 0.0)		// Først gang er lastTime = 0.0.
            elapsed = (currentTime - this.lastTime)/1000; // Deler på 1000 for å operere med sekunder.
        this.lastTime = currentTime;						// Setter lastTime til currentTime.

        // Rensk skjermen:
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // GJENNOMSIKTIGHET:
        // Aktiverer fargeblanding (&indirekte gjennomsiktighet):
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // TEGNER...
        this.coord.draw(elapsed);
        this.xzplane.draw(elapsed);
        let modelMatrix1 = new Matrix4();
        modelMatrix1.setIdentity();
        modelMatrix1.translate(-10, 10, -15);
        modelMatrix1.scale(20, 1, 20);
        this.circle.draw(elapsed, modelMatrix1);

        // BRUKERINPUT;
        this.handleKeys(elapsed);

        this.fpsData.frameCount++;
    }
}
