function Material(inShaders, inTextures) {
	if (inShaders != null) {
		this.shaders = inShaders;
	}
	else {
		this.shaders = [];
	}
	if (inTextures != null) {
		this.textures = inTextures;
	}
	else {
		this.textures = [];
	}
}
function Shader(inName, inVertName, inFragName) {
	if (inName != null) {
		this.name = inName;
	}
	else {
		this.name = "";
	}
	if (inVertName != null) {
		this.vertexName = inVertName;
	}
	else {
		this.vertexName = "";
	}
	if (inFragName != null) {
		this.fragmentName = inFragName;
	}
	else {
		this.fragmentName = "";
	}
	this.vertexAttributes = {
		position : new VertexAttribute("position"),
		normal : new VertexAttribute("normal"),
		uv : new VertexAttribute("uv")
	};
	this.program = null;
	this.fragment = null;
	this.vertex = null;
	this.uniforms = {};
	this.initShader();
}
function VertexAttribute(inName) {
	if (inName != null) {
		this.name = inName
	}
	else {
		name = "";
	}
	this.varLocation = null;
	this.varBuffer = null;
	this.varType = gl.FLOAT; // default to float3s
	this.varNumber = 3;
}
function Texture() {}

function ShaderUniform() {
	this.name = "";
	this.varLocation = null;
	this.varValue = null;
	this.varType = gl.FLOAT; // default to float
	this.varNumber = 3; // default to 3 vec
	this.isMatrix = false; // boolean to determine if this is a matrix or not
}

Shader.prototype = {
	addVertexAttribute : function(name) {
		this.vertexAttributes[name] = new VertexAttribute();
		this.vertexAttributes[name].name = name;
	},
	addUniform : function(name) {
		this.uniforms[name] = new VertexAttribute();
		this.uniforms[name].name = name;
	},
	initShader : function() {
		this.program = gl.createProgram();
		
		if (this.fragmentName != null) {
			this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(this.fragment, getSourceFromDOM(this.fragmentName));
			shaderCompileCheckErr(this.fragment);
			
			gl.attachShader(this.program, this.fragment);
		}
		if (this.vertexName != null) {
			this.vertex = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(this.vertex, getSourceFromDOM(this.vertexName));
			shaderCompileCheckErr(this.vertex);
			
			gl.attachShader(this.program, this.vertex);
		}
		
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			LogError("Link for shader program " + this.name + " failed.\n" + gl.getProgramInfoLog(this.program));
		}
	},
	_parseVariables : function () {
		// automatically parse the shader source to grab all the uniforms and attributes
	},
	setMeshAttributes : function(meshobj) {
		// set the position/normal/uv attributes for a mesh
		this.getAttributeLocations();
		
		this.vertexAttributes.position.varBuffer = meshobj.vertexBuffer;
		this.vertexAttributes.position.varType = gl.FLOAT;
		this.vertexAttributes.position.varNumber = 4;
		
		this.vertexAttributes.normal.varBuffer = meshobj.normalBuffer;
		this.vertexAttributes.normal.varType = gl.FLOAT;
		this.vertexAttributes.normal.varNumber = 3;
		
		this.vertexAttributes.uv.varBuffer = meshobj.uvBuffer;
		this.vertexAttributes.uv.varType = gl.FLOAT;
		this.vertexAttributes.uv.varNumber = 2;
	},
	getAttributeLocations : function() {
		for (var attr in this.vertexAttributes) {
			attr.varLocation = gl.getAttributeLocation(this.program, attr.name);
		}
	},
	useAttributes : function() {
		for (var va in this.vertexAttributes) {
			gl.enableVertexAttribArray(va.varLocation);
		}
	},
	useMaterial : function() {
		gl.useProgram(shaderProgram);
		for (var attr in this.vertexAttributes) {		
			gl.enableVertexAttribArray(attr.varLocation);
			gl.bindBuffer(gl.ARRAY_BUFFER, attr.varBuffer);
			// because i always forget what order the parameters go:
			// vertexAttribPointer(GLint attrib location, GLint size, type, normalized?, stride, offset)
			gl.vertexAttribPointer(attr.varLocation, attr.varNumber, attr.varType, false, 0, 0);
		}
	},
}

Material.prototype = {
	addShader : function(inShaderName, inVertName, inFragName) {
		this.shaders.push(new Shader(inShaderName, inVertName, inFragName));
	},
	initShaders : function (meshobj) {
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			this.shaders[idx].initShader();
			this.shaders[idx].setMeshAttributes(meshobj);
		}
	},
	draw : function() {
		
	},
}