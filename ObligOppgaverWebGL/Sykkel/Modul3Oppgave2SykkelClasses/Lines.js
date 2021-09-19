"use strict";
/*
    buffer og draw for et plan.
*/
class Lines {
    constructor(gl, camera, canvas) {
        this.gl = gl;
        this.camera = camera;
        this.canvas = canvas;

        this.linePositionBuffer = null;
        this.lineColorBuffer = null;
    }

    initBuffers() {
        let xzplanePositions = new Float32Array([
            -0.1, 2.2, 6.6,    //xyz
            0.29, 2.3, 2,

            -0.1, 1.3, 6.6,    //xyz
            0.3, 0.4, 2.2,
        ]);
        // Farger:
        let xzplaneColors = new Float32Array([
            0.910, 0.00910, 0.189, 1,
            0.910, 0.00910, 0.189, 1,
            0.910, 0.00910, 0.189, 1,
            0.910, 0.00910, 0.189, 1,
        ]);
        // Position buffer:
        this.linePositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.linePositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, xzplanePositions, this.gl.STATIC_DRAW);
        this.linePositionBuffer.itemSize = 3; // NB!!
        this.linePositionBuffer.numberOfItems = 4; // NB!!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // Color buffer:
        this.lineColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, xzplaneColors, this.gl.STATIC_DRAW);
        this.lineColorBuffer.itemSize = 4; // NB!!
        this.lineColorBuffer.numberOfItems = 4; // NB!!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed) {
        this.camera.setCamera();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.linePositionBuffer);
        let a_Position = this.gl.getAttribLocation(this.gl.program, "a_Position");
        this.gl.vertexAttribPointer(a_Position, this.linePositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineColorBuffer);
        let a_Color = this.gl.getAttribLocation(this.gl.program, "a_Color");
        this.gl.vertexAttribPointer(a_Color, this.lineColorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        let modelMatrix = new Matrix4();

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);    //HER!!
        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix");

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        this.gl.drawArrays(this.gl.LINES, 0, this.linePositionBuffer.numberOfItems);
    }
}


