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

function Texture(inName) {
	this.name = inName || "";
	
}
Texture.prototype = {
	LoadFromDOM : function(domID) {
		
	},
	LoadFromPath : function(path) {
		
	}
}

function ShaderUniform(inName, inLoc, inVal, inType, inNum, inMat) {
	this.name = inName || "";
	this.varLocation = inLoc || null;
	this.varValue = inVal || null;
	this.varType = inType || gl.FLOAT; // default to float
	this.varNumber = inNum || 3; // default to 3 vec
	this.isMatrix = inMat || false; // boolean to determine if this is a matrix or not
}
ShaderUniform.prototype = {
	setUniform : function() {
		if (this.varValue instanceof Matrix) {
			this.isMatrix = true;
		}
		if (this.isMatrix) {
			
		}
		else {
			if (this.varNumber == 1)
		}
	}
}

function Material(inShaders, inTextures) {
	this.shaders = inShaders || [];
	this.textures = inTextures || [];
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
	setUniforms : function() {
		// TODO need some sort of handling for multiple shader passes
		this.shaders[0].setUniforms();
	},
	setAttributes : function(mesh) {
		this.shaders[0].setMeshAttributes(mesh);
	},
	useMaterial : function() {
		this.shaders[0].useShader();
	},
	draw : function() {
		// TODO need some sort of registry so you cna batch call draw, 1 call to material.draw for all meshes using material
		this.setUniforms();
		this.setAttributes();
		this.useMaterial();

		for (var idx = 0; idx < arguments.length; ++idx) {
			arguments[idx]._bindBuffers();
		}
	},
	toString : function(full = false) {
		var str = "";
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			str += this.shaders[idx].toString(full);
		}
		return str;
	},
};

function ShaderAttributes() {
	this.position = new VertexAttribute("position");
	this.normal = new VertexAttribute("normal");
	this.uv = new VertexAttribute("uv");
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
	},
	// this is something fancy but it's upset abotu Symbol.iterator?
	// Symbol.iterator : function*() {
		// for (var el in this) {
			// if (this[el] instanceof VertexAttribute) {
				// yield this[el];
			// }
		// }
	// },
};

function Shader(inName, inVertName, inFragName) {
	this.name = inName || ""; // shader program name
	this.vertexName = inVertName || ""; // vertex shader name
	this.fragmentName = inFragName || ""; // fragment shader name
	this.vertexAttributes = new ShaderAttributes(); // vertex attributes
	this.program = gl.createProgram();
	this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
	this.vertex = gl.createShader(gl.VERTEX_SHADER);
	this.uniforms = {};
	
	// hook functions to allow user to call GL calls before and after each shader
	this.preRenderHook = function() {};
	this.postRenderHook = function() {};
	
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
		if (this.fragmentName != null) {
			gl.shaderSource(this.fragment, getSourceFromDOM(this.fragmentName));
			shaderCompileCheckErr(this.fragmentName, this.fragment);
			
			gl.attachShader(this.program, this.fragment);
			LogError("Attaching fragment shader.");
		}
		if (this.vertexName != null) {
			gl.shaderSource(this.vertex, getSourceFromDOM(this.vertexName));
			shaderCompileCheckErr(this.vertexName, this.vertex);
			
			gl.attachShader(this.program, this.vertex);
			LogError("Attaching vertex shader.");
		}
		
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			LogError("Link for shader program " + this.name + " failed.\n" + gl.getProgramInfoLog(this.program));
		}
		else {
			LogError("Linking shader program " + this.name + ".\n" + gl.getProgramInfoLog(this.program));
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
		this.vertexAttributes.position.varNumber = 3;
		
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
			if (this.vertexAttributes[attr] instanceof VertexAttribute) {
				this.vertexAttributes[attr].varLocation = gl.getAttribLocation(this.program, this.vertexAttributes[attr].name);
				LogError("Getting Attribute: " + this.vertexAttributes[attr].toString());
			}
			else {
				LogError("Attr: " + attr.toString() + " not instance of VertexAttribute");
			}
		}
	},
	useAttributes : function() {
		for (var attr in this.vertexAttributes) {
			if (this.vertexAttributes[attr] instanceof VertexAttribute) {
				gl.enableVertexAttribArray(this.vertexAttributes[attr].varLocation);
				LogError("Using Attribute: " + this.vertexAttribtues[attr].toString());
			}
		}
	},
	useShader : function() {
		gl.useProgram(this.program);
		for (var attr in this.vertexAttributes) {
			if (this.vertexAttributes[attr] instanceof VertexAttribute) {
				LogError("Enabling attribute: " + this.vertexAttributes[attr].toString());
				gl.enableVertexAttribArray(this.vertexAttributes[attr].varLocation);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexAttributes[attr].varBuffer);
				// because i always forget what order the parameters go:
				// vertexAttribPointer(GLint attrib location, GLint size, type, normalized?, stride, offset)
				gl.vertexAttribPointer(this.vertexAttributes[attr].varLocation, this.vertexAttributes[attr].varNumber, this.vertexAttributes[attr].varType, false, 0, 0);
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
