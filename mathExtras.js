// math utility functions

var RAD2DEG = 180 / Math.PI;
var DEG2RAD = Math.PI / 180;

// Aliases for sylvester functions to more familiar names, also adding a sqrMagnitude function
Vector.prototype.sqrMagnitude = function() {
	// inner product with itself is sqrmagnitude
	return this.dot(this);
}
Vector.prototype.magnitude = Vector.prototype.modulus;
Vector.prototype.normalize = Vector.prototype.toUnitVector;
Vector.prototype.idx = function(index) {
	if (index > this.elements.length || index < 0) {
		return null;
	}
	return this.elements[index];
}
Vector.prototype.ensure4D = function() {
	if (this.elements.length > 4) {
		this.elements = this.elements.slice(0, 4);
		return this;
	}
	
	while (this.elements.length < 4) {
		this.elements.push(0);
	}
	return this;
}
Vector.prototype.ensure3D = function() {
	if (this.elements.length > 3) {
		this.elements = this.elements.slice(0, 3);
		return this;
	}
	
	while (this.elements.length < 3) {
		this.elements.push(0);
	}
	return this;
}
Vector.prototype.homogenize = function() {
	this.ensure4D();
	if (this.elements[3] != 0) {
		this.x(1 / this.elements[3]);
	}
	else {
		this.elements[3] = 1;
	}
	return this;
}
Matrix.prototype.idx = function(i, j) {
	if (i > this.rows() || j > this.cols() || i < 0 || j < 0) {
		return null;
	}
	return this.elements[i][j];
}

// Quaternion type
function Quaternion(inQv, inQs) {
	if (inQv instanceof Vector) {
		if (inQv.dimensions() > 3) {
			this.qv = $V(inQv.elements.slice(0,3));
			this.qs = inQv.elements[3];
		}
		else {
			this.qv = inQv || Vector.Zero(3);
			this.qs = inQs || 0.0;
		}
	}
	else {
		if (inQv.length > 3) {
			// grab the first 4 of the input array as qv, qs
			// allows constructing as new Quaternion([x, y, z, w])
			this.qv = $V(inQv.slice(0, 3));
			this.qs = inQv[3];
		}
		else {
			// make a vector out of the input array
			this.qv = $V(inQv || [0,0,0]);
			this.qs = inQs || 0;
		}
	}
}
Quaternion.prototype = {
	copy : function() {
		return new Quaternion(this.qv, this.qs);
	},
	normalize : function() {
		// normalize the quaternion in place and return the normalized quaternion
		var m = this.magnitude();
		this.qv = this.qv.x(1.0 / m);
		this.qs = this.qs / m;
		return this;
	},
	normalized : function() {
		// return the normalized quaternion without modifying the original
		var newQuat = this.copy();
		return newQuat.normalize();
	},
	sqrMagnitude : function() {
		return this.qv.dot(this.qv) + (this.qs * this.qs);
	},
	magnitude : function() {
		return Math.sqrt(this.sqrMagnitude());
	},
	mul : function(other) {
		// multiply 2 quaternions
		// [(psqv + qspv + pv cross qv), (psqs - pv dot qv)]
		// this is p, other is q
		var newQv = other.qv.x(this.qs).add(this.qv.x(other.qs)).add(this.qv.cross(other.qv));
		var newQs = this.qs * other.qv - this.qv.dot(other.qv);
		return new Quaternion(newQv, newQs);
	},
	multiply : this.mul,
	x : this.mul,
	scale : function(k) {
		// multiply by a scalar
		return new Quaternion(this.qv.x(k), this.qs * k);
	},
	toVector : function() {
		var tmp = $V(this.qv.elements);
		tmp.elements.push(this.qs);
		return tmp;
	},
	fromVector : function(vec) {
		// [qv qs]
		if (vec instanceof Vector) {
			this.qv = $V([vec.idx(0), vec.idx(1), vec.idx(2)]);
			this.qs = vec.idx(3);
		}
		else {
			this.qv = $V([vec[0], vec[1], vec[2]]);
			this.qs = vec[3];
		}
		return this;
	},
	q0 : function(val) {
		if (val) {
			this.qv[0] = val;
		}
		return this.qv[0];
	},
	q1 : function(val) {
		if (val) {
			this.qv[1] = val;
		}
		return this.qv[1];
	},
	q2 : function(val) {
		if (val) {
			this.qv[2] = val;
		}
		return this.qv[2];
	},
	q3 : function(val) {
		if (val) {
			this.qs = val;
		}
		return this.qs;
	},
	slerp : function(inQuat, beta) {
		// TODO
		var p = this.toVector();
		var q = this.toVector();

		return new Quaternion(SLERP(p, q, beta));
	},
	conjugate : function() {
		return new Quaternion(this.qv.x(-1), this.qs);
	},
	inverse : function() {
		var qstar = this.conjugate();
		return qstar.scale(this.sqrMagnitude());
	},
	rotate : function(v) {
		// rotate a vector v using this quaternion
		var vquat = new Quaternion(v.ensure4D());
		return this.mul(vquat).mul(this.inverse()).toVector();
	},
	toString : function() {
		return "[(" + this.qv.elements + ") " + this.qs + "]";
	}
}

function SLERP(p, q, beta) {
	var theta = Math.acos(p.dot(q));
	var wp = (Math.sin((1-beta) * theta)) / Math.sin(theta);
	var wq = Math.sin(beta * theta) / Math.sin(theta);
	
	return wp * p + wq * q;
}

Quaternion.QuaternionToEuler = function(quat) {
	var q0 = quat.q0(),
		q1 = quat.q1(),
		q2 = quat.q2(),
		q3 = quat.q3();
	return $V([
		Math.atan2((2 * (q0 * q1 + q2 * q3)), (1 - 2(q1 * q1 + q2 * q2))) * RAD2DEG,
		Math.asin(2 * (q0 * q2 - q3 * q1)) * RAD2DEG,
		Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3)) * RAD2DEG
	]);
}

Quaternion.EulerToQuaternion = function(euler) {
	var x = euler[0] / 2 * DEG2RAD;
	var y = euler[1] / 2 * DEG2RAD;
	var z = euler[2] / 2 * DEG2RAD;
	
	var q = [
		Math.cos(x) * Math.cos(y) * Math.cos(z) + Math.sin(x) * Math.sin(y) + Math.sin(z),
		Math.sin(x) * Math.cos(y) * Math.cos(z) - Math.cos(x) * Math.sin(y) + Math.sin(z),
		Math.cos(x) * Math.sin(y) * Math.cos(z) - Math.sin(x) * Math.cos(y) + Math.sin(z),
		Math.sin(x) * Math.cos(y) * Math.sin(z) - Math.sin(x) * Math.sin(y) + Math.cos(z)
	];
	return (new Quaternion(q)).normalize();
}

Quaternion.QuaternionToMatrix = function(quat) {
	var x = quat.q0();
	var y = quat.q1();
	var z = quat.q2();
	var w = quat.q3();
	
	return $M(	[[1 - 2*y*y - 2*z*z, 2*x*y + 2*z*w, 2*x*z - 2*y*w],
				[2*x*y - 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z + 2*x*w],
				[2*x*z - 2*y*w, 2*y*z - 2*x*w, 1 - 2*x*x - 2*y*y]]);
}

Quaternion.MatrixToQuaternion = function(mat) {
	// adapted from Game Engine Architecture by Jason Gregory
	var q = [0, 0, 0, 0];
	var trace = mat.idx(0,0) + mat.idx(1,1) + mat.idx(2,2);
	
	// check diagonal
	if (trace > 0.0) {
		var s = Math.sqrt(trace + 1.0);
		q[3] = s * 0.5;
		
		var t = 0.5 / s;
		q[0] = (mat.idx(2,1) - mat.idx(1,2)) * t;
		q[1] = (mat.idx(0,2) - mat.idx(2,0)) * t;
		q[2] = (mat.idx(1,0) - mat.idx(0,1)) * t;
	}
	else {
		// diagonal is negative
		var i = 0;
		if (mat.idx(1,1) > mat.idx(0,0)) {
			i = 1;
		}
		if (mat.idx(2,2) > mat.idx(i,i)) {
			i = 2;
		}
		var NEXT = [1, 2, 0];
		var j = NEXT[i];
		var k = NEXT[j];
		
		var s = Math.sqrt((mat.idx(i,i) - (mat.idx(j,j) + mat.idx(k,k))) + 1.0);
		
		q[i] = s * 0.5;
		
		var t = s;
		if (s != 0.0) {
			t = 0.5 / s;
		}
		
		q[3] = (mat.idx(k,j) - mat.idx(j,k)) * t;
		q[j] = (mat.idx(j,i) + mat.idx(i,j)) * t;
		q[k] = (mat.idx(k,i) + mat.idx(i,k)) * t;
	}
	
	return (new Quaternion($V([q[0], q[1], q[2]]), q[3])).normalize();
}

Quaternion.AxisAngleToQuaternion = function(axis, angle) {
	var qv = axis.x(Math.sin(angle / 2 * DEG2RAD));
	var qs = Math.cos(angle / 2);
	return (new Quaternion(qv, qs)).normalize();
}
Quaternion.AxisAngleRadToQuaternion = function(axis, angle) {
	var qv = axis.x(Math.sin(angle / 2));
	var qs = Math.cos(angle / 2);
	return (new Quaternion(qv, qs)).normalize();
}

Quaternion.prototype.ToEuler = function() { return Quaternion.QuaternionToEuler(this); };
Quaternion.prototype.ToMatrix = function() { return Quaternion.QuaternionToMatrix(this); };

function TriangulatePolygon(vertArray, ccw=true) {
	// triangulate a hole-less polygon given vertex set
	// function assumes that the input is a polygon to be split into triangles and that the vertices are in CCW or CW order as opposed to vertex soup
	// code adapted from Real-Time Collision Detection by Christer Ericson, Chapter 12 - Geometrical robustness pg 498 (ear-clipping triangulation algorithm)
	
	var indexArray = [];
	
	// utility arrays to allow usage of array as a circular doubly-linked linked list
	// immediately called anonymous functions to generate the arrays
	var ll_prev = (function() {
		var retval = [];
		for (var i = 0; i < vertArray.length; ++i) {
			retval[i] = i - 1;
		}
		retval[0] = vertArray.length - 1;
		return retval;
	})();
	var ll_next = (function() {
		var retval = [];
		for (var i = 0; i < vertArray.length; ++i) {
			retval[i] = i % vertArray.length;
		}
	})();
	
	// set up variables for the loop
	var idx = 0;
	var nVerts = vertArray.length;
	// remove vertices until only a triangle is left
	while (nVerts > 3) {
		var isEar = true;
		
		// temporary triangle
		var tmp_face = new Face();
		tmp_face.indices = $V([ll_prev[idx], idx, ll_next[idx]]);
		tmp_face.normal = GetFaceNormal(vertArray[ll_prev[idx]], vertArray[idx], vertArray[ll_next[idx]]);
		
		// test if ear is convex
		if (TestTriangleWinding(vertArray[tmp_face.indices.idx(0)].position, vertArray[tmp_face.indices.idx(1)].position, vertArray[tmp_face.indices.idx(2)].position, ccw)) {
			// test if there is another vertex inside this triangle
			var k = ll_next[ll_next[idx]];
			do {
				if (PointTriangleIntersection(vertArray[k].position, vertArray[ll_prev(idx)].position, vertArray[idx].position, vertArray[ll_next[idx]].position)) {
					isEar = false;
					break;
				}
				k = ll_next(k);
			} while (k != ll_prev(idx));
		}
		else {
			// triangle is incorrect winding, therefore not an ear
			isEar = false;
		}
	}
	if (isEar) {
		// add this triangle to the index array
		
		indexArray.push(oface);
		// remove vertex idx by changing prev/next links
		next[prev[idx]] = next[idx];
		prev[next[idx]] = prev[idx];
		--nVerts;
		// visit the previous vertex next
		idx = prev[idx];
	}
	else {
		// move on to next vertex to find ear
		idx = next[idx];
	}
	return indexArray;
}

function GetFaceNormal(a, b, c) {
	// find normal to a triangle by taking the cross product of two of the sides
	var ab = b.position.sub(a.position);
	var ac = c.position.sub(a.position);
	var onorm = ab.cross(ac);
	
	// the average is the face norm for lighting, but this isn't the physics normal to the face necessarily
	var avgnorm = a.normal.add(b.normal).add(c.normal).map(function(x) {return x / 3.0;});
	
	// test if they're pointing the same or opposite ways using the dot product
	var ndot = onorm.dot(avgnorm);
	
	// negate the normal if the dot product is negative (the two normals point different directions)
	return onorm.multiply(ndot < 0 ? -1 : 1);
}

function TestTriangleWinding(norm, a, b, c, ccw=true) {
	// if RH rule then it's CCW, if it's LH rule then CW
	// world and object space for OpenGL (WebGL) is RH by default
	// if we check this against the normal i think there's no need to specify specifically CCW or CW, 
	// it just comes out pointing in the direction you specify or not and tells you if this is correct
	// for your coordinate system
	var ab = b.position.sub(a.position);
	var ac = c.position.sub(a.position);
	var onorm = ab.cross(ac);
	return (norm.dot(onorm) > 0);
}

function PointTriangleIntersection(pt, a, b, c, ccw=true) {
	
}

function VertexWindingOrder(vertArray) {
	// given a set of vertices in a mesh, get a winding order
	
}