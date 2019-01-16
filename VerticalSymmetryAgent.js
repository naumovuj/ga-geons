function VerticalSymmetryAgent()
{
	this.relations = new Array();
	this.axesLimit = 1;
}

VerticalSymmetryAgent.prototype = 
{	
	constructor: VerticalSymmetryAgent,
	
	add: function(allowedGeonTypes)
	{
   		var geons = new Array();
		
		var axis;
		if(this.relations.length < this.axesLimit)
		{
			axis = Tools.getRandomInt(-10, 1);
		}
		else
		{
			axis = this.relations[Tools.getRandomInt(0, this.relations.length - 1)].axis;
		}
		
		var geonType = allowedGeonTypes[Tools.getRandomInt(0, allowedGeonTypes.length - 1)];
		var distance = Tools.getRandomInt(-10, 5);

		var metric1 = new Metric();
		metric1.translationX = axis - distance;//axis - Tools.getRandomInt(-10, 5);
		metric1.translationY = 0;//Tools.getRandomInt(-10, 5);
		metric1.translationZ = 0;
		metric1.scaleX = Math.random();
		metric1.scaleY = metric1.scaleX;
		metric1.scaleZ = metric1.scaleX;
		metric1.rotationZ = 0;//(2 * Math.PI) / Tools.getRandomInt(1, 10);
		
		var geon1 = new Geon(geonType);
		geon1.metric = metric1;
		geons.push(geon1);
		
		var metric2 = new Metric();
		metric2.translationX = axis + distance;//2 * axis - metric1.translationX;
		metric2.translationY = metric1.translationY;
		metric2.translationZ = metric1.translationZ;
		metric2.scaleX = metric1.scaleX;
		metric2.scaleY = metric1.scaleY;
		metric2.scaleZ = metric1.scaleZ;
		metric2.rotationZ = -1 * metric1.rotationZ;
		
		var geon2 = new Geon(geonType);
		geon2.metric = metric2;
		geons.push(geon2);
		
		var added = false;
		for(var i = 0; i < this.relations.length; i ++)
		{
			if (this.relations[i].axis === axis)
			{
				this.relations[i].geons = this.relations[i].geons.concat(geons);
			}
		}
		if (!added)
		{
			var relation = new Relation(axis);
			relation.geons = geons;
			this.relations.push(relation);
		}
		
		return geons;
	},	
	
	modify: function(geons)
	{
		// TODO
	},
	
	// Allow modification for not ordered geons only
	isModificationAllowed: function(geon)
	{
		// TODO
	},
	
	clear: function()
	{
		this.relations = new Array();
	}	
}