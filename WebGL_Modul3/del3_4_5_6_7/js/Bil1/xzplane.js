"use strict";
/*
    buffer og draw for et XZ-plan.
*/
// Verteksbuffer:
let xzplanePositionBuffer = null;
let xzplaneColorBuffer = null;

function initXZPlaneBuffers() {
    let xzplanePositions = new Float32Array([
        -width / 2, 0, height / 2,
        width / 2, 0, height / 2,
        -width / 2, 0, -height / 2,
        width / 2, 0, -height / 2
    ]);
    // Farger:
    let xzplaneColors = new Float32Array([
        0.3, 0.5, 0.2, 1,
        0.3, 0.5, 0.2, 1,
        0.3, 0.5, 0.2, 1,
        0.3, 0.5, 0.2, 1
    ]);
    // Position buffer:
    xzplanePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplanePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xzplanePositions, gl.STATIC_DRAW);
    xzplanePositionBuffer.itemSize = 3; // NB!!
    xzplanePositionBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Color buffer:
    xzplaneColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplaneColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xzplaneColors, gl.STATIC_DRAW);
    xzplaneColorBuffer.itemSize = 4; // NB!!
    xzplaneColorBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawXZPlane(elapsed) {
    setupCamera();

    //Binder buffer og parametre:
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplanePositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, xzplaneColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef�lge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, xzplanePositionBuffer.numberOfItems);
}
