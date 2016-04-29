function Vertex() {}
function Face() {}
function Mesh() {}

Vertex.prototype = {
	position : $V([0, 0, 0, 1]),
	normal : $V([0, 0, 0]),
	uv : $V([0, 0])
};

Face.prototype = {
	indices : $V([0, 0, 0]),
	normal : $V([0, 0, 0])
}

Mesh.prototype = {
	// internal arrays, less org than external facing arrays
	_vertices : new Float32Array(),
	_indices : new Uint32Array(),
	_normals : new Float32Array(),
	_uv : new Float32Array(),
	// user friendly vertex/index arrays
	vertices : [],
	faces : [],
	// gl buffers
	vertexBuffer : null,
	normalBuffer : null,
	uvBuffer : null,
	indexBuffer : null,
	_packArrays : function() {
		var tmpVerts = [];
		var tmpNormals = [];
		var tmpUV = [];
		var tmpIndices = [];
		for (var vidx = 0; vidx < this.vertices.length; ++vidx) {
			var v = this.vertices[vidx];
			tmpVerts.concat(v.position.elements);
			tmpNormals.concat(v.normal.elements);
			tmpUV.concat(v.uv.elements);
		}
		for (var idx = 0; idx < this.faces.length; ++idx) {
			tmpIndices.concat(this.faces[idx].indices.elements);
		}
		LogError(tmpVerts.toString());
		LogError(tmpNormals.toString());
		LogError(tmpUV.toString());
		LogError(tmpIndices.toString());
		this._vertices = Float32Array.from(tmpVerts);
		this._normals = Float32Array.from(tmpNormals);
		this._uv = Float32Array.from(tmpUV);
		this._indices = Uint32Array.from(tmpIndices);
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
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
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
			gl.bufferData(gl.INDEX_BUFFER, this._indices, gl.STATIC_DRAW);
		}
	},
	_drawMesh : function(material) {
		// material is the material to draw the mesh with
		// TODO ideally you want to batch the draw calls based on the material (shader) being used
		LogError("Drawing Mesh");
		if (this.vertexBuffer == null || this.indexBuffer == null || this.normalBuffer == null || this.uvBuffer == null) {
			return;
		}
		this._packArrays();
		this._setBufferData();
		this._bindBuffers();
		if (material) {
			material.setUniforms();
			material.setAttributes();
			material.useMaterial();
		}
		gl.drawArrays(gl.TRIANGLES, this.vertices.length, gl.UNSIGNED_SHORT, 0);
	}
};

// utilities for making random geometry
function createSingleTriangleMesh(a, b, c, twosided=true) {
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
	f1.indices.setElements([0, 1, 2]);
	f1.normal = faceNorm; 
	omesh.faces.push(f1);
	
	if (twosided) {
		// need a second set of verts for a double sided tri with normals pointing the opposite way
		var vd = new Vertex(), ve = new Vertex(), vf = new Vertex();
		vd.normal = ve.normal = vf.normal = faceNorm.multiply(-1);
		vd.position = $V(a);
		vf.position = $V(c);
		ve.position = $V(b);
		
		omesh.vertices.push(vd);
		omesh.vertices.push(ve);
		omesh.vertices.push(vf);
		
		var f2 = new Face();
		f2.indices.setElements([3, 4, 5]);
		f2.normal = faceNorm.multiply(-1);
		omesh.faces.push(f2);
	}
	
	omesh._packArrays();
	omesh.initBuffers;
	
	return omesh;
}

function createSingleQuadMesh(a, b, c, d, twosided=true) {
	var omesh1 = createSingleTriangleMesh(a, b, c, twosided);
	var omesh2 = createSingleTriangleMesh(c, d, a, twosided);
	
	var omesh = new Mesh();
	omesh.vertices = omesh1.vertices.concat(omesh2.vertices);
	omesh.faces = omesh1.faces.concat(omesh2.faces);
	
	omesh._packArrays();
	
	return omesh;
}

function createSquareMesh(dim, normal, twosided=true) {
	// TODO transform so that the normal points in the correct direction
	var omesh = createSingleQuadMesh([dim, dim, 0.0], // 
									 [-1.0 * dim, dim, 0.0], // 
									 [dim, -1.0 * dim, 0.0], //
									 [-1.0 * dim, -1.0 * dim, 0.0], twosided);
	return omesh;
}

function createRectangleMesh(l, w, normal, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
}

function createCircleMesh(center, radius, normal, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
}

function createCubeMesh(dim, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
}

function createBoxMesh(l, w, h, twosided=true, ccw=true) {
	var omesh;
	
	return omesh;
}

function createSphereMesh(dim) {
	var omesh;
	
	return omesh;
}