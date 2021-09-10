"use strict";
/*
    buffer og draw for et kube.
*/
let vertexBufferCube = null;
let colorBufferCube = null;

function initCubeBuffers() {
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

    //Ulike farge for hver side:
    let colors = new Float32Array([
        //Forsiden:
        1.0, 0.0, 0.0, 1,
        1.0, 0.0, 0.0, 1,
        1.0, 0.0, 0.0, 1,

        1.0, 0.0, 0.0, 1,
        1.0, 0.0, 0.0, 1,
        1.0, 0.0, 0.0, 1,

        //H�yre side:
        0.0, 1.0, 0.0, 1,
        0.0, 1.0, 0.0, 1,
        0.0, 1.0, 0.0, 1,

        0.0, 1.0, 0.0, 1,
        0.0, 1.0, 0.0, 1,
        0.0, 1.0, 0.0, 1,

        //Baksiden:
        1.0, 0, 0.0, 1,
        1.0, 0, 0.0, 1,
        1.0, 0, 0.0, 1,

        1.0, 0, 0.0, 1,
        1.0, 0, 0.0, 1,
        1.0, 0, 0.0, 1,

        //Venstre side:
        0.0, 0.0, 1.0, 1,
        0.0, 0.0, 1.0, 1,
        0.0, 0.0, 1.0, 1,

        0.0, 0.0, 1.0, 1,
        0.0, 0.0, 1.0, 1,
        0.0, 0.0, 1.0, 1,

        //Topp
        0.0, 0.0, 1, 1,
        0.0, 0.0, 1, 1,
        0.0, 0.0, 1, 1,

        0.0, 0.0, 1, 1,
        0.0, 0.0, 1, 1,
        0.0, 0.0, 1, 1,

        //Bunn:
        0.5, 0.7, 0.3, 1,
        0.5, 0.7, 0.3, 1,
        0.5, 0.7, 0.3, 1,

        0.5, 0.7, 0.3, 1,
        0.5, 0.7, 0.3, 1,
        0.5, 0.7, 0.3, 1

    ]);

    // Verteksbuffer for trekanten:
    vertexBufferCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCube);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    vertexBufferCube.itemSize = 3; 		// NB!!
    vertexBufferCube.numberOfItems = 36;	// NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! M� kople fra n�r det opereres med flere buffer! Kopler til i draw().

    //Fargebuffer: oppretter, binder og skriver data til bufret:
    colorBufferCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferCube);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    colorBufferCube.itemSize = 4; 			// 4 float per farge.
    colorBufferCube.numberOfItems = 36; 	// 36 farger.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawCube() {
    setupCamera();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCube);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, vertexBufferCube.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferCube);
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, colorBufferCube.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBufferCube.numberOfItems);
}

