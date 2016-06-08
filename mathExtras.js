// math utility functions

// Aliases for sylvester functions to more familiar names, also adding a sqrMagnitude function
Vector.prototype.sqrMagnitude = function() {
	// inner product with itself is sqrmagnitude
	return this.dot(this);
}
Vector.prototype.magnitude = Vector.prototype.modulus;
Vector.prototype.normalize = Vector.prototype.toUnitVector;

Quaternion.prototype = Vector.prototype;

// Quaternion.prototype.mul = function() {
	
// }

function QuaternionToEuler(quat) {
	
}

function EulerToQuaternion(euler) {
	
}

function QuaternionToMatrix(quat) {
	
}

function MatrixToQuaternion(mat) {
	
}

function AxisAngleToQuaternion(axis, angle) {
	var qv = axis.x(Math.sin(angle / 2));
	var qs = Math.cos(angle / 2);
	var quat = new Quaternion(qv.elements);
	quat.elements.push(qs);
	return quat;
}

Quaternion.ToEuler = function() { return QuaternionToEuler(this); };
Quaternion.ToMatrix = function() {return QuaternionToMatrix(this); };

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