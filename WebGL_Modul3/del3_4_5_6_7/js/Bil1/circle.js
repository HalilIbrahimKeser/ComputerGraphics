"use strict";
/*
    buffer og draw for en flat sirkel.
*/
let circleFloat32Vertices = null;
let vertexBufferCircle = null;
let noVertsCircle = 0;

function initCircleVertices() {
    let toPI = 2*Math.PI;
    let circleVertices = [];	//Tegnes vha. TRIANGLE_FAN
    let stepGrader = 40;
    let step = (Math.PI / 180) * stepGrader;
    //console.log("step=");
    //console.log(step);
    let r=0.8, g=0.8, b=0.8, a=1;

    // Senterpunkt:
    let x=0, y=0, z=0;
    circleVertices = circleVertices.concat(x,y,z, r,g,b,a); //NB! bruk av concat!!
    noVertsCircle++;
    for (let phi = 0.0; phi <= toPI; phi += step)
    {
        x = Math.cos(phi);
        y = 0;
        z = Math.sin(phi);

        circleVertices = circleVertices.concat(x,y,z, r,g,b,a);
        noVertsCircle++;
    }
    circleFloat32Vertices = new Float32Array(circleVertices);
}

function initCircleBuffers() {
    initCircleVertices();
    vertexBufferCircle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCircle);
    gl.bufferData(gl.ARRAY_BUFFER, circleFloat32Vertices, gl.STATIC_DRAW);

    vertexBufferCircle.itemSize = 3 + 4;
    vertexBufferCircle.numberOfItems = noVertsCircle; //= antall vertekser
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawCircle() {
    setupCamera();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCircle);

    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    let stride = (3 + 4) * 4;
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);

    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);
    gl.enableVertexAttribArray(a_Color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexBufferCircle.numberOfItems);
}

