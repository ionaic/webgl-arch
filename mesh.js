'use strict';

function Vertex(inPosition, inNormal, inUv, inColor) {
	this.position = inPosition || $V([0, 0, 0, 1]);
	this.normal = inNormal || $V([0, 0, 0]);
	this.uv = inUv || $V([0, 0]);
	// null if no color given
	this.color = inColor;
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
	this.colorBuffer = null;
	// draw indexed or no
	this.drawIndexed = true;
	// draw lines mode for debugging
	this.drawWireframe = false;
	this.drawMode = null;
	this.isVertexColored = false;
}

Mesh.prototype = {
	addVertex : function(pos, norm, uv, color) {
		if (color != null) {
			this.isVertexColored = true;
		}
		this.vertices.push(new Vertex(pos, norm, uv, color));
		return this.vertices.length - 1;
	},
	addFace : function(v1, v2, v3, inNorm) {
		var calcNorm = (this.vertices[v1].normal + this.vertices[v2].normal + this.vertices[v3].normal) / 3;
		this.faces.push(new Face($V([v1,v2,v3]), inNorm || calcNorm));
	},
	addLine : function(v1, v2) {
		this.faces.push(new Face($V([v1,v2]), $V([0,0,0])));
	},
	checkVertexColoring : function() {
		// if it is set as vertex colored, don't change it
		if (this.isVertexColored) {
			return;
		}
		// set to false to ensure it's a boolean not another falsey value
		this.isVertexColored = false;
		for (var vidx = 0; vidx < this.vertices.length; ++vidx) {
			if (this.vertices[vidx].color != null) {
				this.isVertexColored = true;
			}
		}
	},
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
		if (this.isVertexColored) {
			var tmpColors = [];
			for (var vidx = 0; vidx < this.vertices.length; ++vidx) {
				var v = this.vertices[vidx];
				tmpColors.concat(v.color.elements || Color.lightGray.elements);
			}
			this._colors = Float32Array.from(tmpColors);
		}
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
		if (this.isVertexColored && this.colorBuffer == null) {
			this.colorBuffer = gl.createBuffer();
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
		
		if (this.isVertexColored && this._colors != null) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this._colors, gl.STATIC_DRAW);
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
		
		var mode = this.drawMode || this.drawWireframe ? gl.LINE_LOOP : gl.TRIANGLES;
		
		if (this.drawIndexed) {
			// drawElements(mode, number, type, offset)
			gl.drawElements(mode, this._indices.length, gl.UNSIGNED_SHORT, 0);
		}
		else {
			// drawArrays(mode, first, count)
			LogError("Drawing len: " + this._vertices.length);
			gl.drawArrays(mode, 0, this._vertices.length / 3);
		}
	},
	toString : function(full) {
		full = full || false;
		if (full) {
			return JSON.stringify(this);
		}
		return "Vertices: [" + this._vertices.toString() + "];\nIndices: [" + this._indices.toString() + "];\nNormals: [" + this._normals + "];\nUV: [" + this._uv + "];\n";
	},
};

// utilities for making random geometry
Mesh.createSingleTriangleMesh = function(a, b, c, twosided) {
	// TODO add texture coordinates, bounding square
	var omesh = new Mesh();
	
	var va = $V(a), vb = $V(b), vc = $V(c);
	var fidx = [];
	
	// calculate triangle norm
	var faceNorm = vb.subtract(va).cross(vc.subtract(va)).normalize();
	
	// calculate texture coordinates by finding the minimum square that contains it
	// vectors of triangles
	// TODO this doesn't give the right proportions and will stretch the texture
	var AB = vb.subtract(va), AC = vc.subtract(va);
	var mAB = AB.magnitude(), mAC = AC.magnitude();
	// project onto xy plane by removing z element
	AB.elements.pop();
	AC.elements.pop();
	// scale back to the desired magnitudes so relative lengths preserved
	// angle not necessarily preserved
	AB = AB.normalize().multiply(mAB);
	AC = AC.normalize().multiply(mAC);
	// scale back to [0,1]
	var scale = 1.0 / Math.max(mAB, mAC);
	AB = AB.multiply(scale);
	AC = AC.multiply(scale);
	var uva = $V([0,0]), uvb = AB, uvc = AC;
	var min = [Math.min(AB.idx(0), AC.idx(0)), Math.min(AB.idx(1),AC.idx(1))]
	if (min[0] < 0) {
		// shift everything +1 then scale back to [0,1]
		uva.elements[0] += 1;
		uvb.elements[0] += 1;
		uvc.elements[0] += 1;
		
		// var max = Math.max(uva.elements[0], uvb.elements[0], uvc.elements[0]);
		uva.elements[0] /= 2;
		uvb.elements[0] /= 2;
		uvc.elements[0] /= 2;
	}
	if (min[1] < 0) {
		// shift everything +1 then scale back to [0,1]
		uva.elements[1] += 1;
		uvb.elements[1] += 1;
		uvc.elements[1] += 1;
		
		// var max = Math.max(uva.elements[1], uvb.elements[1], uvc.elements[1]);
		uva.elements[1] /= 2;
		uvb.elements[1] /= 2;
		uvc.elements[1] /= 2;
	}
	
	fidx[0] = omesh.addVertex(va, faceNorm, uva);
	fidx[1] = omesh.addVertex(vb, faceNorm, uvb);
	fidx[2] = omesh.addVertex(vc, faceNorm, uvc);
	
	omesh.addFace(fidx[2], fidx[1], fidx[0], faceNorm);
	
	if (twosided) {
		// need a second set of verts for a double sided tri with normals pointing the opposite way
		var vd = $V(a), ve = $V(b), vf = $V(c);
		var faceNorm2 = faceNorm.multiply(-1);
		
		fidx[0] = omesh.addVertex(vd, faceNorm2, uva);
		fidx[1] = omesh.addVertex(ve, faceNorm2, uvb);
		fidx[2] = omesh.addVertex(vf, faceNorm2, uvc);
		
		omesh.addFace(fidx[0], fidx[1], fidx[2], faceNorm2);
	}
	
	omesh._packArrays();
	omesh.initBuffers();
	
	LogError("Generated Tri: " + omesh.toString());
	
	return omesh;
};

Mesh.createSingleQuadMesh = function (a, b, c, d, twosided) {
	var omesh = Mesh.createSingleTriangleMesh(a, b, c, twosided);
	var idx = omesh.addVertex($V(d), omesh.vertices[0].normal);
	omesh.addFace(idx, 2, 0);
	
	if (twosided) {
		var idx2 = omesh.addVertex($V(d), omesh.vertices[3].normal);
		omesh.addFace(3, 5, idx2);
	}
	
	omesh._packArrays();
	// LogError("Created quad: " + omesh.toString());
	
	return omesh;
}

Mesh.createSquareMesh = function (dim, normal, twosided) {
	// TODO transform so that the normal points in the correct direction
	var omesh = Mesh.createSingleQuadMesh(
									[dim, dim, 0.0], // 
									 [-1.0 * dim, dim, 0.0], // 
									 [-1.0 * dim, -1.0 * dim, 0.0], //
									 [dim, -1.0 * dim, 0.0], //
									 twosided);
	return omesh;
};

Mesh.createRectangleMesh = function (l, w, normal, twosided, ccw) {
	var omesh;
	
	return omesh;
};

Mesh.createCircleMesh = function (center, radius, normal, twosided, ccw) {
	var omesh;
	
	return omesh;
}

Mesh.createCubeMesh = function(dim, twosided, ccw) {
	var omesh = new Mesh();
	
	// values copied from MDN cube example
	
	// Front face
	var face = [];
	face[0] = omesh.addVertex($V([-1.0, -1.0,  1.0]), $V([0,0,1]), $V([0.0,  0.0]));
	face[1] = omesh.addVertex($V([ 1.0, -1.0,  1.0]), $V([0,0,1]), $V([1.0,  0.0]));
	face[2] = omesh.addVertex($V([ 1.0,  1.0,  1.0]), $V([0,0,1]), $V([1.0,  1.0]));
	face[3] = omesh.addVertex($V([-1.0,  1.0,  1.0]), $V([0,0,1]), $V([0.0,  1.0]));
	omesh.addFace(face[2], face[1], face[0], face[0].normal);
	omesh.addFace(face[3], face[2], face[0], face[0].normal);

	// Back face
	face[0] = omesh.addVertex($V([-1.0, -1.0, -1.0]), $V([0,0,-1]), $V([0.0,  0.0]));
	face[1] = omesh.addVertex($V([-1.0,  1.0, -1.0]), $V([0,0,-1]), $V([1.0,  0.0]));
	face[2] = omesh.addVertex($V([ 1.0,  1.0, -1.0]), $V([0,0,-1]), $V([1.0,  1.0]));
	face[3] = omesh.addVertex($V([ 1.0, -1.0, -1.0]), $V([0,0,-1]), $V([0.0,  1.0]));
	omesh.addFace(face[2], face[1], face[0], face[0].normal);
	omesh.addFace(face[3], face[2], face[0], face[0].normal);

	// Top face
	face[0] = omesh.addVertex($V([-1.0,  1.0, -1.0]), $V([0,1,0]), $V([0.0,  0.0]));
	face[1] = omesh.addVertex($V([-1.0,  1.0,  1.0]), $V([0,1,0]), $V([1.0,  0.0]));
	face[2] = omesh.addVertex($V([ 1.0,  1.0,  1.0]), $V([0,1,0]), $V([1.0,  1.0]));
	face[3] = omesh.addVertex($V([ 1.0,  1.0, -1.0]), $V([0,1,0]), $V([0.0,  1.0]));
	omesh.addFace(face[2], face[1], face[0], face[0].normal);
	omesh.addFace(face[3], face[2], face[0], face[0].normal);

	// Bottom face
	face[0] = omesh.addVertex($V([-1.0, -1.0, -1.0]), $V([0,-1,0]), $V([0.0,  0.0]));
	face[1] = omesh.addVertex($V([ 1.0, -1.0, -1.0]), $V([0,-1,0]), $V([1.0,  0.0]));
	face[2] = omesh.addVertex($V([ 1.0, -1.0,  1.0]), $V([0,-1,0]), $V([1.0,  1.0]));
	face[3] = omesh.addVertex($V([-1.0, -1.0,  1.0]), $V([0,-1,0]), $V([0.0,  1.0]));
	omesh.addFace(face[2], face[1], face[0], face[0].normal);
	omesh.addFace(face[3], face[2], face[0], face[0].normal);

	// Right face
	face[0] = omesh.addVertex($V([1.0, -1.0, -1.0]), $V([1,0,0]), $V([0.0,  0.0]));
	face[1] = omesh.addVertex($V([1.0,  1.0, -1.0]), $V([1,0,0]), $V([1.0,  0.0]));
	face[2] = omesh.addVertex($V([1.0,  1.0,  1.0]), $V([1,0,0]), $V([1.0,  1.0]));
	face[3] = omesh.addVertex($V([1.0, -1.0,  1.0]), $V([1,0,0]), $V([0.0,  1.0]));
	omesh.addFace(face[2], face[1], face[0], face[0].normal);
	omesh.addFace(face[3], face[2], face[0], face[0].normal);

	// Left face
	face[0] = omesh.addVertex($V([-1.0, -1.0, -1.0]), $V([-1,0,0]), $V([0.0,  0.0]));
	face[1] = omesh.addVertex($V([-1.0, -1.0,  1.0]), $V([-1,0,0]), $V([1.0,  0.0]));
	face[2] = omesh.addVertex($V([-1.0,  1.0,  1.0]), $V([-1,0,0]), $V([1.0,  1.0]));
	face[3] = omesh.addVertex($V([-1.0,  1.0, -1.0]), $V([-1,0,0]), $V([0.0,  1.0]));
	omesh.addFace(face[2], face[1], face[0], face[0].normal);
	omesh.addFace(face[3], face[2], face[0], face[0].normal);

	omesh._packArrays();
	omesh.initBuffers();
	
	LogError("Cube: " + omesh);
	return omesh;
};

Mesh.createBoxMesh = function(l, w, h, twosided, ccw) {
	var omesh;
	
	return omesh;
};

Mesh.createSphereMesh = function(dim) {
	var omesh;
	
	return omesh;
};