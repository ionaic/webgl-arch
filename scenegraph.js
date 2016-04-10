function SceneObject() {}
function Transform() {}
function Material() {}

SceneObject.prototype = {
	parent : null,
	children : [],
	components : {
		mesh : new Mesh(),
		transform : new Transform(),
		material : new Material()
	},
	draw : function() {
		// call draw function recursively through the tree
	}
};
