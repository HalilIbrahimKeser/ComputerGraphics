class Stack {
	constructor() {
		this.matrixStack = [];
	}

	//Legger matrix til stack.
	pushMatrix(matrix) {
		let copyToPush = new Matrix4(matrix);
		this.matrixStack.push(copyToPush);
	}

	//Fjerner øverste element fra stack:
	popMatrix() {
		if (this.matrixStack.length == 0)
			throw "Feil i popMatrix - matrisestacken er tom!";
		this.matrixStack.pop();
	}

	//Leser og returnerer toppmatrisa. NB! Fjerner ikke:
	peekMatrix() {
		if (this.matrixStack.length == 0)
			throw "Feil i peekMatrix - matrisestacken er tom!";
		let matrix = new Matrix4(this.matrixStack[this.matrixStack.length - 1]);
		return matrix;
	}

	empty() {
		this.matrixStack = [];
		/*
		while (this.matrixStack.length > 0)
			this.matrixStack.pop();
		 */
	}
}
