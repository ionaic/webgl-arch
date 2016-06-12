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

function Texture(inName, inSrcImg, inSrcName) {
	this.name = inName || "";
	this.texture = gl.createTexture();
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
			if (this.varNumber == null) {
				this.varNumber = varValue.dimensions().rows || varValue.varValue.elements.length || varValue.length || 1;
			}
			switch(this.varNumber) {
				case 2:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniformMatrix2f(vthis.varLocation, false, this.varValue.flatten() || this.varValue);
					}
					// integer type
					else {
						gl.uniformMatrix2iv(this.varLocation, false, this.varValue.flatten() || this.varValue);
					}
					break;
				case 3:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniformMatrix3fv(this.varLocation, false, this.varValue.flatten() || this.varValue);
					}
					// integer type
					else {
						gl.uniformMatrix3iv(this.varLocation, false, this.varValue.flatten() || this.varValue);
					}
					break;
				case 4:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniformMatrix4fv(this.varLocation, false, this.varValue.flatten() || this.varValue);
					}
					// integer type
					else {
						gl.uniformMatrix4iv(this.varLocation, false, this.varValue.flatten() || this.varValue);
					}
					break;
				default:
					// unknown case, break
					break;
			}
		}
		else {
			if (this.varNumber == null) {
				this.varNumber = varValue.elements.length || varValue.length || 1;
			}
			switch(this.varNumber) {
				case 1:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniform1f(this.varLocation, this.varValue);
					}
					// integer type
					else {
						gl.uniform1i(this.varLocation, this.varValue);
					}
					break;
				case 2:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniform2fv(this.varLocation, this.varValue);
					}
					// integer type
					else {
						gl.uniform2iv(this.varLocation, this.varValue);
					}
					break;
				case 3:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniform3fv(this.varLocation, this.varValue);
					}
					// integer type
					else {
						gl.uniform3iv(this.varLocation, this.varValue);
					}
					break;
				case 4:
					// floating type
					if (this.varType == gl.FLOAT) {
						gl.uniform4fv(this.varLocation, this.varValue);
					}
					// integer type
					else {
						gl.uniform4iv(this.varLocation, this.varValue);
					}
					break;
				default:
					// unknown case, break
					break;
			}
		}
	},
	toString : function() {
		return "{" + this.name + ": (Loc: " + this.varLocation + "), (Value:" + this.varValue + "), (Type: " + this.varType + "), (Number: " + this.varNumber + "), (IsMatrix: " + this.isMatrix + ")}";
	}
}
function ShaderUniforms() {
	this.modelMatrix = new ShaderUniform("modelMatrix", null, Matrix.I(4), gl.FLOAT, 4, true);
	this.viewMatrix = new ShaderUniform("viewMatrix", null, Matrix.I(4), gl.FLOAT, 4, true);
	this.projectionMatrix = new ShaderUniform("projectionMatrix", null, Matrix.I(4), gl.FLOAT, 4, true);
}
ShaderUniforms.prototype = {
	setModelMatrix : function(inMat) {
		this.modelMatrix.varValue = inMat;
	},
	setViewMatrix : function(inMat) {
		this.viewMatrix.varValue = inMat;
	},
	setProjectionMatrix : function(inMat) {
		this.projectionMatrix.varValue = inMat;
	},
	toString : function() {
		var str = "";
		for (var uniform in this) {
			if (this[uniform] instanceof ShaderUniform) {
				str += this[uniform].toString() + ";\n";
			}
		}
		return str;
	},
};

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
	setModelViewProjection : function(model, view, projection) {
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			this.shaders[idx].shaderUniforms.setModelMatrix(model);
			this.shaders[idx].shaderUniforms.setViewMatrix(view);
			this.shaders[idx].shaderUniforms.setProjectionMatrix(projection);
		}
	},
	setModelMatrix : function(model) {
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			this.shaders[idx].shaderUniforms.setModelMatrix(model);
		}
	},
	setViewMatrix : function(model) {
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			this.shaders[idx].shaderUniforms.setViewMatrix(view);
		}
	},
	setProjectionMatrix : function(projection) {
		for (var idx = 0; idx < this.shaders.length; ++idx) {
			LogError("Set Projection: " + this.shaders[idx]);
			LogError("Setting projection matrix for: " + this.shaders[idx].shaderUniforms);
			this.shaders[idx].shaderUniforms.setProjectionMatrix(projection);
		}
	},
	setUniforms : function(shaderIdx = 0) {
		this.shaders[shaderIdx].setUniforms();
	},
	setAttributes : function(mesh, shaderIdx = 0) {
		this.shaders[0].setMeshAttributes(mesh);
	},
	useMaterial : function(shaderIdx = 0) {
		this.shaders[0].useShader();
	},
	draw : function(mesh) {
		// TODO need some sort of registry so you can batch call draw, 1 call to material.draw for all meshes using material
		//for (var idx = 0; idx < arguments.length; ++idx) {
		//	arguments[idx]._bindBuffers();
		//}
		for (var pass = 0; pass < this.shaders.length; ++pass) {
			// setup for this shader pass
			this.setUniforms(pass);
			this.setAttributes(pass, mesh);
			this.useMaterial(pass);
			
			// draw mesh with this shader configuration
			mesh._drawMesh();
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
				str += this[attr].toString() + ";\n";
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

function Shader(inName, inVertName, inFragName, inVertSrc, inFragSrc) {
	this.name = inName || ""; // shader program name
	this.vertexName = inVertName || ""; // vertex shader name
	this.fragmentName = inFragName || ""; // fragment shader name
	this.vertexSource = inVertSrc || "";
	this.fragmentSource = inFragSrc || "";
	this.vertexAttributes = new ShaderAttributes(); // vertex attributes
	this.shaderUniforms = new ShaderUniforms(); // shader uniforms
	this.program = gl.createProgram() || null;
	this.fragment = gl.createShader(gl.FRAGMENT_SHADER) || null;
	this.vertex = gl.createShader(gl.VERTEX_SHADER) || null;
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
		if (this.program == null) {
			this.program = gl.createProgram();
		}
		if (this.fragment == null) {
			this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
		}
		if (this.vertex == null) {
			this.vertex = gl.createShader(gl.VERTEX_SHADER);
		}
		
		if (this.fragmentName != null) {
			this.fragmentSource = getSourceFromDOM(this.fragmentName);
		}
		if (this.fragmentSource != null) {
			LogError("Fragment Source: " + this.fragmentSource);
			gl.shaderSource(this.fragment, getSourceFromDOM(this.fragmentName));
			shaderCompileCheckErr(this.fragmentName, this.fragment);
			
			gl.attachShader(this.program, this.fragment);
			LogError("Attaching fragment shader.");
		}
		if (this.vertexName != null) {
			this.vertexSource = getSourceFromDOM(this.vertexName);
		}
		if (this.vertexSource != null) {
			LogError("Vertex Source: " + this.vertexSource);
			gl.shaderSource(this.vertex, this.vertexSource);
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
	getUniformLocations : function() {
		for (var uniform in this.shaderUniforms) {
			if (this.shaderUniforms[uniform] instanceof ShaderUniform) {
				this.shaderUniforms[uniform].varLocation = gl.getUniformLocation(this.program, this.shaderUniforms[uniform].name);
				LogError("Getting Uniform: " + this.shaderUniforms[uniform].toString());
			}
			else {
				LogError("Uniform: " + uniform.toString() + " not instance of ShaderUniform");
			}
		}
	},
	setUniforms : function () {
		for (var uniform in this.shaderUniforms) {
			if (this.shaderUniforms[uniform] instanceof ShaderUniform) {
				this.shaderUniforms[uniform].setUniform();
			}
			else {
				LogError("Uniform: " + uniform.toString() + " not instance of ShaderUniform");
			}
		}
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


Material.initDefaultMaterial = function() {
	Material.DefaultVert = "attribute vec3 position;\n" +
		"attribute vec3 normal;\n" +
		"attribute vec2 uv;\n" +
		"\n" +
		"varying vec4 oPosition;\n" +
		"varying vec3 oNormal;\n" +
		"varying vec2 oUv;\n" +
		"\n" +
		"// model matrix (positioning in space of your vertex)\n" +
		"uniform mat4 modelMatrix;\n" +
		"// camera positioning\n" +
		"uniform mat4 viewMatrix;\n" +
		"// perspective matrix (perspective projection camera)\n" +
		"uniform mat4 projectionMatrix;\n" +
		"\n" +
		"void main(void) {\n" +
		"	// pass normal, uv, and position through\n" +
		"	oPosition = vec4(position, 1.0);\n" +
		"	oNormal = normal;\n" +
		"	oUv = uv;\n" +
		"	// modify vertex pos by MVP (because col major PVM) matrix\n" +
		"	gl_Position = projectionMatrix * viewMatrix * modelMatrix * oPosition;\n" +
		"}\n";
	Material.DefaultFrag = "precision mediump float;\n" +
		"varying vec4 oPosition;\n" +
		"varying vec3 oNormal;\n" +
		"varying vec2 oUv;\n" +
		"\n" +
		"void main(void) {\n" +
		"	gl_FragColor = outlineColor;\n" +
		"}\n";
	Material.DefaultShader = new Shader("Default", null, null, Material.DefaultVert, Material.DefaultFrag);
	Material.DefaultMaterial = new Material(Material.DefaultShader);
}