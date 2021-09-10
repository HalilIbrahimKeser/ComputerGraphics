function main() {

	let u = vec3.fromValues(5,3,0);
	let v = vec3.fromValues(4,-2,0);
	//Legge sammen:
	let vsum = vec3.create();
	vec3.add(vsum, u, v);

	/*
	//Trekke fra:
	let vdif = vec3.create();
	vec3.subtract(vdif, u, v);

	//Multipliser med skalar:
	let vscalar = vec3.create();
	let scale = 2;
	vec3.scale(vscalar, u, scale);

	//Normaliserer:
	let vnorm = vec3.create();
	vec3.normalize(vnorm, v);

	//Prikkprodukt:
	let ud = vec3.fromValues(0.0, 5.0, 0.0);
	let vd = vec3.fromValues(5.0, 5.0, 0.0);

	let udn = vec3.create();
	vec3.normalize(udn, ud);

	let vdn = vec3.create();
	vec3.normalize(vdn, vd);

	let cosFi = vec3.dot(udn, vdn);
	let fRadians = Math.acos(cosFi);
	let fDegree = toDegrees(fRadians);
	*/

	//Kryssprodukt; beregne normalen til flaten som
	//dannes av to vektorer:
	let u1 = vec3.fromValues(2, 1.5, 0);
	let v1 = vec3.fromValues(0,0,-7);
	let vcross1 = vec3.create();
	vec3.cross(vcross1, u1, v1);
	//let vcross2 = vec3.create();
	//vec3.cross(vcross2, v1, u1);

	let vnorm = vec3.create();
	vec3.normalize(vnorm, vcross1);

	//SKRIV UT:
	let text =

        "u=" + vec3.str(u) + "<br>" +
		"v=" + vec3.str(v) + "<br>" +
		"vsum=" + vec3.str(vsum) + "<br>"; // +
		/*
        "vdif=" + vec3.str(vdif) + "<br>" +
		"vscalar=" + vec3.str(vscalar) + "<br>" +
		"vnorm=" + vec3.str(vnorm) + "<br>" +
		"fDegree=" + fDegree + "<br>" +

		"vcross1=" + vcross1 + "<br>" +
        "norm(vcross1)=" + vnorm + "<br>";

		"vcross2=" + vcross2 + "<br>";
		*/

    document.getElementById("tekst").innerHTML = text;
}

//angle i radianer.
//returnerer grader.
function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

//angle i grader.
//returnerer radianer.
function toRadians (angle) {
  return angle * (Math.PI / 180);
}


