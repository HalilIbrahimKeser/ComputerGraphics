"use strict";

class CircleWithShader {
    constructor(gl, camera, color) {
        this.gl = gl;
        this.camera = camera;
        if (!color)
            this.color = {red:1, green:1, blue:0, alpha:1};
        else
            this.color = color;  // Forventer et objekt, f.eks. slk: {red: 1, green:0, blue:0, alpha:1}

        this.circleFloat32Vertices = null;
        this.vertexBufferCircle = null;
        this.noVertsCircle = 0;
    }

    // NB! Forutsetter at shaderne finnes i .html - fila:
    init(vertexShaderName, fragmentShaderName) {
        let vertexShaderSource = document.getElementById(vertexShaderName).innerHTML;
        let fragmentShaderSource = document.getElementById(fragmentShaderName).innerHTML;
        this.shaderProgram = createProgram(this.gl, vertexShaderSource, fragmentShaderSource);
        if (!this.shaderProgram) {
            console.log('Feil ved initialisering av shaderkoden.');
        } else {
            this.initBuffers();
        }
    }

    initBuffers() {
        this.initCircleVertices();
        this.vertexBufferCircle = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCircle);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.circleFloat32Vertices, this.gl.STATIC_DRAW);

        this.vertexBufferCircle.itemSize = 3 + 4;
        this.vertexBufferCircle.numberOfItems = this.noVertsCircle; //= antall vertekser
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    initCircleVertices() {
        let toPI = 2*Math.PI;
        let circleVertices = [];	//Tegnes vha. TRIANGLE_FAN
        let stepGrader = 10;
        let step = (Math.PI / 180) * stepGrader;
        let r=this.color.red, g=this.color.green, b=this.color.blue, a=this.color.alpha;

        // Senterpunkt:
        let x=0, y=0, z=0;
        circleVertices = circleVertices.concat(x,y,z, r,g,b,a); //NB! bruk av concat!!
        this.noVertsCircle++;
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = Math.cos(phi);
            y = 0;
            z = Math.sin(phi);

            circleVertices = circleVertices.concat(x,y,z, r,g,b,a);
            this.noVertsCircle++;
        }
        this.circleFloat32Vertices = new Float32Array(circleVertices);
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed, modelMatrix) {
        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.shaderProgram, "u_modelviewMatrix");
        let u_projectionMatrix = this.gl.getUniformLocation(this.shaderProgram, "u_projectionMatrix");
        this.gl.useProgram(this.shaderProgram);

        this.camera.setCamera();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCircle);
        let a_Position = this.gl.getAttribLocation(this.shaderProgram, 'a_Position');
        let stride = (3 + 4) * 4;
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(a_Position);

        let a_Color = this.gl.getAttribLocation(this.shaderProgram, 'a_Color');
        let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, stride, colorOfset);
        this.gl.enableVertexAttribArray(a_Color);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);
        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertexBufferCircle.numberOfItems);
    }
}


