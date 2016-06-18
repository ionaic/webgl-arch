// constructor declaration/definitions
function VectorBasis(left, up, forward) {
	this.left = $V([1, 0, 0, 0]),
	this.up = $V([0, 1, 0, 0]),
	this.forward = $V([0, 0, 1, 0])
};
VectorBasis.prototype = {
	toArray : function() {
		return [this.left.elements, this.up.elements, this.forward.elements];
	},
	toMatrix : function() {
		return $M(this.toArray());
	},
	Rotate : function(quat) {
		this.left = quat.rotate(this.left);
		this.up = quat.rotate(this.up);
		this.forward = quat.rotate(this.forward);
	}
}

function Transform() {
	this.position = $V([0,0,0]);
	// 3 numbers, angle between each axis (x, y, z) in model space compared to (x,y,z) world space/parent space
	// can store the basis vectors of the model and then the matrix is [i 0; j 0; k 0; t 0] where i j k are the basis vectors in world space and t is the translation
	this.basis = new VectorBasis();
	this.scale = [1,1,1]; // only allow uniform scale?
}
Transform.prototype = {
	rotation : function() {
		return [Math.acos(this.basis.left.ensure3D().dot([1,0,0])), 
				Math.acos(this.basis.up.ensure3D().dot([0,1,0])), 
				Math.acos(this.basis.forward.ensure3D().dot([0,0,1]))]
	},
	getEulerAngles : function() {
		// quaternion to euler
	},
	setEulerAngles : function(pitch, roll, yaw) {
		// euler to quaternion
	},
	getRotationMatrix : function() {
		
	},
	Translate : function(vec) {
		this.position = this.position.add(vec) || this.position;
	},
	Rotate : function(axis, angle) {
		this.basis.Rotate(Quaternion.AxisAngleToQuaternion(axis, angle));
	},
	RotateEuler : function(roll, pitch, yaw) {
		var quat = Quaternion.EulerToQuaternion([roll, pitch, yaw])
		this.basis.Rotate(quat);
	},
	Scale : function(x, y, z) {
		this.ScaleX(x);
		this.ScaleY(y);
		this.ScaleZ(z);
	},
	ScaleX : function(scalar) {
		this.scale[0] = scalar || this.scale[0];
		return this.scale[0];
	},
	ScaleY : function(scalar) {
		this.scale[1] = scalar || this.scale[1];
		return this.scale[1];
	},
	ScaleZ : function(scalar) {
		this.scale[2] = scalar || this.scale[2];
		return this.scale[2];
	},
	GetTransformMatrix : function() {
		// return matrix transform
		// the basis vectors make up the column vectors of the model matrix, the translation is the 4th column vector
		return $M([this.basis.left.x(this.scale[0]).elements, 
				  this.basis.up.x(this.scale[1]).elements,
				  this.basis.forward.x(this.scale[2]).elements,
				  this.position.elements.concat(1)]).transpose();
	},
};

function Components(inMesh, inTransform, inMaterial) {
	this.mesh = inMesh || new Mesh();
	this.transform = inTransform || new Transform();
	this.material = inMaterial || new Material();
	this.userdef = [];
}

function SceneObject(inName, inMesh, inMaterial, inTransform, inParent) {
	this.name = inName || "SceneObject";
	// maybe make this.mesh and this.components.mesh point to the same thing for ease of use? also could add a .mesh() and .material() function for ease of use?
	// this.mesh = inMesh || new Mesh();
	// this.material = inMaterial || new Material();
	this.parent = inParent || null;
	this.children = [];

	this.components = new Components(inMesh, inTransform, inMaterial);

	this.updateMaterial();
}
SceneObject.prototype = {
	applyTransform : function() {
		// set the uniforms for the mvp matrices
	},
	updateMaterial : function() {
		this.components.material.initShaders(this.components.mesh);
	},
	draw : function() {
		// call draw function recursively through the tree
		if (this.children != null && this.children.length > 0) {
			for (var idx = 0; idx < this.children.length; ++idx) {
				this.children[idx].draw();
			}
		}
		if (!this.components.mesh.hasMesh()) {
			// LogError("No mesh, skipping draw for object " + this.name);
			return;
		}
		this.components.material.setModelMatrix(this.GetModelMatrix());
		this.components.mesh.draw(this.components.material);
	},
	addChild : function(childobj) {
		// childobj.parent = this;
		this.children.push(childobj);
	},
	addComponent : function(name, component) {
		var old = this.components[name];
		
		this.components[name] = component;
		
		return old;
	},
	GetModelMatrix : function() {
		return this.components.transform.GetTransformMatrix();
	},
	toString : function(full) {
		if (full) {
			return JSON.stringify(this);
		}
		return "Name: " + this.name + ";\n" + this.components.mesh.toString() + this.components.material.toString();
	}
};

function Camera(inFov, inAspect, inNearPlane, inFarPlane) {
	SceneObject.call(this, "Camera");
	this.forward = $V([0,0,0]);
	this.up = $V([0, 1, 0]);
	this.fov = inFov;
	this.aspect = inAspect;
	this.nearPlane = inNearPlane;
	this.farPlane = inFarPlane;
	this.projection = null;
	
	this.GeneratePerspectiveMatrix();
}
Camera.prototype = Object.create(SceneObject.prototype, {
	GetViewMatrix : {
		value : function() {
			return this.components.transform.GetTransformMatrix();
		},
		enumerable : false,
		configurable : true,
		writable : true
	},
	GetViewToWorldMatrix : {
		value : function() {
			return this.GetViewMatrix().inverse();
		},
		enumerable : false,
		configurable : true,
		writable : true
	},
	GetWorldToViewMatrix : {
		value : this.GetViewMatrix,
		enumerable : false,
		configurable : true,
		writable : true
	},
	GetProjectionMatrix : {
		value : function() {
			if (this.projection == null) {
				this.GeneratePerspectiveMatrix();
			}
			return this.projection;
		},
		enumerable : false,
		configurable : true,
		writable : true
	},
	SetCameraMatrices : {
		value : function(material) {
			material.setViewMatrix(this.GetViewMatrix());
			material.setProjectionMatrix(this.GetProjectionMatrix());
		},
		enumerable : false,
		configurable : true,
		writable : true
	},
	GeneratePerspectiveMatrix : {
		value : function() {
			this.projection = Camera.MakePerspectiveMatrix(this.fov, this.aspect, this.nearPlane, this.farPlane);
		},
		enumerable : false,
		configurable : true,
		writable : true
	}
});
Camera.prototype.constructor = Camera;

Camera.MakePerspectiveMatrix = makePerspective;