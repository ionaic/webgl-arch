var gl = {}; // sets to an empty object, prevents null errors (they'll be silent)

var LogElement; // element for error logging

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

		// set the viewport
		gl.viewport(0, 0, canvas.width, canvas.height);
    }
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

	while (currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
		  shaderSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}
	return shaderSource;
}

function LogError(rawMessage) {
	// var message = rawMessage.replace(/\n/, "<br>", "gim");
	var message = rawMessage;
	if (LogElement != null) {
		var text = document.createTextNode(message);
		var par = document.createElement('pre');
		par.appendChild(text);
		LogElement.appendChild(par);
	}
	else {
		alert(message);
	}
}

function shaderCompileCheckErr(shaderName, shader) {
	// Compile the shader program
	gl.compileShader(shader);  

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		LogError("Shader compilation for " + shaderName + " failed.\n" + gl.getShaderInfoLog(shader));  
	}
	else {
		LogError("Compiled shader " + shaderName + ".\n" + gl.getShaderInfoLog(shader));
	}
}

function checkGLError(message) {
	// TODO function for checking gl errors along the way
	// message is meant for telling you what operation was being performed
}