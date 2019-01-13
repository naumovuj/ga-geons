/*******************************************************************************************
* int symmetry: 0 - none, 1 - vertical, 2 - vertical + rotational
* int crossSectionType: 0 - polygon, 1 - curved
* int axixType: 0 - straight, 1 - curved
* int crossSectionChange: 0 - constant, 1 - decrease, 2 - increase + decrease
*******************************************************************************************/
function GeonType (axisType, symmetry, crossSectionType, crossSectionChange)
{
	this.axisType = axisType;
	this.symmetry = symmetry;
	this.crossSectionType = crossSectionType;
	this.crossSectionChange = crossSectionChange;
}

GeonType.prototype = 
{	
	constructor: GeonType
}