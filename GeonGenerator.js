function GeonGenerator()
{
	this.complexityAgent = new ComplexityAgent();
	this.verticalSymmetryAgent = new VerticalSymmetryAgent();
	this.alignmentAgent = new AlignmentAgent();
	this.geons = new Array();
}

GeonGenerator.prototype = 
{	
	constructor: GeonGenerator,
	
	createMesh: (geom, metric) =>
	{
		geom.applyMatrix( new THREE.Matrix4().makeTranslation(metric.translationX,
															  metric.translationY,
															  metric.translationZ) );

		var material = new THREE.MeshPhongMaterial({color: 0xa7d8d93});
		material.transparent = true;
		
		var mesh = new THREE.Mesh(geom.clone(), material);		
		mesh.scale.set(metric.scaleX, metric.scaleY, metric.scaleZ);
		mesh.rotation.x = metric.rotationX;
		mesh.rotation.y = metric.rotationY;
		mesh.rotation.z = metric.rotationZ;	
		
		return mesh;
	},		

	drawSquare: () =>
	{
		var shape = new THREE.Shape();			
		shape.moveTo(0, 0);
		shape.lineTo(0, 10);
		shape.lineTo(10, 10);
		shape.lineTo(10, 0);
		shape.lineTo(0, 0);
		
		return shape;			
	},
	
	drawRectangle: () =>
	{
		var shape = new THREE.Shape();			
		shape.moveTo(0, 0);
		shape.lineTo(0, 20);
		shape.lineTo(10, 20);
		shape.lineTo(10, 0);
		shape.lineTo(0, 0);
		
		return shape;		
	},
	
	drawPolygon: () =>
	{
		var shape = new THREE.Shape();			
		shape.moveTo(0, 0);
		shape.lineTo(10, 0);
		shape.lineTo(5, 3);
		shape.moveTo(0, 0);
		
		return shape;			
	},
	
	drawCircle: () =>
	{			
		var shape = new THREE.Shape();
		shape.absarc(5, 5, 5, 0, Math.PI * 2, false);
		return shape;
	},
	
	drawEllipse: () =>
	{
		var shape = new THREE.Shape();
		shape.absellipse(5, 5, 5, 10, 0, Math.PI * 2, false);
		return shape;
	},
	
	drawIrregular: () =>
	{
		var shape = new THREE.Shape();		
		
		shape.splineThru([
		  new THREE.Vector2(5, -10),
		  new THREE.Vector2(10, 0),
		  new THREE.Vector2(0, 0)
		]);			
		
		return shape;		
	},

	drawGeon: function(geon)
	{
		// wrong parameter cases
		if (geon.geonType.symmetry !== 0 &&
			geon.geonType.symmetry !== 1 &&
			geon.geonType.symmetry !== 2)
		{
			console.log("Wrong parameter: symmetry " + symmetry);
			return;
		}
		if (geon.geonType.crossSectionType !== 0 &&
			geon.geonType.crossSectionType !== 1)
		{
			console.log("Wrong parameter: crossSectionType " + geon.geonType.crossSectionType);
			return;			
		}
		if (geon.geonType.axisType !== 0 &&
			geon.geonType.axisType !== 1)
		{
			console.log("Wrong parameter: axisType " + geon.geonType.axisType);
			return;
		}
		if (geon.geonType.crossSectionChange !== 0 &&
			geon.geonType.crossSectionChange !== 1 &&
			geon.geonType.crossSectionChange !== 2)
		{
			console.log("Wrong parameter: crossSectionChange " + geon.geonType.crossSectionChange);
			return;
		}
		
	
		if (geon.geonType.crossSectionChange === 0) // extrude cross section
		{
			// Draw cross section
			var shape;
			if (geon.geonType.symmetry === 0 && geon.geonType.crossSectionType === 0)
			{
				// irregular polygon
				shape = this.drawPolygon();
			}
			else if (geon.geonType.symmetry === 0 && geon.geonType.crossSectionType === 1)
			{
				// irregular curved shape
				shape = this.drawIrregular();
			}
			else if (geon.geonType.symmetry === 1 && geon.geonType.crossSectionType === 0)
			{
				// rectangle
				shape = this.drawRectangle();
			}
			else if (geon.geonType.symmetry === 1 && geon.geonType.crossSectionType === 1)
			{
				// ellipse
				shape = this.drawEllipse();
			}
			else if (geon.geonType.symmetry === 2 && geon.geonType.crossSectionType === 0)
			{
				// square
				shape = this.drawSquare();
			}
			else if (geon.geonType.symmetry === 2 && geon.geonType.crossSectionType === 1)
			{
				// circle
				shape = this.drawCircle();
			}		
		
			// Extrude shape
			var extrudePath;
			var amount;
			if (geon.geonType.axisType === 0)
			{
				extrudePath = undefined; // default straight line
				amount = 10;
        
				if (geon.geonType.symmetry === 2 && geon.geonType.crossSectionType === 1)
				{
					amount = 40;
				}
			}
			else if (geon.geonType.axisType === 1)
			{
				var x1 = 10, y1 = 5, z1 = 10;
				var x2 = 10, y2 = 9, z2 = 5;
				var x3 = 10, y3 = 9, z3 = 0;				
				
				extrudePath = new THREE.QuadraticBezierCurve3(
					new THREE.Vector3( x1, y1, z1 ),
					new THREE.Vector3( x2, y2, z2 ),
					new THREE.Vector3( x3, y3, z3 )
				);	
				amount = 30;
			}
			
			var options = {
				curveSegments: 100,
				steps: 100,
				amount: amount,
				bevelEnabled: false,
				extrudePath: extrudePath,
			};	
		  	geon.solid = this.createMesh(new THREE.ExtrudeGeometry(shape, options), geon.metric);
		}
		else if (geon.geonType.crossSectionChange === 1) // a cone or a pyramid
		{
			if (geon.geonType.axisType === 0)
			{
				if (geon.geonType.crossSectionType === 0)
				{
					if (geon.geonType.symmetry === 2)
					{
						geon.metric.rotationX = (2 * Math.PI) / 4;
						geon.solid = this.createMesh(new THREE.CylinderGeometry(0, 15, 20, 4), geon.metric);
					}
					else if (geon.geonType.symmetry === 1)
					{
						// TODO
						// pirammida o prostokątnej podstawie
						console.log("Not supported geon type: axisType " + geon.geonType.axisType + " crossSectionChange " + geon.geonType.crossSectionChange + " symmetry " + geon.geonType.symmetry + " crossSectionType " + geon.geonType.crossSectionType);
					}
				}
				else if (geon.geonType.crossSectionType === 1)
				{
					if (geon.geonType.symmetry === 2)
					{
						geon.metric.rotationX = (2 * Math.PI) / 4;
						geon.solid = this.createMesh(new THREE.CylinderGeometry(0, 10, 40, 50, 50, false), geon.metric);
					}
					else
					{
						console.log("Not supported geon type: axisType " + geon.geonType.axisType + " crossSectionChange " + geon.geonType.crossSectionChange + " symmetry " + geon.geonType.symmetry + " crossSectionType " + geon.geonType.crossSectionType);
					}
				}
			}
			else if (geon.geonType.axisType === 1)
			{
				console.log("Not supported geon type: axisType " + geon.geonType.axisType + " crossSectionChange " + geon.geonType.crossSectionChange + " symmetry " + geon.geonType.symmetry + " crossSectionType " + geon.geonType.crossSectionType);
			}
		}
		else if (geon.geonType.crossSectionChange === 2)
		{
			if (geon.geonType.axisType === 0 && geon.geonType.symmetry === 2 && geon.geonType.crossSectionType === 1)
			{
				// TODO
				// jajko
			}
			else
			{
				console.log("Not supported geon type: axisType " + geon.geonType.axisType + " crossSectionChange " + geon.geonType.crossSectionChange + " symmetry " + geon.geonType.symmetry + " crossSectionType " + geon.geonType.crossSectionType);
			}			
		}
	},
	
	isInRelation: (geon, agent) =>
	{
		for (var j = 0; j < agent.relations.length; j++)
		{
			for (var k = 0; k < agent.relations[j].geons.length; k++)
			{
				if (agent.relations[j].geons[k] === geon)
				{
					return true;
				}
			}
		}
		return false;
	},

	findAvailableGeons: () =>
	{
		var availableGeons = new Array();
		for (var i = 0; i < this.geons.length; i++)
		{
			if (!this.isInRelation(this.geons[i], this.verticalSymmetryAgent) &&
			    !this.isInRelation(this.geons[i], this.alignmentAgent))
			{
				availableGeons.push(this.geons[i]);
			}
		}
		return availableGeons;
	},	
	
	addModifiedGeon: (geon) =>
	{
		this.drawGeon(geon);
		this.geons.push(geon);
	},
	
	addGeon: (agent) =>
	{
		var newGeons = agent.add(this.complexityAgent.getAllowedGeonTypes());
		for(var i = 0; i < newGeons.length; i++)
		{
			this.drawGeon(newGeons[i]);
			this.geons.push(newGeons[i]);
			this.complexityAgent.addGeonType(newGeons[i].geonType);
		}
		return newGeons;
	},
	
	addByComplexityAgent: () =>
	{
		return this.addGeon(this.complexityAgent);
	},
	
	addByVerticalSymmetryAgent: () =>
	{
		return this.addGeon(this.verticalSymmetryAgent);
	},

	addByAlignmentAgent: () =>
	{
		return this.addGeon(this.alignmentAgent);
	},
	
	modify: (agent, availableGeons) =>
	{
		return agent.modify(availableGeons);
	},
	
	modifyByAlignmentAgent: () =>
	{
		return this.modify(this.alignmentAgent, this.findAvailableGeons());
	},

	addUserGeon: function(geonTypeIndex)
	{
		var geonType = this.complexityAgent.allGeonTypes[geonTypeIndex];
		
		var metric = new Metric();
		metric.translationX = 0;
		metric.translationY = 0;
		metric.translationZ = 0;
		metric.scaleX = 1;
		metric.scaleY = metric.scaleX;
		metric.scaleZ = metric.scaleX;		
		metric.rotationZ = 0;	
		
		var geon = new Geon(geonType);
		geon.metric = metric;	

		this.drawGeon(geon);
		return geon;
	},

	clearAll: () =>
	{
		this.geons = new Array();
		this.complexityAgent.clear();
		this.verticalSymmetryAgent.clear();
		this.alignmentAgent.clear();
	}
}
