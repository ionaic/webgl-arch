function Vertex(inPosition, inNormal, inUv) {
	this.position = inPosition || $V([0, 0, 0, 1]);
	this.normal = inNormal || $V([0, 0, 0]);
	this.uv = inUv || $V([0, 0]);
}
function Face(inIndices, inNormal) {
	this.indices = inIndices || $V([0, 0, 0]);
	this.normal = inNormal || $V([0, 0, 0]);
}

function Mesh() {
	// internal arrays, less org than external facing arrays
	this._vertices = new Float32Array();
	this._indices = new Uint16Array();
	this._normals = new Float32Array();
	this._uv = new Float32Array();
	// user friendly vertex/index arrays
	this.vertices = [];
	this.faces = [];
	// gl buffers
	this.vertexBuffer = null;
	this.normalBuffer = null;
	this.uvBuffer = null;
	this.indexBuffer = null;
	// draw indexed or no
	this.drawIndexed = true;
	// draw lines mode for debugging
	this.drawWireframe = false;
}

Mesh.prototype = {
	_packArrays : function() {
		var tmpVerts = [];
		var tmpNormals = [];
		var tmpUV = [];
		var tmpIndices = [];
		for (var vidx = 0; vidx < this.vertices.length; ++vidx) {
			var v = this.vertices[vidx];
			tmpVerts = tmpVerts.concat(v.position.elements);
			tmpNormals = tmpNormals.concat(v.normal.elements);
			tmpUV = tmpUV.concat(v.uv.elements);
		}
		for (var idx = 0; idx < this.faces.length; ++idx) {
			tmpIndices = tmpIndices.concat(this.faces[idx].indices.elements);
		}
		this._vertices = Float32Array.from(tmpVerts);
		this._normals = Float32Array.from(tmpNormals);
		this._uv = Float32Array.from(tmpUV);
		this._indices = Uint16Array.from(tmpIndices);
	},
	initBuffers : function() {
		if (this.vertexBuffer == null) {
			this.vertexBuffer = gl.createBuffer();		
		}
		if (this.indexBuffer == null) {
			this.indexBuffer = gl.createBuffer();		
		}
		if (this.normalBuffer == null) {
			this.normalBuffer = gl.createBuffer();
		}
		if (this.uvBuffer == null) {
			this.uvBuffer = gl.createBuffer();
		}
		
		if (this.vertices == null || this._vertices == null) {
			return;
		}
		this._setBufferData();
	},
	_bindBuffers : function() {
		// bind buffers to this mesh's index/vertex buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	},
	updateBuffers : function() {
		// TODO properly updating buffer data in opengl, how do
		this._bindBuffers();
	},
	_setBufferData : function() {
		// set the buffer data, replacing the old memory with new
		// first pack the index/vertex arrays into the typed arrays
		this._packArrays();
		
		// bind our mesh buffers, only does position and index
		this._bindBuffers();
		
		// we MUST have vertices, optional indices
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);

		if (this._normals != null) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this._normals, gl.STATIC_DRAW);
		}
		if (this._uv != null) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this._uv, gl.STATIC_DRAW);
		}

		// INDEX_BUFFER should still be bound to our index buffer, though ARRAY_BUFFER is now bound to the uv or normals potentially
		if (this._indices!= null) {	
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
		}
	},
	hasMesh : function() {
		return !(this.vertexBuffer == null || this.indexBuffer == null || this.normalBuffer == null || this.uvBuffer == null);
	},
	draw : function(material) {
		// material is the material to draw the mesh with
		// TODO ideally you want to batch the draw calls based on the material (shader) being used
		if (!this.hasMesh()) {
			return;
		}
		this._packArrays();
		this._setBufferData();
		this._bindBuffers();
		if (material) {
			material.setUniforms();
			material.setAttributes(this);
			material.useMaterial();
		}
		this._drawMesh();
	},
	_drawMesh : function() {
		this._bindBuffers();
		if (this.drawIndexed) {
			// drawElements(mode, number, type, offset)
			gl.drawElements(this.drawWireframe ? gl.LINE_LOOP : gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
		}
		else {
			// drawArrays(mode, first, count)
			LogError("Drawing len: " + this._vertices.length);
			gl.drawArrays(this.drawWireframe ? gl.LINE_LOOP : gl.TRIANGLES, 0, this._vertices.length / 3);
		}
	},
	toString : function(full=false) {
		if (full) {
			return JSON.stringify(this);
		}
		return "Vertices: [" + this._vertices.toString() + "];\nIndices: [" + this._indices.toString() + "];\nNormals: [" + this._normals + "];\nUV: [" + this._uv + "];\n";
	},
};

// utilities for making random geometry
Mesh.createSingleTriangleMesh = function(a, b, c, twosided=true) {
	// TODO add texture coordinates, bounding square
	var omesh = new Mesh();
	
	var va = new Vertex(), vb = new Vertex(), vc = new Vertex();
	
	va.position = $V(a);
	vb.position = $V(b);
	vc.position = $V(c);
	
	var faceNorm = vb.position.subtract(va.position).cross(vc.position.subtract(va.position)).normalize();
	va.normal = vb.normal = vc.normal = faceNorm;
	
	omesh.vertices.push(va);
	omesh.vertices.push(vb);
	omesh.vertices.push(vc);
	
	var f1 = new Face(), f2 = new Face();
	f1.indices.setElements([2, 1, 0]);
	f1.normal = faceNorm; 
	omesh.faces.push(f1);
	
	if (twosided) {
		// need a second set of verts for a double sided tri with normals pointing the opposite way
		var vd = new Vertex(), ve = new Vertex(), vf = new Vertex();
		vd.normal = ve.normal = vf.normal = faceNorm.multiply(-1);
		vd.position = $V(a);
		ve.position = $V(b);
		vf.position = $V(c);
		
		omesh.vertices.push(vd);
		omesh.vertices.push(ve);
		omesh.vertices.push(vf);
		
		var f2 = new Face();
		f2.indices.setElements([3, 4, 5]);
		f2.normal = faceNorm.multiply(-1);
		omesh.faces.push(f2);
	}
	
	omesh._packArrays();
	omesh.initBuffers();
	
	// LogError("Generated Tri: " + omesh.toString());
	
	return omesh;
};

Mesh.createSingleQuadMesh = function (a, b, c, d, twosided=true) {
	var omesh = Mesh.createSingleTriangleMesh(a, b, c, twosided);
	var vd = new Vertex();
	vd.position = $V(d);
	vd.normal = omesh.vertices[0].normal;
	omesh.vertices.push(vd);
	
	var f1 = new Face();
	f1.indices.setElements([omesh.vertices.length - 1, 2, 0]);
	omesh.faces.push(f1);
	
	if (twosided) {
		var vd2 = new Vertex();
		vd2.position = $V(d);
		vd2.normal = omesh.vertices[4].normal;
		omesh.vertices.push(vd2);

		var f2 = new Face();
		f2.indices.setElements([3, 5, omesh.vertices.length - 1]);
		omesh.faces.push(f2);
	}
	
	omesh._packArrays();
	// LogError("Created quad: " + omesh.toString());
	
	return omesh;
}

Mesh.createSquareMesh = function (dim, normal, twosided=true) {
	// TODO transform so that the normal points in the correct direction
	var omesh = Mesh.createSingleQuadMesh(
									[dim, dim, 0.0], // 
									 [-1.0 * dim, dim, 0.0], // 
									 [-1.0 * dim, -1.0 * dim, 0.0], //
									 [dim, -1.0 * dim, 0.0], //
									 twosided);
	return omesh;
};

Mesh.createRectangleMesh = function (l, w, normal, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
};

Mesh.createCircleMesh = function (center, radius, normal, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
}

Mesh.createCubeMesh = function(dim, twosided=true, ccw=true) {
	var omesh;
	
	// // Front face
	// [-1.0, -1.0,  1.0]
	// [1.0, -1.0,  1.0]
	// [1.0,  1.0,  1.0]
	// [-1.0,  1.0,  1.0]

	// // Back face
	// [-1.0, -1.0, -1.0]
	// [-1.0,  1.0, -1.0]
	// [1.0,  1.0, -1.0]
	// [1.0, -1.0, -1.0]

	// // Top face
	// [-1.0,  1.0, -1.0]
	// [-1.0,  1.0,  1.0]
	// [1.0,  1.0,  1.0]
	// [1.0,  1.0, -1.0]

	// // Bottom face
	// [-1.0, -1.0, -1.0]
	// [1.0, -1.0, -1.0]
	// [1.0, -1.0,  1.0]
	// [-1.0, -1.0,  1.0]

	// // Right face
	// [1.0, -1.0, -1.0]
	// [1.0,  1.0, -1.0]
	// [1.0,  1.0,  1.0]
	// [1.0, -1.0,  1.0]

	// // Left face
	// [-1.0, -1.0, -1.0]
	// [-1.0, -1.0,  1.0]
	// [-1.0,  1.0,  1.0]
	// [-1.0,  1.0, -1.0]
	
	
	return omesh;
};

Mesh.createBoxMesh = function(l, w, h, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
};

Mesh.createSphereMesh = function(dim) {
	var omesh;
	
	return omesh;
};