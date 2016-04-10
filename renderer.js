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
	indexBuffer : null,
	_packArrays : function() {
		alert(this.vertices.length);
		for (var vidx = 0; vidx < this.vertices.length; ++vidx) {
			var v = this.vertices[vidx];
			this._vertices += v.position.elements;
			this._normals += v.normal.elements;
			this._uv += v.uv.elements;
		}
		for (var idx = 0; idx < this.faces.length; ++idx) {
			this._indices += this.faces[idx].indices.elements;
		}
	},
	initBuffers : function() {
		
		if (!this.vertexBuffer) {
			this.vertexBuffer = gl.createBuffer();		
		}
		if (!this.indexBuffer) {
			this.indexBuffer = gl.createBuffer();		
		}
		
		if (!(this.vertices || this._vertices)) {
			return;
		}
		this._setBufferData();
	},
	_bindBuffers : function() {
		// bind buffers to this mesh's index/vertex buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bindBuffer(gl.INDEX_BUFFER, this.indexBuffer);
	},
	updateBuffers : function() {
		// TODO properly updating buffer data in opengl, how do
		this._bindBuffers();
	},
	_setBufferData : function() {
		// set the buffer data, replacing the old memory with new
		// first pack the index/vertex arrays into the typed arrays
		this._packArrays();
		
		// bind our mesh buffers
		this._bindBuffers();
		
		// we MUST have vertices, optional indices
		gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);

		if (this._indices || this.faces) {	
			
			gl.bufferData(gl.INDEX_BUFFER, this._indices, gl.STATIC_DRAW);
		}
	},
	_drawMesh : function() {
		this._packArrays();
		this._setBufferData();
		this._bindBuffers();
		this._setUniforms();
		this._setAttributes();
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
	f1.indices.elements = [0, 1, 2];
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
		f2.indices.elements = [3, 4, 5];
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
	omesh.vertices = omesh1.vertices + omesh2.vertices;
	omesh.faces = omesh1.vertices + omesh2.vertices;
	
	omesh._packArrays();
	
	return omesh;
}

function createSquareMesh(dim, normal, twosided=true) {
	// TODO transform so that the normal points in the correct direction
	var omesh = createSingleQuadMesh([dim, dim, 0.0], // 
									 [-1.0 * dim, dim, 0.0], // 
									 [dim, -1.0 * dim, 0.0], //
									 [-1.0 * dim, -1.0 * dim, 0.0], twosided);
}

function createRectangleMesh(l, w, normal, twosided=true, ccw=true) {
	
}

function createCircleMesh(center, radius, normal, twosided=true, ccw=true) {
	
}

function createCubeMesh(dim, twosided=true, ccw=true) {
	
}

function createBoxMesh(l, w, h, twosided=true, ccw=true) {
	
}

function createSphereMesh(dim) {
	
}