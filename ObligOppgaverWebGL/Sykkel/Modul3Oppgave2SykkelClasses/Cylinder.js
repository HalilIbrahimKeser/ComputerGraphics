"use strict";

// http://www.songho.ca/opengl/gl_cylinder.html
//
// Endret og omgjort til en class med constructor, tilpasset resten av classene

class Cylinder {
    constructor(gl, camera, color) {
        this.gl = gl;
        this.camera = camera;

        if (!color)
            this.color = {red:0.5, green:0.5, blue:0.6, alpha:1};
        else
            this.color = color;

        this.circleFloat32Vertices = null;
        this.vertexBufferCircle = null;
        this.noVertsCircle = 0;

        this.baseRadius = 0.1;
        this.topRadius = 0.1;
        this.height = 3;
        this.sectorCount = 18;
        this.stackCount = 1;
        this.smooth = false;

        this.unitCircleVertices = [];
        this.vertices = [];
        this.normals = [];
        this.colorArray = [];
        this.colors = null;
        this.texCoords = [];
        this.indices = [];
        this.interleavedVertices = [];
        this.stride = 32;   // stride for interleaved vertices, always=32
        this.vboVertex = gl.createBuffer();
        this.vboIndex = gl.createBuffer();

        this.initCylinderVertices();
        if(this.smooth)
            this.buildVerticesSmooth();
        else
            this.buildVerticesFlat();

    }

    initBuffers() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboVertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.interleavedVertices, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        // INDICIES
        this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.vboIndex);
        this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER, this.indices,  this.gl.STATIC_DRAW);
        this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null);

        for (let i=0; i < 36; i++) {
            this.colorArray.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
        this.colors = new Float32Array(this.colorArray);

        //COLORS
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colors, this.gl.STATIC_DRAW);
        this.colorBuffer.itemSize = 4;
        this.colorBuffer.numberOfItems = 36;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    initCylinderVertices() {
        let sectorStep = 2 * Math.PI / this.sectorCount;
        let sectorAngle = 0;
        this.unitCircleVertices.length = 0; // clear prev array
        this.unitCircleVertices = new Float32Array((this.sectorCount + 1) * 3);
        for(let i = 0, j = 0; i <= this.sectorCount; ++i, j += 3)
        {
            sectorAngle = i * sectorStep;
            this.unitCircleVertices[j] = Math.cos(sectorAngle);
            this.unitCircleVertices[j+1] = Math.sin(sectorAngle);
            this.unitCircleVertices[j+2] = 0;
        }
    }

    buildVerticesSmooth ()
    {
        // resize typed arrays
        this.resizeArraysSmooth();

        let x, y, z, r, s, t, i, j, k, k1, k2;
        let ii = 0;
        let jj = 0;
        let kk = 0;
        let sideNormals = this.getSideNormals();

        // put vertices of side cylinder to array by scaling unit circle
        for(i=0; i <= this.stackCount; ++i)
        {
            z = -(this.height * 0.5) + i / this.stackCount * this.height;
            r = this.baseRadius + i / this.stackCount * (this.topRadius - this.baseRadius); // interpolate radius
            t = 1.0 - i / this.stackCount;   // top-to-bottom

            for(j=0, k=0; j <= this.sectorCount; ++j, k+=3)
            {
                x = this.unitCircleVertices[k];
                y = this.unitCircleVertices[k+1];
                this.addVertex(ii, x*r, y*r, z);
                this.addNormal(ii, sideNormals[k], sideNormals[k+1], sideNormals[k+2]);
                s = j / this.sectorCount;
                this.addTexCoord(jj, s, t);
                // next
                ii += 3;
                jj += 2;
            }
        }

        // remember where the base.top vertices start
        let baseVertexIndex = ii / 3;

        // put vertices of base of cylinder
        z = -this.height * 0.5;
        this.addVertex(ii, 0, 0, z);
        this.addNormal(ii, 0, 0, -1);
        this.addTexCoord(jj, 0.5, 0.5);
        ii += 3;
        jj += 2;
        for(i=0, j=0; i < this.sectorCount; ++i, j+=3)
        {
            x = this.unitCircleVertices[j];
            y = this.unitCircleVertices[j+1];
            this.addVertex(ii, x*this.baseRadius, y*this.baseRadius, z);
            this.addNormal(ii, 0, 0, -1);
            this.addTexCoord(jj, -x*0.5+0.5, -y*0.5+0.5);   // flip horizontal
            ii += 3;
            jj += 2;
        }

        // remember where the base vertices start
        let topVertexIndex = ii / 3;

        // put vertices of top of cylinder
        z = this.height * 0.5;
        this.addVertex(ii, 0, 0, z);
        this.addNormal(ii, 0, 0, 1);
        this.addTexCoord(jj, 0.5, 0.5);
        ii += 3;
        jj += 2;
        for(i=0, j=0; i < this.sectorCount; ++i, j+=3)
        {
            x = this.unitCircleVertices[j];
            y = this.unitCircleVertices[j+1];
            this.addVertex(ii, x*this.topRadius, y*this.topRadius, z);
            this.addNormal(ii, 0, 0, 1);
            this.addTexCoord(jj, x*0.5+0.5, -y*0.5+0.5);
            ii += 3;
            jj += 2;
        }

        // put indices for sides
        for(i=0; i < this.stackCount; ++i)
        {
            k1 = i * (this.sectorCount + 1);     // bebinning of current stack
            k2 = k1 + this.sectorCount + 1;      // beginning of next stack

            for(j=0; j < this.sectorCount; ++j, ++k1, ++k2)
            {
                // 2 trianles per sector
                this.addIndices(kk, k1, k1 + 1, k2);
                this.addIndices(kk+3, k2, k1 + 1, k2 + 1);
                kk += 6;
            }
        }

        // put indices for base
        for(i=0, k=baseVertexIndex+1; i < this.sectorCount; ++i, ++k)
        {
            if(i < (this.sectorCount - 1))
                this.addIndices(kk, baseVertexIndex, k + 1, k);
            else    // last triangle
                this.addIndices(kk, baseVertexIndex, baseVertexIndex + 1, k);
            kk += 3;
        }

        for(i=0, k=topVertexIndex+1; i < this.sectorCount; ++i, ++k)
        {
            if(i < (this.sectorCount - 1))
                this.addIndices(kk, topVertexIndex, k, k + 1);
            else
                this.addIndices(kk, topVertexIndex, k, topVertexIndex + 1);
            kk += 3;
        }

        // generate interleaved vertex array as well
        this.buildInterleavedVertices();
        this.initBuffers();
    }

    buildVerticesFlat ()
    {
        let i, j, k, l, m, x, y, z, r, t;
        let tmpVertices = [];
        let vertex = {};    // to store (x,y,z,s,t)
        // eslint-disable-next-line no-unused-vars
        for(i=0, m=0; i <= this.stackCount; ++i)
        {
            z = -(this.height * 0.5) + i / this.stackCount * this.height;
            r = this.baseRadius + i / this.stackCount * (this.topRadius - this.baseRadius);
            t = 1.0 - i / this.stackCount;
            for(j=0, k=0, l=0; j <= this.sectorCount; ++j, k+=3, l+=2)
            {
                x = this.unitCircleVertices[k];
                y = this.unitCircleVertices[k+1];
                vertex = {x:x*r, y:y*r, z:z, s:j/this.sectorCount, t:t};
                tmpVertices.push(vertex);
            }
        }

        // resize typed arrays
        this.resizeArraysFlat();

        let v1, v2, v3, v4, n, index, ii, jj, kk, vi1, vi2;
        ii = jj = kk = index = 0;
        // v2-v4 <= stack at i+1
        // | \ |
        // v1-v3 <= stack at i
        for(i=0; i < this.stackCount; ++i)
        {
            vi1 = i * (this.sectorCount + 1);
            vi2 = (i+1) * (this.sectorCount+1);

            for(j=0; j < this.sectorCount; ++j, ++vi1, ++vi2)
            {
                v1 = tmpVertices[vi1];
                v2 = tmpVertices[vi2];
                v3 = tmpVertices[vi1+1];
                v4 = tmpVertices[vi2+1];

                // add vertices/normals/texCoords of a quad: v1-v2-v3-v4
                this.addVertex(ii,   v1.x, v1.y, v1.z);
                this.addVertex(ii+3, v2.x, v2.y, v2.z);
                this.addVertex(ii+6, v3.x, v3.y, v3.z);
                this.addVertex(ii+9, v4.x, v4.y, v4.z);
                this.addTexCoord(jj,   v1.s, v1.t);
                this.addTexCoord(jj+2, v2.s, v2.t);
                this.addTexCoord(jj+4, v3.s, v3.t);
                this.addTexCoord(jj+6, v4.s, v4.t);

                // normal for v1-v3-v2
                n = Cylinder.computeFaceNormal(v1.x,v1.y,v1.z, v3.x,v3.y,v3.z, v2.x,v2.y,v2.z);
                for(k=0; k < 4; ++k)  // same normals for all 4 vertices
                {
                    this.addNormal(ii+(k*3), n[0], n[1], n[2]);
                }

                // next
                ii += 12;
                jj += 8;

                // add indices of quad
                this.addIndices(kk,   index, index+2, index+1);     // v1-v3-v2
                this.addIndices(kk+3, index+1, index+2, index+3);   // v2-v3-v4
                kk += 6;
                index += 4; // for next
            }
        }

        // remember where the base index starts
        let baseVertexIndex = ii / 3;

        // put vertices of base of cylinder
        z = -this.height * 0.5;
        this.addVertex(ii, 0, 0, z);
        this.addNormal(ii, 0, 0, -1);
        this.addTexCoord(jj, 0.5, 0.5);
        ii += 3;
        jj += 2;
        for(i=0, j=0; i < this.sectorCount; ++i, j+=3)
        {
            x = this.unitCircleVertices[j];
            y = this.unitCircleVertices[j+1];
            this.addVertex(ii, x*this.baseRadius, y*this.baseRadius, z);
            this.addNormal(ii, 0, 0, -1);
            this.addTexCoord(jj, -x*0.5+0.5, -y*0.5+0.5);   // flip horizontal
            ii += 3;
            jj += 2;
        }

        // put indices for base
        for(i=0, k=baseVertexIndex+1; i < this.sectorCount; ++i, ++k)
        {
            if(i < this.sectorCount - 1)
                this.addIndices(kk, baseVertexIndex, k+1, k);
            else
                this.addIndices(kk, baseVertexIndex, baseVertexIndex+1, k);

            kk += 3;
        }

        // remember where the top index starts
        let topVertexIndex = ii / 3;

        // put vertices of top of cylinder
        z = this.height * 0.5;
        this.addVertex(ii, 0, 0, z);
        this.addNormal(ii, 0, 0, 1);
        this.addTexCoord(jj, 0.5, 0.5);
        ii += 3;
        jj += 2;
        for(i=0, j=0; i < this.sectorCount; ++i, j+=3)
        {
            x = this.unitCircleVertices[j];
            y = this.unitCircleVertices[j+1];
            this.addVertex(ii, x*this.topRadius, y*this.topRadius, z);
            this.addNormal(ii, 0, 0, 1);
            this.addTexCoord(jj, x*0.5+0.5, -y*0.5+0.5);
            ii += 3;
            jj += 2;
        }

        for(i=0, k=topVertexIndex+1; i < this.sectorCount; ++i, ++k)
        {
            if(i < this.sectorCount - 1)
                this.addIndices(kk, topVertexIndex, k, k+1);
            else
                this.addIndices(kk, topVertexIndex, k, topVertexIndex+1);

            kk += 3;
        }

        // generate interleaved vertex array as well
        this.buildInterleavedVertices();
        this.initBuffers();
    }

    buildInterleavedVertices ()
    {
        let vertexCount = this.getVertexCount();
        this.interleavedVertices.length = 0;
        this.interleavedVertices = new Float32Array(vertexCount * 8); // v(3)+n(3)+t(2)

        let i, j, k;
        for(i=0, j=0, k=0; i < this.vertices.length; i+=3, j+=2, k+=8)
        {
            this.interleavedVertices[k]   = this.vertices[i];
            this.interleavedVertices[k+1] = this.vertices[i+1];
            this.interleavedVertices[k+2] = this.vertices[i+2];

            this.interleavedVertices[k+3] = this.normals[i];
            this.interleavedVertices[k+4] = this.normals[i+1];
            this.interleavedVertices[k+5] = this.normals[i+2];

            this.interleavedVertices[k+6] = this.texCoords[j];
            this.interleavedVertices[k+7] = this.texCoords[j+1];
        }
    }

    getSideNormals ()
    {
        let sectorStep = 2 * Math.PI / this.sectorCount;
        let sectorAngle = 0;

        let zAngle = Math.atan2(this.baseRadius - this.topRadius, this.height);
        let x0 = Math.cos(zAngle);
        let y0 = 0;
        let z0 = Math.sin(zAngle);

        let normals = new Float32Array(3 * (this.sectorCount + 1));
        for(let i = 0, j = 0; i <= this.sectorCount; ++i, j+=3)
        {
            sectorAngle = i * sectorStep;
            normals[j]   = Math.cos(sectorAngle)*x0 - Math.sin(sectorAngle)*y0;
            normals[j+1] = Math.sin(sectorAngle)*x0 + Math.cos(sectorAngle)*y0;
            normals[j+2] = z0;
        }
        return normals;
    }

    addVertex (index, x, y, z)
    {
        this.vertices[index]   = x;
        this.vertices[index+1] = y;
        this.vertices[index+2] = z;
    }
    addNormal (index, x, y, z)
    {
        this.normals[index]   = x;
        this.normals[index+1] = y;
        this.normals[index+2] = z;
    }
    addTexCoord (index, s, t)
    {
        this.texCoords[index]   = s;
        this.texCoords[index+1] = t;
    }
    addIndices (index, i1, i2, i3)
    {
        this.indices[index]   = i1;
        this.indices[index+1] = i2;
        this.indices[index+2] = i3;
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed, modelMatrix) {     //HER!!
        this.camera.setCamera();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboVertex);
        let a_Position = this.gl.getAttribLocation(this.gl.program, "a_Position");
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, this.stride, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        let a_Color = this.gl.getAttribLocation(this.gl.program, "a_Color");
        this.gl.vertexAttribPointer(a_Color, this.colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vboIndex);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");   // HER!!
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix"); // HER!!

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        this.gl.drawElements(this.gl.TRIANGLES, this.getIndexCount(), this.gl.UNSIGNED_SHORT, 0);
    }
    getTriangleCount ()
    {
        return this.getIndexCount() / 3;
    }
    getIndexCount()
    {
        return this.indices.length;
    }
    getVertexCount()
    {
        return this.vertices.length / 3;
    }
    getNormalCount()
    {
        return this.normals.length / 3;
    }
    getTexCoordCount ()
    {
        return this.texCoords.length / 2;
    }

    clearArrays ()
    {
        this.vertices.length = 0;
        this.normals.length = 0;
        this.texCoords.length = 0;
        this.indices.length = 0;
        this.interleavedVertices.length = 0;
    }
    resizeArraysSmooth ()
    {
        this.clearArrays();
        let sideCount = (this.sectorCount + 1) * (this.stackCount + 1);
        let baseCount = (this.sectorCount + 1) * 2;   // base + top
        this.vertices = new Float32Array(3 * (sideCount + baseCount));
        this.normals = new Float32Array(3 * (sideCount + baseCount));
        this.texCoords = new Float32Array(2 * (sideCount + baseCount));
        this.indices = new Uint16Array(6 * this.sectorCount * this.stackCount + 2 * 3 * this.sectorCount);
    }
    resizeArraysFlat ()
    {
        this.clearArrays();
        let sideCount = this.sectorCount * 4 * this.stackCount;
        let baseCount = (this.sectorCount + 1) * 2;   // base + top
        this.vertices = new Float32Array(3 * (sideCount + baseCount));
        this.normals = new Float32Array(3 * (sideCount + baseCount));
        this.texCoords = new Float32Array(2 * (sideCount + baseCount));
        this.indices = new Uint16Array(6 * this.sectorCount * this.stackCount + 2 * 3 * this.sectorCount);
    }
}

Cylinder.computeFaceNormal = function(x1,y1,z1, x2,y2,z2, x3,y3,z3)
{
    let normal = new Float32Array(3);
    let ex1 = x2 - x1;
    let ey1 = y2 - y1;
    let ez1 = z2 - z1;
    let ex2 = x3 - x1;
    let ey2 = y3 - y1;
    let ez2 = z3 - z1;
    // cross product: e1 x e2;
    let nx = ey1 * ez2 - ez1 * ey2;
    let ny = ez1 * ex2 - ex1 * ez2;
    let nz = ex1 * ey2 - ey1 * ex2;
    let length = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if(length > 0.000001)
    {
        normal[0] = nx / length;
        normal[1] = ny / length;
        normal[2] = nz / length;
    }
    return normal;
};


