function GeonGenerator(GeonSize) {
	this.complexityAgent = new ComplexityAgent();
	this.geons = new Array();
	this.SIZE = GeonSize;
}

GeonGenerator.prototype = {
	constructor: GeonGenerator(1),

	createMesh: (geom, metric) => {
		geom.applyMatrix(new THREE.Matrix4().makeTranslation( metric.translationX,
															  metric.translationY,
															  metric.translationZ) );

		var material = new THREE.MeshPhongMaterial( {color: 0xa7d8d93} );
		material.transparent = true;

		var mesh = new THREE.Mesh(geom.clone(), material);
		mesh.scale.set(metric.scaleX, metric.scaleY, metric.scaleZ);
		mesh.rotation.x = metric.rotationX;
		mesh.rotation.y = metric.rotationY;
		mesh.rotation.z = metric.rotationZ;

		return mesh;
	},

	drawSquare: () => {
		var shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, this.SIZE); shape.lineTo(this.SIZE, this.SIZE);
		shape.lineTo(this.SIZE, 0); shape.lineTo(0, 0);

		return shape;
	},

	drawRectangle: () => {
		var shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, 2 * this.SIZE); shape.lineTo(this.SIZE, 2 * this.SIZE);
		shape.lineTo(this.SIZE, 0); shape.lineTo(0, 0);

		return shape;
	},

	drawPolygon: () => {
		var shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(this.SIZE, 0); shape.lineTo(0.5 * this.SIZE, 0.25 * this.SIZE);
		shape.moveTo(0, 0);

		return shape;
	},

	drawCircle: () => {
		var shape = new THREE.Shape();
		shape.absarc(0.5 * this.SIZE, 0.5 * this.SIZE, 0.5 * this.SIZE, 0, 2 * Math.PI, false);
		return shape;
	},

	drawEllipse: () => {
		var shape = new THREE.Shape();
		shape.absellipse(0.5 * this.SIZE, 0.5 * this.SIZE, 0.5 * this.SIZE, this.SIZE, 0, 2 * Math.PI, false);
		return shape;
	},

	drawIrregular: () => {
		var shape = new THREE.Shape();

		shape.splineThru([
		  new THREE.Vector2(0.5 * this.SIZE, - this.SIZE),
		  new THREE.Vector2(this.SIZE, 0),
		  new THREE.Vector2(0, 0)
		]);

		return shape;
	},

	drawGeon: function(geon) {
	
		// wrong parameter cases
		if (geon.geonType.symmetry !== 0 &&
			  geon.geonType.symmetry !== 1 &&
			  geon.geonType.symmetry !== 2) {
			console.log("Wrong parameter: symmetry " + symmetry);
			return;
		}

		if (geon.geonType.crossSectionType !== 0 &&
			  geon.geonType.crossSectionType !== 1) {
			console.log("Wrong parameter: crossSectionType " +
						 geon.geonType.crossSectionType);
			return;
		}

		if (geon.geonType.axisType !== 0 &&
			  geon.geonType.axisType !== 1) {
			console.log("Wrong parameter: axisType " + 
						 geon.geonType.axisType);
			return;
		}

		if (geon.geonType.crossSectionChange !== 0 &&
			  geon.geonType.crossSectionChange !== 1 &&
			  geon.geonType.crossSectionChange !== 2) {
			console.log("Wrong parameter: crossSectionChange " +
			 			 geon.geonType.crossSectionChange);
			return;
		}

		if (geon.geonType.crossSectionChange === 0) { // extrude cross section
			// Draw cross section
			var shape;
			if (geon.geonType.symmetry === 0 &&
				  geon.geonType.crossSectionType === 0) {
				// irregular polygon
				shape = this.drawPolygon();
			}
			else if (geon.geonType.symmetry === 0 &&
				       geon.geonType.crossSectionType === 1) {
				// irregular curved shape
				shape = this.drawIrregular();
			}
			else if (geon.geonType.symmetry === 1 &&
							 geon.geonType.crossSectionType === 0) {
				// rectangle
				shape = this.drawRectangle();
			}
			else if (geon.geonType.symmetry === 1 &&
							 geon.geonType.crossSectionType === 1) {
				// ellipse
				shape = this.drawEllipse();
			}
			else if (geon.geonType.symmetry === 2 &&
							 geon.geonType.crossSectionType === 0) {
				// square
				shape = this.drawSquare();
			}
			else if (geon.geonType.symmetry === 2 &&
							 geon.geonType.crossSectionType === 1) {
				// circle
				shape = this.drawCircle();
			}

			// Extrude shape
			var extrudePath;
			var amount; // VN: on how many pixels to extrude
			if (geon.geonType.axisType === 0) {
				extrudePath = undefined; // default straight line
				amount = this.SIZE;
				if (geon.geonType.symmetry === 2 &&
					  geon.geonType.crossSectionType === 1) {
					amount = 4 * this.SIZE;
				}
			}
			else if (geon.geonType.axisType === 1) {
				var x1 = this.SIZE, y1 = 0.5 * this.SIZE, z1 = this.SIZE;
				var x2 = this.SIZE, y2 = 0.9 * this.SIZE, z2 = 0.5 * this.SIZE;
				var x3 = this.SIZE, y3 = 0.9 * this.SIZE, z3 = 0;
				extrudePath = new THREE.QuadraticBezierCurve3(
					new THREE.Vector3(x1, y1, z1),
					new THREE.Vector3(x2, y2, z2),
					new THREE.Vector3(x3, y3, z3)
				);
				amount = 30;
			}

			var options = {
				curveSegments: 10,
				steps: 10,
				amount: amount,
				bevelEnabled: false,
				extrudePath: extrudePath,
			};

			// Mesh object
			geon.solid = this.createMesh(new THREE.ExtrudeGeometry(shape, options),
			  							    				 geon.metric);
		}
		else if (geon.geonType.crossSectionChange === 1) {
			// a cone or a pyramid
			if (geon.geonType.axisType === 0) {
				if (geon.geonType.crossSectionType === 0) {
					if (geon.geonType.symmetry === 2) {
						geon.metric.rotationX = (2 * Math.PI) / 4;
						geon.solid = this.createMesh(new THREE.CylinderGeometry(0, 
																				1.5 * this.SIZE,
																				2 * this.SIZE,
																				0.4 * this.SIZE),
													 geon.metric);
					}
					else if (geon.geonType.symmetry === 1) {
						// TODO
						// pirammida o prostokątnej podstawie
						console.log("Not supported geon type: axisType " +
						 						 geon.geonType.axisType + " crossSectionChange " +
												 geon.geonType.crossSectionChange + " symmetry " +
												 geon.geonType.symmetry + " crossSectionType " +
												 geon.geonType.crossSectionType);
					}
				}
				else if (geon.geonType.crossSectionType === 1) {
					if (geon.geonType.symmetry === 2) {
						geon.metric.rotationX = (2 * Math.PI) / 4;
						geon.solid = this.createMesh(new THREE.CylinderGeometry(0,
																				this.SIZE,
																				4 * this.SIZE,
																				5 * this.SIZE,
																				5 * this.SIZE,
																				false),
													 geon.metric);
					}
					else {
						console.log("Not supported geon type: axisType " +
						 						 geon.geonType.axisType + " crossSectionChange " +
												 geon.geonType.crossSectionChange + " symmetry " +
												 geon.geonType.symmetry + " crossSectionType " +
												 geon.geonType.crossSectionType);
					}
				}
			}
			else if (geon.geonType.axisType === 1) {
				console.log("Not supported geon type: axisType " +
				 						 geon.geonType.axisType + " crossSectionChange " +
										 geon.geonType.crossSectionChange + " symmetry " +
										 geon.geonType.symmetry + " crossSectionType " +
										 geon.geonType.crossSectionType);
			}
		}
		else if (geon.geonType.crossSectionChange === 2) {
			if (geon.geonType.axisType === 0 &&
				  geon.geonType.symmetry === 2 &&
					geon.geonType.crossSectionType === 1) {
				// TODO
				// jajko
			}
			else {
				console.log("Not supported geon type: axisType " +
										geon.geonType.axisType + " crossSectionChange " +
										geon.geonType.crossSectionChange + " symmetry " +
										geon.geonType.symmetry + " crossSectionType " +
										geon.geonType.crossSectionType);
			}
		}
	},

	createUserGeon: function(geonTypeIndex) {
		var geonType = this.complexityAgent.allGeonTypes[geonTypeIndex];
		var geon = new Geon(geonType);
		geon.metric = new Metric();
		this.drawGeon(geon);
		return geon;
	},

	clearAll: () => {
		this.geons = new Array();
		this.complexityAgent.clear();
	}
}
