var gl;

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
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

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

function getShader(gl, id) {
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if (!shaderScript) {
    return null;
    }

    theSource = "";
    currentChild = shaderScript.firstChild;

    while(currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
          theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } 
        else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } 
        else {
            // Unknown shader type
            return null;
        }

        gl.shaderSource(shader, theSource);
    
        // Compile the shader program
        gl.compileShader(shader);  

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
          alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
          return null;  
        }

        return shader;
    }
}
