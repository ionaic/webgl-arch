// constructor declaration/definitions
function SceneObject(inName, inMesh, inMaterial, inParent) {
	LogError("In Constructor for SceneObject");
	if (inName != null) {
		this.name = inName;
	}
	else {
		this.name = "SceneObject";
	}
	
	if (inMesh != null) {
		this.mesh = inMesh;
	}
	else {
		this.mesh = new Mesh();
	}
	
	if (inMaterial != null) {
		this.material = inMaterial;
	}
	else {
		this.material = new Material();
	}
	
	LogError("Material: " + JSON.stringify(this.material));
	
	if (inParent != null) {
		this.parent = inParent;
	}
	else {
		this.parent = null;
	}
	
	this.updateMaterial();
	LogError("String: " + JSON.stringify(this));
}
function Transform() {}
function Camera() {}

SceneObject.prototype = {
	name : "SceneObject",
	parent : null,
	children : [],
	components : {
		mesh : new Mesh(),
		transform : new Transform(),
		material : new Material(),
		userdef : [],
	},
	applyTransform : function() {
		// set the uniforms for the mvp matrices
	},
	updateMaterial : function() {
		this.material.initShaders(this.mesh);
	},
	draw : function() {
		// call draw function recursively through the tree
		LogError("Drawing SceneObject " + this.name + ": " + JSON.stringify(this));
		if (this.children != null && this.children.length > 0) {
			LogError("Children: " + JSON.stringify(this.children));
			for (var idx = 0; idx < this.children.length; ++idx) {
				// LogError("Child of " + this.name + ": " + JSON.stringify(this.children[idx]));
				// this.children[idx].draw();
			}
		}
		this.mesh._drawMesh();
	},
	addChild : function(childobj) {
		childobj.parent = this;
		this.children.push(childobj);
		// this.children[this.children.length-1].parent = this;
	},
	addComponent : function(component) {
	}
};

// TODO is this how this inheritance works in JS?
Camera.prototype = Object.create(SceneObject.prototype, {
	constructor : function () {},
	forward : $V([0,0,0]),
	up : $V([0, 1, 0]),
});

Transform.prototype = {
	position : $V(),
	rotation : $V([0,0,0,0]),
	scale : $V(),
	getEulerAngles : function() {
		// quaternion to euler
	},
	setEulerAngles : function(pitch, roll, yaw) {
		// euler to quaternion
	},
	Translate : function(vec) {
		
	},
	Rotate : function(vec) {
		
	},
	Scale : function(vec) {
		
	}
}