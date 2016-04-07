// math utility functions
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
		
		// test if ear is convex
		if (TestTriangleWinding(vertArray[ll_prev[idx]], vertArray[idx], vertArray[ll_next[idx]], ccw)) {
			// test if there is another vertex inside this triangle
			var k = ll_next[ll_next[idx]];
			do {
				if (PointTriangleIntersection(vertArray[k], vertArray[ll_prev(idx)], vertArray[idx], vertArray[ll_next[idx]])) {
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
		indexArray.push($V([idx, ll_prev[idx], ll_next[idx]]));
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
}

function GetFaceNormal(a, b, c) {
	// find normal to a triangle by taking the cross product of two of the sides
	var ab = b.sub(a);
	var ac = c.sub(a);
	var onorm = ab.cross(ac);
	
	// the average is the face norm for lighting, but this isn't the physics normal to the face necessarily
	var avgnorm = a.normal.add(b.normal).add(c.normal).each().map(function(x) {return x/;});
	
}

function TestTriangleWinding(pt, a, b, c, ccw=true) {
	
}

function VertexWindingOrder(vertArray) {
	// given a set of vertices in a mesh, get a winding order
	
}