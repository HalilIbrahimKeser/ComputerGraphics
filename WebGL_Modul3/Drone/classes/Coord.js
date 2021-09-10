"use strict";
/*
    Tegner koordinatsystemet.
*/
class Coord {

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;

        this.coordPositionBuffer = null;
        this.coordColorBuffer = null;
        this.COORD_BOUNDARY = 1000;
    }

    initBuffers() {
        let coordPositions = new Float32Array([
            //x-aksen
            -this.COORD_BOUNDARY, 0.0, 0.0,
            this.COORD_BOUNDARY, 0.0, 0.0,

            //y-aksen:
            0.0, this.COORD_BOUNDARY, 0.0,
            0.0, -this.COORD_BOUNDARY, 0.0,

            //z-aksen:
            0.0, 0.0, this.COORD_BOUNDARY,
            0.0, 0.0, -this.COORD_BOUNDARY,
        ]);

        // Verteksbuffer for koordinatsystemet:
        this.coordPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coordPositions, this.gl.STATIC_DRAW);
        this.coordPositionBuffer.itemSize = 3; 		// NB!!
        this.coordPositionBuffer.numberOfItems = 6; 	// NB!!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);	// NB!! Må kople fra når det opereres med flere buffer! Kopler til i draw().

        // Fargebuffer: oppretter, binder og skriver data til bufret:
        let coordColors = new Float32Array([
            1.0, 0.0, 0.0, 1,   // X-akse
            1.0, 0.0, 0.0, 1,
            0.0, 1.0, 0.0, 1,   // Y-akse
            0.0, 1.0, 0.0, 1,
            0.0, 0.0, 1.0, 1,   // Z-akse
            0.0, 0.0, 1.0, 1
        ]);
        this.coordColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coordColors, this.gl.STATIC_DRAW);
        this.coordColorBuffer.itemSize = 4; 		// 4 float per farge.
        this.coordColorBuffer.numberOfItems = 6; 	// 6 farger.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    draw(elapsed) {
        this.camera.setCamera();

        let modelMatrix = new Matrix4();
        modelMatrix.setIdentity();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordPositionBuffer);
        let a_Position = this.gl.getAttribLocation(this.gl.program, "a_Position");
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordColorBuffer);
        let a_Color = this.gl.getAttribLocation(this.gl.program, "a_Color");
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);

        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix");

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);
        this.gl.drawArrays(this.gl.LINES, 0, this.coordPositionBuffer.numberOfItems);
    }
}


