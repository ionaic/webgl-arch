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
VertexAttribute.prototype = {
	toString : function() {
		return "{" + this.name + ": (Loc: " + this.varLocation + "), (Buffer: " + this.varBuffer + "), (Type: " + this.varType + "), (Number: " + this.varNumber + ")}";
	}
};
function Texture() {}

function ShaderUniform() {
	this.name = "";
	this.varLocation = null;
	this.varValue = null;
	this.varType = gl.FLOAT; // default to float
	this.varNumber = 3; // default to 3 vec
	this.isMatrix = false; // boolean to determine if this is a matrix or not
}

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
function ShaderAttributes() {
	this.position = new VertexAttribute("position");
	this.normal = new VertexAttribute("normal");
	this.uv = new VertexAttribute("uv");
	LogError("Constructing ShaderAttribtues " + this.position.constructor + " " + (this.position instanceof VertexAttribute));
}
ShaderAttributes.prototype = {
	toString : function () {
		var str = "";
		for (var attr in this) {
			if (this[attr] instanceof VertexAttribute) {
				str += this[attr].toString() + ";";
			}
		}
		return str;
	}
};
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
	this.vertexAttributes = new ShaderAttributes();
		// this is something fancy but it's upset abotu Symbol.iterator?
		// Symbol.iterator : function*() {
			// for (var el in this) {
				// if (el instanceof VertexAttribute) {
					// yield el;
				// }
			// }
		// }
	this.program = null;
	this.fragment = null;
	this.vertex = null;
	this.uniforms = {};
	this.initShader();
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
		
		LogError("Setting from mesh: " + meshobj.toString() + "\n" + this.vertexAttributes.toString());
	},
	setUniforms : function () {
		
	},
	getAttributeLocations : function() {
		for (var attr in this.vertexAttributes) {
			if (attr instanceof VertexAttribute) {
				attr.varLocation = gl.getAttribLocation(this.program, attr.name);
			}
		}
	},
	useAttributes : function() {
		for (var va in this.vertexAttributes) {
			gl.enableVertexAttribArray(va.varLocation);
		}
	},
	useMaterial : function() {
		gl.useProgram(this.program);
		for (var attr in this.vertexAttributes) {
			if (attr instanceof VertexAttribute) {
				LogError("Enabling attribute: " + attr.toString());
				gl.enableVertexAttribArray(attr.varLocation);
				gl.bindBuffer(gl.ARRAY_BUFFER, attr.varBuffer);
				// because i always forget what order the parameters go:
				// vertexAttribPointer(GLint attrib location, GLint size, type, normalized?, stride, offset)
				gl.vertexAttribPointer(attr.varLocation, attr.varNumber, attr.varType, false, 0, 0);
			}
		}
	},
	toString : function(full = false) {
		if (full) {
			return JSON.stringify(this);
		}
		return this.name + ": vertex-->" + this.vertexName + "; fragment-->" + this.fragmentName + "; ";
	},
};

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
	setUniforms : function() {
		// TODO need some sort of handling for multiple shader passes
		this.shaders[0].setUniforms();
	},
	setAttributes : function(mesh) {
		this.shaders[0].setMeshAttributes(mesh);
	},
	useMaterial : function() {
		this.shaders[0].useMaterial();
	},
	draw : function() {
		// TODO need some sort of handling for multiple shader passes
	},
	toString : function(full = false) {
		var str = "";
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			str += this.shaders[idx].toString(full);
		}
		return str;
	},
};