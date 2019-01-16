function AlignmentAgent ()
{
	this.relations = new Array();
	this.axesLimit = 1;
}

AlignmentAgent.prototype = 
{	
	constructor: AlignmentAgent,
	
	add: function(allowedGeonTypes)
	{
   		var geons = new Array();		
		var axis;
		if (this.relations.length < this.axesLimit)
		{
			axis = Tools.getRandomInt(-10, 10);
		}
		else
		{
			axis = this.relations[Tools.getRandomInt(0, this.relations.length - 1)].axis;
		}
		var scale = 0.6;
		var geonsNo = Tools.getRandomInt(2, 3);
		
		for (var i = 0; i < geonsNo; i++)
		{	
			var geonType = allowedGeonTypes[Tools.getRandomInt(0, allowedGeonTypes.length - 1)];

			var metric = new Metric();
			metric.translationX = axis;
			metric.translationY = Tools.getRandomInt(-40, 20);
			metric.translationZ = 0;
			metric.scaleX = scale;
			metric.scaleY = metric.scaleX;
			metric.scaleZ = metric.scaleX;
			metric.rotationZ = 0;//(2 * Math.PI) / Tools.getRandomInt(1, 10);
			
			var geon = new Geon(geonType);
			geon.metric = metric;
			geons.push(geon);
		}
		
		var added = false;
		for (var i = 0; i < this.relations.length; i++)
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
		var geonsPair = new Array();
		
		if (this.relations.length > 0 && geons.length > 0)
		{
			var relation = this.relations[Tools.getRandomInt(0, this.relations.length - 1)];
			var geonToModify = geons[Tools.getRandomInt(0, geons.length - 1)];
			var newGeon = new Geon(geonToModify.geonType);
			newGeon.metric = relation.geons[0].metric;
			newGeon.metric.translationY = Tools.getRandomInt(-40, 20);
			
			geonsPair.push(geonToModify);
			geonsPair.push(newGeon);
			
			relation.geons.push(newGeon);
		}
		return geonsPair;
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