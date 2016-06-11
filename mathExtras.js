// math utility functions

// Aliases for sylvester functions to more familiar names, also adding a sqrMagnitude function
Vector.prototype.sqrMagnitude = function() {
	// inner product with itself is sqrmagnitude
	return this.dot(this);
}
Vector.prototype.magnitude = Vector.prototype.modulus;
Vector.prototype.normalize = Vector.prototype.toUnitVector;

// Quaternion type
function Quaternion(inQv, inQs) {
	this.qv = inQv || Vector.Zero(3);
	this.qs = inQs || 0.0;
}
Quaternion.prototype = Vector.prototype;
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
		return new Quaternion(this.qv.mul(k), this.qs * k);
	},
	asVector : function() {
		var tmp = new Vector(this.qv);
		tmp.elements.push(qs);
	},
	fromVector : function(vec) {
		// [qv qs]
		this.qv = new Vector(vec.e(0), vec.e(1), vec.e(2));
		this.qs = vec.e(3);
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
	},
	conjugate : function() {
		return new Quaternion(this.qv * -1, this.qs);
	},
	inverse : function() {
		var qstar = this.conjugate();
		return qstar.scale(this.sqrMagnitude());
	},
	rotate : function(v) {
		// rotate a vector v using this quaternion
		// TODO
	},
}

function QuaternionToEuler(quat) {
	var q0 = quat.q0(),
		q1 = quat.q1(),
		q2 = quat.q2(),
		q3 = quat.q3();
	return new Vector([
		Math.atan2((2 * (q0 * q1 + q2 * q3)), (1 - 2(q1 * q1 + q2 * q2))),
		Math.asin(2 * (q0 * q2 - q3 * q1)),
		Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3))
	]);
}

function EulerToQuaternion(euler) {
	var x = euler[0] / 2;
	var y = euler[1] / 2;
	var z = euler[2] / 2;
	
	var q = [
		Math.cos(x) * Math.cos(y) * Math.cos(z) + Math.sin(x) * Math.sin(y) + Math.sin(z),
		Math.sin(x) * Math.cos(y) * Math.cos(z) - Math.cos(x) * Math.sin(y) + Math.sin(z),
		Math.cos(x) * Math.sin(y) * Math.cos(z) - Math.sin(x) * Math.cos(y) + Math.sin(z),
		Math.sin(x) * Math.cos(y) * Math.sin(z) - Math.sin(x) * Math.sin(y) + Math.cos(z)
	];
	var quat = new Quaternion();
	quat.fromVector(q);
	return quat;
}

function QuaternionToMatrix(quat) {
	var x = quat.q0();
	var y = quat.q1();
	var z = quat.q2();
	var w = quat.q3();
	
	return new Matrix(	[1 - 2*y*y - 2*z*z, 2*x*y + 2*z*w, 2*x*z - 2*y*w],
						[2*x*y - 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z + 2*x*w],
						[2*x*z - 2*y*w, 2*y*z - 2*x*w, 1 - 2*x*x - 2*y*y]);
}

function MatrixToQuaternion(mat) {
	// adapted from Game Engine Architecture by Jason Gregory
	var q = [0, 0, 0, 0];
	var trace = mat.e(0,0) + mat.e(1,1) + mat.e(2,2);
	
	// check diagonal
	if (trace > 0.0) {
		var s = Math.sqrt(trace + 1.0);
		q[3] = s * 0.5;
		
		var t = 0.5 / s;
		q[0] = (mat.e(2,1) - mat.e(1,2)) * t;
		q[1] = (mat.e(0,2) - mat.e(2,0)) * t;
		q[2] = (mat.e(1,0) - mat.e(0,1)) * t;
	}
	else {
		// diagonal is negative
		var i = 0;
		if (mat.e(1,1) > mat.e(0,0)) {
			i = 1;
		}
		if (mat.e(2,2) > mat.e(i,i)) {
			i = 2;
		}
		var NEXT = [1, 2, 0];
		var j = NEXT[i];
		var k = NEXT[j];
		
		var s = Math.sqrt((mat.e(i,i) - (mat.e(j,j) + mat.(k,k))) + 1.0);
		
		q[i] = s * 0.5;
		
		var t = s;
		if (s != 0.0) {
			t = 0.5 / s;
		}
		
		q[3] = (mat.e(k,j) - mat.e(j,k)) * t;
		q[j] = (mat.e(j,i) + mat.e(i,j)) * t;
		q[k] = (mat.e(k,i) + mat.e(i,k)) * t;
	}
	
	return new Quaternion(new Vector([q[0], q[1], q[2]]), q[3]);
}

function AxisAngleToQuaternion(axis, angle) {
	var qv = axis.x(Math.sin(angle / 2));
	var qs = Math.cos(angle / 2);
	return new Quaternion(qv, qs);
}

Quaternion.prototype.ToEuler = function() { return QuaternionToEuler(this); };
Quaternion.prototype.ToMatrix = function() { return QuaternionToMatrix(this); };

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
		if (TestTriangleWinding(vertArray[tmp_face.indices.e(1)].position, vertArray[tmp_face.indices.e(2)].position, vertArray[tmp_face.indices.e(3)].position, ccw)) {
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