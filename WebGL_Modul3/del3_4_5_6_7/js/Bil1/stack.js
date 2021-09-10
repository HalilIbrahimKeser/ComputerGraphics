let matrixStack = [];

//Legger matrix til stack.
function pushMatrix(matrix) {
	let copyToPush = new Matrix4(matrix);
	matrixStack.push(copyToPush);
}

//Fjerner øverste element fra stack:
function popMatrix() {
	if (matrixStack.length == 0)
		throw "Feil i popMatrix - matrisestacken er tom!";
	matrixStack.pop();
}

//Leser og returnerer toppmatrisa. NB! Fjerner ikke:
function peekMatrix() {
	if (matrixStack.length == 0)
		throw "Feil i peekMatrix - matrisestacken er tom!";
	let matrix = new Matrix4(matrixStack[matrixStack.length - 1]);
	return matrix;
}
