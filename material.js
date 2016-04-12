function Material() {}
function Shader() {}
function VertexAttribute() {}
function ShaderUniform() {}

VertexAttribute.prototype = {
	name : "",
	varLocation : null,
	varValue : null,
}

ShaderUniform.prototype = {
	name : "",
	varLocation : null,
	varValue : null,
	varType : null,
}

Shader.prototype = {
	name : "",
	program : null,
	fragment : null,
	vertex : null,
	vertexName : "",
	fragmentName : "",
	vertexAttributes : {},
	uniforms : {},
	addVertexAttribute : function(name) {
		this.vertexAttributes[name] = new VertexAttribute();
		this.vertexAttributes[name].name = name;
	},
	addUniform : function(name) {
		this.uniforms[name] = new VertexAttribute();
		this.uniforms[name].name = name;
	},
	initShaders : function() {
		this.program = gl.createProgram();
		
		if (this.fragmentName !== null) {
			this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(this.fragment, getSourceFromDOM(this.fragmentName));
			shaderCompileCheckErr(this.fragment);
			
			gl.attachShader(this.program, this.fragment);
		}
		if (this.vertexName !== null) {
			this.vertex = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(this.vertex, getSourceFromDOM(this.vertexName));
			shaderCompileCheckErr(this.vertex);
			
			gl.attachShader(this.program, this.vertex);
		}
		
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			LogError("Link for shader program " + this.name + " failed.\n" + gl.getProgramInfoLog(this.program));
		}
	},
	_parseVariables : function () {
		// automatically parse the shader source to grab all the uniforms and attributes
	},
	useAttributes : function() {
		foreach (var va in this.vertexAttributes) {
			gl.enableVertexAttribArray(va.varLocation);
		}
		foreach (var fa in this.fragmentAttributes) {
			gl.enableVertexAttribArray(fa.varLocation);
		}
	},
	useMaterial : function() {
		gl.useProgram(shaderProgram);
		gl.enableVertexAttribArray(vertexPositionAttribute);
	},
}

Material.prototype = {
	shaders : [],
	initShaders : function () {
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
}