function ComplexityAgent()
{
	this.allGeonTypes = new Array();
	
	// extrude cross section
	
	// straight axis
	this.allGeonTypes.push(new GeonType(0, 0, 0, 0)); // irregular polygon
	this.allGeonTypes.push(new GeonType(0, 0, 1, 0)); // irregular curved shape // TODO wywala się
	this.allGeonTypes.push(new GeonType(0, 1, 0, 0)); // rectangle
	this.allGeonTypes.push(new GeonType(0, 1, 1, 0)); // ellipse
	this.allGeonTypes.push(new GeonType(0, 2, 0, 0)); // square: index = 4 -> cube
	this.allGeonTypes.push(new GeonType(0, 2, 1, 0)); // circle: index = 5
	
	// curved axis	
	this.allGeonTypes.push(new GeonType(1, 0, 0, 0)); // irregular polygon
	this.allGeonTypes.push(new GeonType(1, 0, 1, 0)); // irregular curved shape // TODO wywala się
	this.allGeonTypes.push(new GeonType(1, 1, 0, 0)); // rectangle
	this.allGeonTypes.push(new GeonType(1, 1, 1, 0)); // ellipse
	this.allGeonTypes.push(new GeonType(1, 2, 0, 0)); // square
	this.allGeonTypes.push(new GeonType(1, 2, 1, 0)); // circle	
	
	// pyramid
	this.allGeonTypes.push(new GeonType(0, 2, 0, 1)); // square  // TODO leży
	
	// cone
	this.allGeonTypes.push(new GeonType(0, 2, 1, 1)); // circle // TODO leży
	
	this.usedGeonTypes = new Array();
	
	this.geonTypesLimit = 2;	
	this.geonTypesLimitBottom = 1;
	this.geonTypesLimitTop = 10;
}

ComplexityAgent.prototype = 
{	
	constructor: ComplexityAgent,
	
	add: function(allowedGeonTypes)
	{
		var geonType = allowedGeonTypes[Tools.getRandomInt(0, allowedGeonTypes.length - 1)];

		var metric = new Metric();
		metric.translationX = Tools.getRandomInt(-10, 5);
		metric.translationY = Tools.getRandomInt(-10, 5);
		metric.translationZ = 0;
		metric.scaleX = Math.random() + 0.5;
		metric.scaleY = metric.scaleX;
		metric.scaleZ = metric.scaleX;		
		metric.rotationZ = 2 * Math.PI / Tools.getRandomInt(1, 10);	
		
		var geon = new Geon(geonType);
		geon.metric = metric;
		
		// var geons = new Array();
		// geons.push(geon);
		
		return [geon];
	},
	
	setGeonTypesLimit: function(limitStr)
	{
		var limit = parseInt(limitStr);
		if (!Number.isInteger(limit))
		{
			alert('Not a number!');
		}
		else if (limit < this.geonTypesLimitBottom || limit > this.geonTypesLimitTop)
		{
			alert('Wrong value!');
		}
		else
		{
			this.geonTypesLimit = limit;
		}
	},
	
	getAllowedGeonTypes: function()
	{
		if (this.usedGeonTypes.length < this.geonTypesLimit)
		{
			return this.allGeonTypes;
		}
		else
		{
			return this.usedGeonTypes;
		}
	},
	
	addGeonType: function(geonType)
	{
		if(!Tools.arrayContains(this.usedGeonTypes, geonType))
		{
			this.usedGeonTypes.push(geonType);
		}
	},
	
	clear: function()
	{
		this.usedGeonTypes = new Array();
	}
}