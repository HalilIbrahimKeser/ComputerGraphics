"use strict";
/*
    buffer og draw for et plan.
*/
class XZPlaneWithShader {
    constructor(gl, camera, canvas) {
        this.gl = gl;
        this.camera = camera;
        this.canvas = canvas;

        this.xzplanePositionBuffer = null;
        this.xzplaneColorBuffer = null;
        this.xzplaneTextureBuffer = null;

        this.readyToDraw = false;
    }

    // NB! Forutsetter at shaderne finnes i .html - fila:
    init(vertexShaderName, fragmentShaderName, textureName1) {
        let vertexShaderSource = document.getElementById(vertexShaderName).innerHTML;
        let fragmentShaderSource = document.getElementById(fragmentShaderName).innerHTML;
        this.shaderProgram = createProgram(this.gl, vertexShaderSource, fragmentShaderSource);
        if (!this.shaderProgram) {
            console.log('Feil ved initialisering av shaderkoden.');
        } else {
            this.loadTexture(textureName1);
        }
    }

    loadTexture(textureImageName) {
        const image = new Image();
        // onload-event:
        image.onload = ()=> {           // NB! Merk bruk av "Arrow function"!!
            this.initBuffers(image);    //Fortsetter!
        };
        // onerror-event:
        image.onerror = ()=> {
            // feilhåndtering...
        }
        // starter nedlasting:
        image.src = textureImageName;
    }

    initBuffers(textureImage) {
        try {
            let width = this.canvas.width;
            let height = this.canvas.height;

            let xzplanePositions = new Float32Array([
                -width / 2, 0, height / 2,
                width / 2, 0, height / 2,
                -width / 2, 0, -height / 2,
                width / 2, 0, -height / 2
            ]);
            // Position buffer:
            this.xzplanePositionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xzplanePositionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, xzplanePositions, this.gl.STATIC_DRAW);
            this.xzplanePositionBuffer.itemSize = 3; // NB!!
            this.xzplanePositionBuffer.numberOfItems = 4; // NB!!
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

            // Farger:
            let xzplaneColors = new Float32Array([
                0.3, 0.5, 0.2, 1,
                0.3, 0.5, 0.2, 1,
                0.3, 0.5, 0.2, 1,
                0.3, 0.5, 0.2, 1
            ]);
            // Color buffer:
            this.xzplaneColorBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xzplaneColorBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, xzplaneColors, this.gl.STATIC_DRAW);
            this.xzplaneColorBuffer.itemSize = 4; // NB!!
            this.xzplaneColorBuffer.numberOfItems = 4; // NB!!
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

            // TEKSTUR-RELATERT:
            // Teksturkoordinater / UV-koordinater:
            let xzplaneUvs = new Float32Array([
                0, 0,
                0, 1,
                1, 0,
                1, 1]
            );
            this.planeTexture = this.gl.createTexture();
            //Teksturbildet er nå lastet fra server, send til GPU:
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.planeTexture);
            //Unngaa at bildet kommer opp-ned:
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);   //NB! FOR GJENNOMSIKTIG BAKGRUNN!! Sett også this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            //Laster teksturbildet til GPU/shader:
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);

            //Teksturparametre:
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

            this.xzplaneTextureBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xzplaneTextureBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, xzplaneUvs, this.gl.STATIC_DRAW);
            this.xzplaneTextureBuffer.itemSize = 2;
            this.xzplaneTextureBuffer.numberOfItems = 4; //uvs.length/2;

            this.readyToDraw = true;

        } catch (error) {
            console.log('Noe feilet i initBuffers: ' + error.message);
        }
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed) {
        if (!this.readyToDraw)
            return;

        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.shaderProgram, "u_modelviewMatrix");
        let u_projectionMatrix = this.gl.getUniformLocation(this.shaderProgram, "u_projectionMatrix");
        this.gl.useProgram(this.shaderProgram);

        this.camera.setCamera();

        // Posisjon:
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xzplanePositionBuffer);
        let a_Position = this.gl.getAttribLocation(this.shaderProgram, 'a_Position');
        this.gl.vertexAttribPointer(a_Position, this.xzplanePositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);

        // Farge:
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xzplaneColorBuffer);
        let a_Color = this.gl.getAttribLocation(this.shaderProgram, 'a_Color');
        this.gl.vertexAttribPointer(a_Color, this.xzplaneColorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        // Tekstur:
        //Bind til teksturkoordinatparameter i shader:
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xzplaneTextureBuffer);
        let a_TextureCoord = this.gl.getAttribLocation(this.shaderProgram, "a_TextureCoord");
        this.gl.vertexAttribPointer(a_TextureCoord, this.xzplaneTextureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_TextureCoord);
        //Aktiver teksturenhet (0):
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.planeTexture);
        //Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
        let samplerLoc = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
        this.gl.uniform1i(samplerLoc, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        let modelMatrix = new Matrix4();
        modelMatrix.setIdentity();
        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);    //HER!!

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.xzplanePositionBuffer.numberOfItems);
    }
}
