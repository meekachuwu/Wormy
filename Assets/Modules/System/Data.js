class Data {
}

class Type {	// Extend Data for Custom Data Types

}

class File {	// Extend Type
	load(path) {}	// Read file (yaml) & return object
}

class Vector {	// Extend Type, include logic for adding vectors
	constructor (...args) {	// Each argument defaults to 0
		this["values"] = args;
		this["length"] = args.length;
		args.forEach((value, index) => { this[index] = value; });
	}

	apply() {	// Add vectors togethor

	}
}

class Position extends Vector {	// Create a vector with x,y,z properties
	constructor (x, y, z) {
		super(x, y, z);	// Properties have multiple aliasas, x/horizontal,y/vertical,z/depth 
	}
}

class Color {	// Create a vector with r,g,b properties, accept string as single argument for color name or hex & convert to rgb values
	constructor (value) {	
		// convert string to rgb value
		this["red"] = this["r"] = 0;	// Properties have multiple aliasas, r/red,g/green,b/blue

	}

	toString() {
		if (this.type === 'string') return this.value;
		return `rgb(${this["r"]}, ${this{"g"}}, ${this["b"]})`;
	}
}