var gl = {};

var LogElement;

function initGL(canvas) {
    gl = null;
    
    try {
        // get a webgl or experimental webgl context
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) { }
    
    if (!gl) {
        gl = null;
    }
    
    if (gl) {
        // set clear to black
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // enable depth test
        gl.enable(gl.DEPTH_TEST);
        // set the depth function to <=
        gl.depthFunc(gl.LEQUAL);
        // clear the color/depth buffers
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}

function initShaders() {
    var fragmentShader = getShaderFromDOM(gl, "shader-fs");
    var vertexShader = getShaderFromDOM(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    
    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
}

function getSourceFromDOM(id) {
	// adapted from a mozilla example, modified to only grab source and return it
	 var shaderScript, shaderSource, currentChild;

	shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	shaderSource = "";
	currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
		  theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}
	return shaderSource;
}

function LogError(message) {
	if (LogElement != null) {
		var text = document.createTextNode(message);
		var par = document.createElement('p');
		par.appendChild(text);
		LogElement.appendChild(par);
	}
	else {
		alert(message);
	}
}

function shaderCompileCheckErr(shader) {
	// Compile the shader program
	gl.compileShader(shader);  

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		LogError("Shader compilation failed.\n" + gl.getShaderInfoLog(shader));  
		return null;  
	}
}

function checkGLError(message) {
	// TODO function for checking gl errors along the way
	// message is meant for telling you what operation was being performed
}