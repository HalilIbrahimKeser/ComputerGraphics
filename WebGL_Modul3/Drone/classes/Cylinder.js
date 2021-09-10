'use strict';
/*
    Vertekser og buffer for en sylinder.
*/
class Cylinder {

    constructor(gl, camera, color1, color2) {

        this.gl = gl;
        this.camera = camera;
        // Farge på sylinderens topp og bunn:
        this.color1 = color1!==undefined?color1:{red:1,green:0, blue:1, alpha:1};
        // Farge på sylinderens ytterside:
        this.color2 = color2!==undefined?color2:{red:0,green:1, blue:1, alpha:1};

        // Farge på sylinderens topp og bunn:
        this.red1 = this.color1.red;
        this.blue1 = this.color1.blue;
        this.green1 = this.color1.green;
        // Farge på sylinderens ytterside:
        this.red2 = this.color2.red;
        this.blue2 = this.color2.blue;
        this.green2 = this.color2.green;

        this.vertexBufferCylTop = null;
        this.vertexBufferCylBottom = null;
        this.vertexBufferCylWalls = null;

        this.cylinderTopVertices = null;
        this.cylinderBottomVertices = null;
        this.cylinderWallsVertices = null;

        this.noVertsTop = 0;
        this.noVertsBottom = 0;
        this.noVertsWalls = 0;

        this.verticesWalls = [];	//Tegnes vha. TRIANGLES

        this.u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
        this.u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
    }

    createRectangleVertices(phi, yVal, step) {  //0,2
        let r = this.red2;
        let g = this.green2;
        let b = this.blue2;
        let a = 1;
        let x, y, z;
        //v1:
        x = Math.cos(phi);  //cos(0)=1
        y = yVal;			//2
        z = -Math.sin(phi); //sin(0)=0
        this.verticesWalls = this.verticesWalls.concat(x,y,z, r,g,b,a);
        this.noVertsWalls++;

        //v2:
        x = Math.cos(phi);  //cos(0)=1
        y = -yVal;			//-2
        z = -Math.sin(phi); //sin(0)=0
        this.verticesWalls = this.verticesWalls.concat(x,y,z, r,g,b,a);
        this.noVertsWalls++;

        //v3:
        x = Math.cos(phi+step);
        y = -yVal;			//-2
        z = -Math.sin(phi+step);
        this.verticesWalls = this.verticesWalls.concat(x,y,z, r,g,b,a);
        this.noVertsWalls++;

        //v4:
        x = Math.cos(phi);  //cos(0)=1
        y = yVal;			//2
        z = -Math.sin(phi); //sin(0)=0

        this.verticesWalls = this.verticesWalls.concat(x,y,z, r,g,b,a);
        this.noVertsWalls++;

        //v5
        x = Math.cos(phi+step);
        y = -yVal;			//-2
        z = -Math.sin(phi+step);
        this.verticesWalls = this.verticesWalls.concat(x,y,z, r,g,b,a);
        this.noVertsWalls++;

        //v6
        x = Math.cos(phi+step);
        y = yVal;			//2
        z = -Math.sin(phi+step);
        this.verticesWalls = this.verticesWalls.concat(x,y,z, r,g,b,a);
        this.noVertsWalls++;
    }

    initCylinderVertices() {
        let toPI = 2*Math.PI;
        let verticesTop = [];	//Tegnes vha. TRIANGLE_FAN
        let stepGrader = 10;
        let step = (Math.PI / 180) * stepGrader;
        let x=0,y=2,z=0;
        let r=this.red1, g=this.green1, b=this.blue1, a=1;

        //Top:
        //Senterpunkt:
        x=0;y=2;z=0;
        verticesTop = verticesTop.concat(x,y,z, r,g,b,a);
        this.noVertsTop++;
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = Math.cos(phi);
            y = 2;
            z = Math.sin(phi);

            verticesTop = verticesTop.concat(x,y,z, r,g,b,a);
            this.noVertsTop++;
        }
        this.cylinderTopVertices = new Float32Array(verticesTop);

        //Bunn:
        //Senterpunkt:
        x=0;y=-2;z=0;
        //r=this.red2, g=this.green2, b=this.blue2, a=1;
        let verticesBottom = [];	//Tegnes vha. TRIANGLE_FAN
        verticesBottom = verticesBottom.concat(x,y,z, r,g,b,a);
        this.noVertsBottom++;
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = Math.cos(phi);
            y = -2;
            z = Math.sin(phi);

            verticesBottom = verticesBottom.concat(x,y,z, r,g,b,a);
            this.noVertsBottom++;
        }
        this.cylinderBottomVertices = new Float32Array(verticesBottom);

        //Veggene:
        let cylinderHeight = 2;
        let phi;
        for (phi=0; phi<=toPI; phi+=step) {
            this.createRectangleVertices(phi, cylinderHeight, step);
        }
        this.cylinderWallsVertices = new Float32Array(this.verticesWalls);
    }

    initBuffers() {
        this.initCylinderVertices();

        //Sylinder-topp:
        this.vertexBufferCylTop = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylTop);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.cylinderTopVertices, this.gl.STATIC_DRAW);

        this.vertexBufferCylTop.itemSize = 3 + 4;
        this.vertexBufferCylTop.numberOfItems = this.noVertsTop; //= antall vertekser
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        //Sylinder-bunn:
        this.vertexBufferCylBottom = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylBottom);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.cylinderBottomVertices, this.gl.STATIC_DRAW);

        this.vertexBufferCylBottom.itemSize = 3 + 4;
        this.vertexBufferCylBottom.numberOfItems = this.noVertsBottom; //= antall vertekser
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        //Sylinder-vegger:
        this.vertexBufferCylWalls = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylWalls);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.cylinderWallsVertices, this.gl.STATIC_DRAW);

        this.vertexBufferCylWalls.itemSize = 3 + 4;
        this.vertexBufferCylWalls.numberOfItems = this.noVertsWalls; //= antall vertekser
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed, modelMatrix) {
        this.camera.setCamera();

        // Sender matriser til shader:
        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);    //HER!!
        this.gl.uniformMatrix4fv(this.u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(this.u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        //TOPPEN:
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylTop);
        // Kople posisjonsparametret til bufferobjektet: 3=ant. floats per posisjon/verteks.
        let a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        let stride = (3 + 4) * 4;
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(a_Position);
        // Kople fargeparametret til bufferobjektet: 4=ant. floats per farge/verteks
        let a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        let colorOfset = 3 * 4; //12= offset, start p� color-info innafor verteksinfoen.
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, stride, colorOfset);
        this.gl.enableVertexAttribArray(a_Color);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertexBufferCylTop.numberOfItems);

        //BUNNEN:
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylBottom);
        a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        stride = (3 + 4) * 4;
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(a_Position);
        // Kople fargeparametret til bufferobjektet: 4=ant. Floats per verteks
        a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        colorOfset = 3 * 4; //12= offset, start p� color-info innafor verteksinfoen.
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, stride, colorOfset);
        this.gl.enableVertexAttribArray(a_Color);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertexBufferCylBottom.numberOfItems);

        //VEGGENE:
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylWalls);
        a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        stride = (3 + 4) * 4;
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(a_Position);
        // Kople fargeparametret til bufferobjektet: 4=ant. Floats per verteks
        a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        colorOfset = 3 * 4; //12= offset, start p� color-info innafor verteksinfoen.
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, stride, colorOfset);
        this.gl.enableVertexAttribArray(a_Color);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBufferCylWalls.numberOfItems);
        // this.gl.drawArrays(this.gl.LINES, 0, this.vertexBufferCylWalls.numberOfItems);
    }
}



