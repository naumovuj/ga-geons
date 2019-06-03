function Geon(geonType) {
	this.geonType = geonType;
	this.metric; // coordinates, scale and rotation
	this.solid; // Mesh object
}

Geon.prototype = { constructor: Geon }
