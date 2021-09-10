"use strict";

// https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-create-a-torus.html
// Og Werner sin kode
//
// Endret og omgjort til en class med constructor, tilpasset resten av classene

class Torus {
    constructor(gl, camera, color) {
        this.gl = gl;
        this.camera = camera;

        if (!color)
            this.color = {red:0.5, green:0.5, blue:0.6, alpha:1};
        else
            this.color = color;

        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.vertexBufferTorus  = [];
        this.torusIndexBuffer  = [];
        this.torusIndices  = [];


        this.vertices = [];
        this.torusVertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.slices = 20;
        this.loops= 50;
        this.inner_rad= 0.25;
        this.outerRad= 2.2;

        this.initTorusVertices();
    }

    initBuffers() {
        this.torusVertices = new Float32Array(this.vertices);

        // Verteksbuffer:
        this.vertexBufferTorus = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferTorus);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.torusVertices, this.gl.STATIC_DRAW);
        this.vertexBufferTorus.itemSize = 7;
        this.vertexBufferTorus.numberOfItems = this.torusVertices.length/7;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        // Indexer
        this.torusIndices = new Uint16Array( this.indices);
        this.torusIndexBuffer =  this.gl.createBuffer();
        this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER,  this.torusIndexBuffer);
        this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER,  this.torusIndices,  this.gl.STATIC_DRAW);
        this.torusIndexBuffer.no_indices =  this.torusIndices.length;
        this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    initTorusVertices() {
        for (let slice = 0; slice <= this.slices; ++slice) {
            const v = slice / this.slices;
            const slice_angle = v * 2 * Math.PI;
            const cos_slices = Math.cos(slice_angle);
            const sin_slices = Math.sin(slice_angle);
            const slice_rad = this.outerRad + this.inner_rad * cos_slices;

            for (let loop = 0; loop <= this.loops; ++loop) {
                //   x=(R+r·cos(v))cos(w)
                //   y=(R+r·cos(v))sin(w)
                //             z=r.sin(v)
                const u = loop / this.loops;
                const loop_angle = u * 2 * Math.PI;
                const cos_loops = Math.cos(loop_angle);
                const sin_loops = Math.sin(loop_angle);

                const x = slice_rad * cos_loops;
                const y = slice_rad * sin_loops;
                const z = this.inner_rad * sin_slices;

                this.vertices.push(x, y, z, 0.2, 0.2, 0.2, 1.0);
                this.normals.push(
                    cos_loops * sin_slices,
                    sin_loops * sin_slices,
                    cos_slices);

                this.texCoords.push(u);
                this.texCoords.push(v);
            }
        }
                // 0  1  2  3  4  5
                // 6  7  8  9  10 11
                // 12 13 14 15 16 17
        const vertsPerSlice = this.loops + 1;
        for (let i = 0; i < this.slices; ++i) {
            let v1 = i * vertsPerSlice;
            let v2 = v1 + vertsPerSlice;

            for (let j = 0; j < this.loops; ++j) {
                this.indices.push(v1);
                this.indices.push(v1 + 1);
                this.indices.push(v2);
                this.indices.push(v2);
                this.indices.push(v1 + 1);
                this.indices.push(v2 + 1);
                v1 += 1;
                v2 += 1;
            }
        }
        //this.indices = undefined;
    }

    draw(elapsed, modelMatrix) {
        this.stride = (3 + 4) * 4;
        this.colorOfset = 3 * 4;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferTorus);
        let a_Position = this.gl.getAttribLocation(this.gl.program, "a_Position");
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, this.stride, 0);
        this.gl.enableVertexAttribArray(a_Position);

        let a_Color = this.gl.getAttribLocation(this.gl.program, "a_Color");
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, this.stride, this.colorOfset);
        this.gl.enableVertexAttribArray(a_Color);

        this.camera.setCamera();



        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");   // HER!!
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix"); // HER!!

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.torusIndexBuffer);
        this.gl.drawElements(this.gl.LINE_STRIP, this.torusIndexBuffer.no_indices, this.gl.UNSIGNED_SHORT, 0);
    }
}



