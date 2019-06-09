function GA() {
    this.PopulationSize = 100;
    this.GenerationsNumber = 100;
    this.GenesNumber = 10000;
    this.MutationProbability = 0.01;
	this.CrossoverProbability = 0.25;
    this.WinnersRate = 0.2;
    this.objects = new Array(),
    this.INITIAL_OBJECT = {
        geonTypeIndex: 4, // cube shape
        x: 0,
        y: 0,
        z: 0
    }
}

GA.prototype = {
    constructor: GA(),

    // generate random code
    generateCode: function() {

        this.objects = [this.INITIAL_OBJECT];
        // the code is an array of steps
        // one step = { index of the element selected for production,
        // 				index of the side where a new element is being added }
        var code = [];

        for (var i = 0; i < this.GenesNumber - 1; i++) {

            var newCodeElement = {
                objectIndex: Math.random() * this.objects.length |0,
                neighborIndex: Math.random() * 6 |0
            };
            code.push(newCodeElement);
            this.tryNewObject(newCodeElement);
        }

        //console.log(this.objects);
        return code;
    },

    tryNewObject: function(codeElement) {
        // tries to add a new object and returns true if it was added,
        // otherwise - returns false

        // coordinated of the new object
        var newX = this.objects[codeElement.objectIndex].x;
        var newY = this.objects[codeElement.objectIndex].y;
        var newZ = this.objects[codeElement.objectIndex].z;

        // define coordinates
        switch(codeElement.neighborIndex) {
            case 0: // front
                newX += 1;
                break;
            case 1: // left
                newY += 1;
                break;
            case 2: // behind
                newX -= 1;
                break;
            case 3: // right
                newY -= 1;
                break;
            case 4: // top
                newZ += 1;
                break;
            case 5: // bottom
                newZ -= 1;
                break;
        }

        var newObject = {
            geonTypeIndex: this.INITIAL_OBJECT.geonTypeIndex,
            x: newX,
            y: newY,
            z: newZ
        };

        // check if there's place to add the new object
        if (this.isPlace(newObject)) { 
            this.objects.push(newObject);
        }
    },

    isPlace: function(objectToCheck) {
        var x = objectToCheck.x;
        var y = objectToCheck.y;
        var z = objectToCheck.z;

        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].x == x && this.objects[i].y == y && this.objects[i].z == z)
                return false;
        }
        return true;
    },

    retrieveObjects: function(code) {
        this.objects = [this.INITIAL_OBJECT];
        for (var i = 0; i < code.length; i++) this.tryNewObject(code[i]);
        var objs = [];
        for (var i = 0; i < this.objects.length; i++)
            objs.push({
                geonTypeIndex: this.objects[i].geonTypeIndex,
                x: this.objects[i].x,
                y: this.objects[i].y,
                z: this.objects[i].z    
            });
        return objs;
    }

}