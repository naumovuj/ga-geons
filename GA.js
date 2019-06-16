function GA() {
    // GA parameters
    this.PopulationSize = 200;
    this.GenerationsNumber = 100;
    this.GenesNumber = 2000;
    this.MutationProbability = 0.01;
	this.CrossoverProbability = 0.25;
    this.WinnersRate = 0.2;
    // shape representation
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

        for (var i = 0; i < this.GenesNumber; i++) {
            var newCodeElement = {
                objectIndex: Math.random() * this.objects.length |0,
                neighborIndex: Math.random() * 6 |0
            };
            code.push(newCodeElement);
            this.tryNewObject(newCodeElement);
        }

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
                newX += 1; break;
            case 1: // left
                newY += 1; break;
            case 2: // behind
                newX -= 1; break;
            case 3: // right
                newY -= 1; break;
            case 4: // top
                newZ += 1; break;
            case 5: // bottom
                newZ -= 1; break;
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
        // checks if there's space to locate the object

        var x = objectToCheck.x;
        var y = objectToCheck.y;
        var z = objectToCheck.z;

        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].x == x &&
                this.objects[i].y == y &&
                this.objects[i].z == z)
                return false;
        }
        return true;
    },

    retrieveObjects: function(code) {
        // retrieves geons from the code

        this.objects = [this.INITIAL_OBJECT];
        for (var i = 0; i < code.length; i++) {
            // the object index can be greater than the current objects number
            // due to mutation or replication of the code
            if (code[i].objectIndex < this.objects.length) this.tryNewObject(code[i]);
        }

        // deep copying
        var objs = [];
        for (var i = 0; i < this.objects.length; i++)
            objs.push({
                geonTypeIndex: this.objects[i].geonTypeIndex,
                x: this.objects[i].x,
                y: this.objects[i].y,
                z: this.objects[i].z    
            });
        return objs;
    },

    getOffspring: function(parent1, parent2) {
        var offspring = [];
        var crossPoint = Math.random() < this.CrossoverProbability ?
                         this.GenesNumber * Math.random() |0 : this.GenesNumber;
        
        // console.log(crossPoint);
        
        // deep copying the parents code
        // first parent
        for (var i = 0; i < crossPoint; i++) {
            offspring.push({ objectIndex: parent1[i].objectIndex,
                             neighborIndex: parent1[i].neighborIndex });
        }
        // second parent
        for (var i = crossPoint; i < this.GenesNumber; i++) {
            offspring.push({ objectIndex: parent2[i].objectIndex,
                             neighborIndex: parent2[i].neighborIndex });
        }
        
        return offspring;
    },

    mutate: function(code) {
        for (var i = 0; i < this.GenesNumber; i++)
            if (Math.random() < this.MutationProbability) {
                // console.log("Before mutation: " + code[i].neighborIndex + ", " + code[i].objectIndex);
                // choose randomly another object index
                code[i].objectIndex = Math.random() * i |0;
                // choose randomly another neighbor index
                code[i].neighborIndex = Math.random() * 6 |0;
                // console.log("After mutation: " + code[i].neighborIndex + ", " + code[i].objectIndex);
            }
    },

    fitness: function(code) {
        this.retrieveObjects(code);
        
        // #1 objects number -> max
        // return this.objects.length / this.GenesNumber;

        // #2 the shape length -> max
        // var minX = this.objects[0].x, maxX = this.objects[0].x;
        // var minY = this.objects[0].y, maxY = this.objects[0].y;
        // var minZ = this.objects[0].z, maxZ = this.objects[0].z;
        // for (var i = 1; i < this.objects.length; i++) {
        //     if (this.objects[i].x < minX) minX = this.objects[i].x;
        //     if (this.objects[i].x > maxX) maxX = this.objects[i].x;
        //     if (this.objects[i].y < minY) minY = this.objects[i].y;
        //     if (this.objects[i].y > maxY) maxY = this.objects[i].y;
        //     if (this.objects[i].z < minZ) minZ = this.objects[i].z;
        //     if (this.objects[i].z > maxZ) maxZ = this.objects[i].z;
        // }
        // return  Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 500.0;

        // #3 symmetry
        var subspace1 = 0; // x > 0, y > 0, z > 0
        var subspace2 = 0; // x > 0, y > 0, z < 0
        var subspace3 = 0; // x > 0, y < 0, z > 0
        var subspace4 = 0; // x > 0, y < 0, z < 0
        var subspace5 = 0; // x < 0, y > 0, z > 0
        var subspace6 = 0; // x < 0, y > 0, z < 0
        var subspace7 = 0; // x < 0, y < 0, z > 0
        var subspace8 = 0; // x < 0, y < 0, z < 0
        for (var i = 1; i < this.objects.length; i++) {
            if (this.objects[i].x > 0 && this.objects[i].y > 0 && this.objects[i].z > 0) subspace1++;
            if (this.objects[i].x > 0 && this.objects[i].y > 0 && this.objects[i].z < 0) subspace2++;
            if (this.objects[i].x > 0 && this.objects[i].y < 0 && this.objects[i].z > 0) subspace3++;
            if (this.objects[i].x > 0 && this.objects[i].y < 0 && this.objects[i].z < 0) subspace4++;
            if (this.objects[i].x < 0 && this.objects[i].y > 0 && this.objects[i].z > 0) subspace5++;
            if (this.objects[i].x < 0 && this.objects[i].y > 0 && this.objects[i].z < 0) subspace6++;
            if (this.objects[i].x < 0 && this.objects[i].y < 0 && this.objects[i].z > 0) subspace7++;
            if (this.objects[i].x < 0 && this.objects[i].y < 0 && this.objects[i].z < 0) subspace8++;
        }

        // console.log(subspace1 + ", " + subspace8 + ", " + subspace2 + ", " + subspace7 + ", " + 
        //             subspace3 + ", " + subspace6 + ", " + subspace4 + ", " + subspace5);

        return -(Math.abs(subspace1 - subspace8) + Math.abs(subspace2 - subspace7) +
               Math.abs(subspace3 - subspace6) + Math.abs(subspace4 - subspace5));
    
    },

    evolve: function() {

        function compare(chromosome1, chromosome2) {
            return (chromosome1.estimation < chromosome2.estimation) ? 1 :
                   ((chromosome2.estimation < chromosome1.estimation) ? -1 : 0);
         }
         
        var winners = [];
        var survivorsNumber = this.PopulationSize * this.WinnersRate |0;

        // create initial population
        var population = [];
        for (var i = 0; i < this.PopulationSize; i++) {
            var code = this.generateCode();
            population.push({ code: code,
                              estimation: this.fitness(code) });
        }
        population.sort(compare);
        
        console.log("Initial generation: " + population[0].estimation);

        for (var i = 0; i < this.GenerationsNumber; i++) {
            var survivors = population.slice(0, survivorsNumber);
            population = survivors;
            while (population.length < this.PopulationSize) {
                // crossover
                var offspring = this.getOffspring(survivors[Math.random() * survivorsNumber |0].code,
                                                  survivors[Math.random() * survivorsNumber |0].code);
                // mutation
                this.mutate(offspring);
                // add new organism
                population.push({ code: offspring,
                                  estimation: this.fitness(offspring) });
            }
            population.sort(compare);
            winners.push(population[0].estimation);
        }

        console.log(winners);

        return population[0].code;
    }
}