//Genererer et tilfeldig heltall i omr�det fra min til max.
//Fra: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Roterer vektor et antall grader (delta) for gitt akse:
function rotateVector(delta, vector, axisX, axisY, axisZ) {
	var matrix = new Matrix4();
	matrix.setIdentity();
	matrix.rotate(delta, axisX, axisY, axisZ);
	vec3.transformMat4(vector, vector, matrix.elements);
};

//NY 2017: Når Image-objektets .src settes startes nedlasting. Når nedlastinga er ferdig kalles image.onload().
//Denne kaller tilbake til objektet som initierte nedlastinga vha. callBackRef.
function loadTexture(callBackRef, textureUrl) {
	var image = new Image();
	image.onload = function() {
		callBackRef(image);
	};
	image.src = textureUrl; //onload kalles når lasting er ferdig!
}

function loadTextureImage(callBackRef, textureUrl) {
	var image = new Image();
	image.onload = function() {
		callBackRef.textureFinishedLoading(image);
	};
	image.src = textureUrl; //onload kalles n�r lasting er ferdig!
}

function loadTextureImage2(callBackRef, textureUrl, ref) {
	var image = new Image();
	image.onload = function() {
		callBackRef.textureFinishedLoading(image, ref);
	};
	image.src = textureUrl; //onload kalles n�r lasting er ferdig!
}

//Returnerer URL til shaders_IKKE_I_BRUK-mappa.
//Mappa m� ligge direkte under oppstartsprogrammet (dvs. .html fila).
function shadersLocationURL() {
	//Lager korrekt url/mappenavn til /shaders_IKKE_I_BRUK-mappa:
	var p = document.location.pathname;
	var elements = p.split("/");
	var path ="/";
	for (var i=0; i<elements.length-1; i++) {
		if (elements[i].trim().length > 0)
			path += elements[i] + "/";
	}
	var completePath = document.location.protocol + "//" + document.location.host + path + "shaders_IKKE_I_BRUK/";
	return completePath;
}

//GLSLShaderLoader-klassen.
//Laster først verteksshaderen. Når denne er komplett nedlastet kompileres denne.
//Deretter starter nedlasting av fragmentshaderen som så kompileres.
//Når denne er klar kaller loadShaders() funksjonen tilbake til _callBackRef.
//_callBackRef kommer som innparameter til loadShaders() og indikerer hvilken
//funksjon som skal kalles når begge shaderfunksjoner er lastet og kompilert.
function GLSLShaderLoader(_vertexShaderURL, _fragmentShaderURL) {
	this.vertexShaderURL = _vertexShaderURL;
	this.fragmentShaderURL = _fragmentShaderURL;
	this.vertexShader = undefined;
	this.fragmentShader = undefined;
	this.sp = undefined;
	this.shaderLoaded = false;
	this.fshaderLoaded = false;
	this.vshaderLoaded = false;

	var shaderSelfRef = this;

	this.loadShaders = function(_callBackRef) {
		//Laster verteksshaderkoden:
		var vsClient = new XMLHttpRequest();
		vsClient.open('GET', this.vertexShaderURL, true); //true = async
		vsClient.onreadystatechange = function() {
			//Se her: 	http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
			//og/eller: http://antongerdelan.net/webgl/shadersandajax.html
			//4: foresp�rsel ferdig og svar foreligger.
			//200: HTPP OK
			if (vsClient.readyState == 4 && vsClient.status == 200){
				shaderSelfRef.vertexShader = shaderSelfRef.getVertexShader(vsClient.responseText);
				this.vshaderLoaded = true;

				//Laster fragmentshaderkoden:
				var fsClient = new XMLHttpRequest();
				fsClient.open('GET', shaderSelfRef.fragmentShaderURL, true);
				fsClient.onreadystatechange = function() {
					if (fsClient.readyState == 4 && fsClient.status == 200){
						shaderSelfRef.fragmentShader = shaderSelfRef.getFragmentShader(fsClient.responseText);
						this.fshaderLoaded = true;
						if (shaderSelfRef.linkShaderProgram()) {
							shaderSelfRef.shaderLoaded = true;
							//Kall tilbake til kaller:
							_callBackRef(shaderSelfRef.sp);
						} else {
							alert("GLSLShader.prototype.loadShaders: Fikk ikke lastet shadere!");
						}
					}
				};
				if (!this.fshaderLoaded)
					fsClient.send();
			}
		};
		if (!this.vshaderLoaded)
			vsClient.send();
	};

	//Returnerer referanse til kompilert verteksshaderkode:
	this.getVertexShader = function(source) {
	    var shader = gl.createShader(gl.VERTEX_SHADER);
	    //Sett shadersource-kode:
	    gl.shaderSource(shader, source);
	    //Kompiler shader:
	    gl.compileShader(shader);

	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    	console.log('Feil ved kompilering av verteksshaderkoden.');
	        return null;
	    }
	    return shader;
	}

	//Returnerer referanse til kompilert fragmentshaderkode:
	this.getFragmentShader = function(source) {
	    var shader = gl.createShader(gl.FRAGMENT_SHADER);
	    //Sett shadersource-kode:
	    gl.shaderSource(shader, source);
	    //Kompiler shader:
	    gl.compileShader(shader);

	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    	console.log('Feil ved kompilering av fragmentshaderkoden.');
	        return null;
	    }
	    return shader;
	}

	//Lenker teksturfarge-shaderne:
	this.linkShaderProgram = function() {
		this.sp = gl.createProgram();
	    gl.attachShader(this.sp, this.vertexShader);
	    gl.attachShader(this.sp, this.fragmentShader);
	    gl.linkProgram(this.sp);

	    if (!gl.getProgramParameter(this.sp, gl.LINK_STATUS)) {
	        alert("Fikk ikke lenket shadere...");
	        return false;
	    } else {
	        return true;
	    }
	}
}

//NY 2017:  GLSLShaderLoader-klassen.
//Laster først verteksshaderen. Når denne er komplett nedlastet kompileres denne.
//Deretter starter nedlasting av fragmentshaderen som så kompileres.
//Når denne er klar kaller loadShaders() funksjonen tilbake til _callBackRef.
//_callBackRef kommer som innparameter til loadShaders() og indikerer hvilken
//funksjon som skal kalles når begge shaderfunksjoner er lastet og kompilert.
class ShaderLoader {

	constructor(gl, vertexShaderURL, fragmentShaderURL)
	{
		this.gl = gl;
		this.vertexShaderURL = vertexShaderURL;
		this.fragmentShaderURL = fragmentShaderURL;

		this.vertexShader = undefined;
		this.fragmentShader = undefined;
		this.sp = undefined;
		this.shaderLoaded = false;
		this.fshaderLoaded = false;
		this.vshaderLoaded = false;
	}

	loadShaders(_callBackRef) {
		//Laster verteksshaderkoden:
		var shaderSelfRef = this;

		var vsClient = new XMLHttpRequest();
		vsClient.open("GET", this.vertexShaderURL, true); //true = async

		vsClient.onreadystatechange = function() {
			//Se her: 	http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
			//og/eller: http://antongerdelan.net/webgl/shadersandajax.html
			//4: foresp�rsel ferdig og svar foreligger.
			//200: HTPP OK
			if (vsClient.readyState == 4 && vsClient.status == 200){
				shaderSelfRef.vertexShader = shaderSelfRef.getVertexShader(vsClient.responseText);
				this.vshaderLoaded = true;

				//Laster fragmentshaderkoden:
				var fsClient = new XMLHttpRequest();
				fsClient.open("GET", shaderSelfRef.fragmentShaderURL, true);
				fsClient.onreadystatechange = function() {
					if (fsClient.readyState == 4 && fsClient.status == 200){
						shaderSelfRef.fragmentShader = shaderSelfRef.getFragmentShader(fsClient.responseText);
						this.fshaderLoaded = true;
						if (shaderSelfRef.linkShaderProgram()) {
							shaderSelfRef.shaderLoaded = true;
							//Kall tilbake til kaller:
							_callBackRef(shaderSelfRef.sp);
						} else {
							alert("GLSLShader.prototype.loadShaders: Fikk ikke lastet shadere!");
						}
					}
				};
				if (!this.fshaderLoaded)
					fsClient.send();
			}
		};
		if (!this.vshaderLoaded)
			vsClient.send();
	}

	//Returnerer referanse til kompilert verteksshaderkode:
	getVertexShader(source) {
		var shader = this.gl.createShader(this.gl.VERTEX_SHADER);
		//Sett shadersource-kode:
		this.gl.shaderSource(shader, source);
		//Kompiler shader:
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.log("Feil ved kompilering av verteksshaderkoden.");
			return null;
		}
		return shader;
	}

	//Returnerer referanse til kompilert fragmentshaderkode:
	getFragmentShader(source) {
		var shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		//Sett shadersource-kode:
		this.gl.shaderSource(shader, source);
		//Kompiler shader:
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.log("Feil ved kompilering av fragmentshaderkoden.");
			return null;
		}
		return shader;
	}

	//Lenker teksturfarge-shaderne:
	linkShaderProgram() {
		this.sp = this.gl.createProgram();
		this.gl.attachShader(this.sp, this.vertexShader);
		this.gl.attachShader(this.sp, this.fragmentShader);
		this.gl.linkProgram(this.sp);

		if (!this.gl.getProgramParameter(this.sp, this.gl.LINK_STATUS)) {
			alert("Fikk ikke lenket shadere...");
			return false;
		} else {
			return true;
		}
	}

}
