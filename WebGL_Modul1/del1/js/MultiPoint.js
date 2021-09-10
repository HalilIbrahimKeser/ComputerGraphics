// MultiPoint.js
// Vertex shader program
let VSHADER_SOURCE =
   "attribute vec4 a_Position;\n" +
   "attribute float a_PointSize; \n" +
   "void main() {\n" +
   "  gl_Position = a_Position;\n" + 	// Verteksen.
   "  gl_PointSize = a_PointSize;\n" +
   "}\n";

// Fragment shader program
let FSHADER_SOURCE =
   "precision mediump float;\n" +
   "uniform vec4 u_FragColor;\n" +     //bruker prefiks u_ for å indikere uniform
   "void main() {\n" +
   "  gl_FragColor = u_FragColor;\n" + // Fargeverdi.
   "}\n";

function main() {
	// Hent <canvas> elementet
	let canvas = document.getElementById("webgl");

	// Rendering context for WebGL:
	let gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("Fikk ikke tak i rendering context for WebGL");
		return;
	}
	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Feil ved initialisering av shaderkoden.");
		return;
	}

	//Initialiserer verteksbuffer:
	let noVertexes = initVertexBuffers(gl);

	//Koper punktstørrelse og farge:
	let a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
	if (a_PointSize < 0) {
		console.log("Fant ikke parametret a_PoinSize i shaderen!?");
		return;
	}
	let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (u_FragColor < 0) {
		console.log("Fant ikke uniform-parametret u_FragColor i shaderen!?");
		return;
	}

	// Sender punktst�rrelsen og farge til shaderen:
	gl.vertexAttrib1f(a_PointSize, 10.0);
	let rgba = [0.3,0.5,1.0,1.0];
	gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
	gl.clearColor(0.0, 7.0, 0.4, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Tegner n punkter:
	gl.drawArrays(gl.POINTS, 0, noVertexes);
}

function initVertexBuffers(gl) {
  //3 stk 2D vertekser:
  let vertices = new Float32Array([0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.2, -0.7, 0.3 ]);
  let noVertexes = vertices.length / 3; // Antall vertekser

  // Oppretter et bufferobjekt:
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
	  console.log("Fikk ikke laget et bufferobjekt!?");
	  return -1;
  }

  // Binder bufferobjektet:
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Skriver til bufferobjektet:
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Finner posisjonen til a_Position i shaderen:
  let a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
	console.log("Fant ikke parametret a_Position i shaderen!?");
	return -1;
  }

  // Kople posisjonsparametret til bufferobjektet:
  // 3=ant. Floats per verteks
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enabler bufret:
  gl.enableVertexAttribArray(a_Position);
  return noVertexes;
}
