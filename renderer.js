function initBuffers() {
	squareVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

	var vertices = [
		1.0,  1.0,  0.0,
		-1.0, 1.0,  0.0,
		1.0,  -1.0, 0.0,
		-1.0, -1.0, 0.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function initBuffers(meshObject) {
	if (!meshObject.vertexBuffer) {
		meshObject.vertexBuffer = gl.createBuffer();		
	}
	if (!meshObject.indexBuffer) {
		meshObject.indexBuffer = gl.createBuffer();		
	}
	
	if (!(meshObject.vertices || meshObject._vertices)) {
		return;
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, meshObject.vertexBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawAll() {
	
}