// constructor declaration/definitions
function Transform() {
	this.position = $V([0,0,0,0]);
	this.rotation = $V([0,0,0,0]);
	this.scale = 1.0; // only allow uniform scale
}
Transform.prototype = {
	getEulerAngles : function() {
		// quaternion to euler
	},
	setEulerAngles : function(pitch, roll, yaw) {
		// euler to quaternion
	},
	getRotationMatrix : function() {
		
	},
	Translate : function(vec) {
		
	},
	Rotate : function(angle, axis) {
		
	},
	RotateEuler : function(roll, pitch, yaw) {
		
	},
	Scale : function(scalar) {
		this.scale *= scalar;
	},
	GetModelMatrix : function() {
		// return matrix transform
	},
}

function SceneObject(inName, inMesh, inMaterial, inParent) {
	this.name = inName || "SceneObject";
	this.mesh = inMesh || new Mesh();
	this.material = inMaterial || new Material();
	this.parent = inParent || null;
	this.children = [];

	this.components = {
		mesh : new Mesh(),
		transform : new Transform(),
		material : new Material(),
		userdef : [],
	};

	this.updateMaterial();
}
SceneObject.prototype = {
	applyTransform : function() {
		// set the uniforms for the mvp matrices
	},
	updateMaterial : function() {
		this.material.initShaders(this.mesh);
	},
	draw : function() {
		// call draw function recursively through the tree
		if (this.children != null && this.children.length > 0) {
			for (var idx = 0; idx < this.children.length; ++idx) {
				LogError("Child of " + this.name + " (" + (idx + 1) + "/" + this.children.length + "): " + this.children[idx].toString());
				this.children[idx].draw();
			}
		}
		this.mesh.draw(this.material);
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

function Camera() {
	SceneObject.call(this, "Camera");
	this.forward = $V([0,0,0]);
	this.up = $V([0, 1, 0]);
}
// TODO is this how this inheritance works in JS?
// Camera.prototype = Object.create(SceneObject.prototype, {
// });