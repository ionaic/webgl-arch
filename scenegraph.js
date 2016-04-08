var SceneObject = {
	parent : null,
	children : [],
	components : {
		mesh : new Mesh(),
		transform : new Transform(),
		material : new Material()
	}
};

var Vertex = {
	position : $V([0, 0, 0, 1]),
	normal : $V([0, 0, 0]),
	uv : $V([0, 0])
};

var Face = {
	indices : $V([0, 0, 0]),
	normal : $V([0, 0, 0])
}

var Mesh = {
	// internal arrays, less org than external facing arrays
	_vertices : new Float32Array(),
	_indices : new Uint32Array(),
	_normals : new Float32Array(),
	_uv : new Float32Array(),
	// user friendly vertex/index arrays
	vertices : [],
	indices : [],
	// gl buffers
	vertexBuffer : null,
	indexBuffer : null,
	_packArrays : function() {
		for (var vidx = 0; vidx < this.vertices.length; ++vidx) {
			this._vertices += v.position.elements;
			this._normals += v.normal.elements;
			this._uv += v.uv.elements;
		}
		for (var i in this.indices) {
			this._indices += i.indices.elements;
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
	}
	updateBuffers : function() {
		// TODO properly updating buffer data in opengl, how do
		gl.bindBuffer(gl.ARRAY_BUFFER, this.)
	},
	_setBufferData : function() {
		// set the buffer data, replacing the old memory with new
		// first pack the index/vertex arrays into the typed arrays
		this._packArrays();
		
		// bind our mesh buffers
		this._bindBuffers();
		
		// we MUST have vertices, optional indices
		gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);

		if (this._indices || this.indices) {	
			
			gl.bufferData(gl.INDEX_BUFFER, this._indices, gl.STATIC_DRAW);
		}
	}
};

// utilities for making random geometry
function createSingleTriangleMesh(a, b, c, twosided=true) {
	// TODO add texture coordinates, bounding square
	var omesh = new Mesh();
	
	var va = new Vertex(), vb = new Vertex(), vc = new Vertex();
	
	va.position = a;
	vb.position = b;
	vc.position = c;
	
	var faceNorm = b.sub(a).cross(c.sub(a)).normalize();
	va.normal = vb.normal = vc.normal = faceNorm;
	
	omesh.vertices.push(va);
	omesh.vertices.push(vb);
	omesh.vertices.push(vc);
	
	if (twosided) {
		// need a second set of verts for a double sided tri with normals pointing the opposite way
		var vd = new Vertex(), ve = new Vertex(), vf = new Vertex();
		vd.normal = ve.normal = vf.normal = faceNorm.multiply(-1);
		
		omesh.vertices.push(vd);
		omesh.vertices.push(ve);
		omesh.vertices.push(vf);
	}
}

function createSingleQuadMesh(a, b, c, d, twosided=true, ccw=true) {
	
}

function createSquareMesh(dim, normal, twosided=true, ccw=true) {
	var omesh = new Mesh();
	
	var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
}

function createRectangleMesh(l, w, normal, twosided=true, ccw=true) {
	
}

function createCircleMesh(center, radius, normal, twosided=true, ccw=true) {
	
}

function createCubeMesh(dim, twosided=true, ccw=true) {
	
}

function createBoxMesh(l, w, h, twosided=true, ccw=true) {
	
}
}

function createSphereMesh(dim) {
	
}