// constructor declaration/definitions
function Transform() {
	position = $V([0,0,0,0]);
	rotation = $V([0,0,0,0]);
	scale = 1.0;
}
function Camera() {
	SceneObject.call(this, "Camera");
	this.forward = $V([0,0,0]);
	this.up = $V([0, 1, 0]);
}
function SceneObject(inName, inMesh, inMaterial, inParent) {
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
	
	if (inParent != null) {
		this.parent = inParent;
	}
	else {
		this.parent = null;
	}
	
	this.children = [];
	
	this.components = {
		mesh : new Mesh(),
		transform : new Transform(),
		material : new Material(),
		userdef : [],
	};
	
	this.updateMaterial();
}
// TODO is this how this inheritance works in JS?
// Camera.prototype = Object.create(SceneObject.prototype, {
	// constructor : function () {},
	// forward : $V([0,0,0]),
	// up : $V([0, 1, 0]),
// });

SceneObject.prototype = {
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
				LogError("Child of " + this.name + " (" + (idx + 1) + "/" + this.children.length + "): " + JSON.stringify(this.children[idx]));
				this.children[idx].draw();
			}
		}
		this.mesh._drawMesh();
	},
	addChild : function(childobj) {
		// childobj.parent = this;
		this.children.push(childobj);
	},
	addComponent : function(component) {
	},
	toString : function(full=false) {
		if (full) {
			return JSON.stringify(this);
		}
		return "Name: " + this.name + ";\n" + this.mesh.toString() + this.material.toString();
	}
};

Transform.prototype = {
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