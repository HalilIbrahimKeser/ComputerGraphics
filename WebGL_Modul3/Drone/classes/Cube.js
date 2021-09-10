"use strict";
/*
    buffer og draw for et kube.
*/
class Cube {
    constructor(gl, camera, color) {
        this.gl = gl;
        this.camera = camera;
        if (!color)
            this.color = {red:0.8, green:0.4, blue:0.6, alpha:1};
        else
            this.color = color;         // Forventer et objekt, f.eks. slk: {red: 1, green:0, blue:0, alpha:1}
        this.vertexBufferCube = null;
        this.colorBufferCube = null;

        // Tegne som wireframe, vha. LINE_STRIP, eller ikke?
        this.wireFrame = false;
    }

    initBuffers() {
        //KUBEN:
        //36 stk posisjoner:
        let cubeVertices = new Float32Array([
            //Forsiden (pos):
            -1, 1, 1,
            -1,-1, 1,
            1,-1, 1,

            -1,1,1,
            1, -1, 1,
            1,1,1,

            //H�yre side:
            1,1,1,
            1,-1,1,
            1,-1,-1,

            1,1,1,
            1,-1,-1,
            1,1,-1,

            //Baksiden (pos):
            1,-1,-1,
            -1,-1,-1,
            1, 1,-1,

            -1,-1,-1,
            -1,1,-1,
            1,1,-1,

            //Venstre side:
            -1,-1,-1,
            -1,1,1,
            -1,1,-1,

            -1,-1,1,
            -1,1,1,
            -1,-1,-1,

            //Topp:
            -1,1,1,
            1,1,1,
            -1,1,-1,

            -1,1,-1,
            1,1,1,
            1,1,-1,

            //Bunn:
            -1,-1,-1,
            -1,-1,1,
            1,-1,1,

            -1,-1,-1,
            1,-1,1,
            1,-1,-1
        ]);

        //Samme farge på alle sider:
        let colorArray = [];
        for (let i=0; i < 36; i++) {
            colorArray.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
        let colors = new Float32Array(colorArray);

        // Verteksbuffer for trekanten:
        this.vertexBufferCube = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCube);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, cubeVertices, this.gl.STATIC_DRAW);
        this.vertexBufferCube.itemSize = 3; 		// NB!!
        this.vertexBufferCube.numberOfItems = 36;	// NB!!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);	// NB!! M� kople fra n�r det opereres med flere buffer! Kopler til i draw().

        //Fargebuffer: oppretter, binder og skriver data til bufret:
        this.colorBufferCube = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBufferCube);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
        this.colorBufferCube.itemSize = 4; 			// 4 float per farge.
        this.colorBufferCube.numberOfItems = 36; 	// 36 farger.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed, modelMatrix) {     //HER!!
        this.camera.setCamera();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCube);
        let a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        this.gl.vertexAttribPointer(a_Position, this.vertexBufferCube.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBufferCube);
        let a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        this.gl.vertexAttribPointer(a_Color, this.colorBufferCube.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);    //HER!!
        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");   // HER!!
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix"); // HER!!

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);   //HER!!
        if (this.wireFrame) {
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.vertexBufferCube.numberOfItems);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBufferCube.numberOfItems);
        }
    }
}


