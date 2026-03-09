"use strict";

class Data {
	constructor(value = null) {
		this.value = value;
		this.type = this.gettype(value);
	}

	gettype(value) {
		switch (true) {
			case Array.isArray(value):
				return "array";
			case value === null:
				return "null";
			default:
				return typeof value;
		}
	}
}

class Type extends Data {
	constructor(value = null) {
		super(value);
	}
}

class File extends Type {
	constructor(value = null) {
		super(value);
	}

	async load(path) {
		if (!path || typeof path !== "string") {
			throw new Error("A valid file path is required.");
		}

		const response = await fetch(path, { cache: "no-cache" });
		if (!response.ok) {
			throw new Error("Failed to load file: " + path + " (" + response.status + ")");
		}

		const text = await response.text();
		switch (true) {
			case typeof window !== "undefined" && !!window.jsyaml && typeof window.jsyaml.load === "function":
				return window.jsyaml.load(text);
			case typeof window !== "undefined" && !!window.YAML && typeof window.YAML.parse === "function":
				return window.YAML.parse(text);
			default:
				return this.parseyaml(text);
		}
	}

	parseyaml(text) {
		const root = {};
		const stack = [{ indent: -1, node: root }];
		const lines = text.split(/\r?\n/);

		for (let index = 0; index < lines.length; index++) {
			const raw = lines[index];
			if (!raw) {
				continue;
			}

			const content = raw.split("#")[0].trimEnd();
			if (!content.trim()) {
				continue;
			}

			const indent = raw.length - raw.replace(/^\s+/, "").length;
			while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
				stack.pop();
			}

			const pair = content.trim();
			const marker = pair.indexOf(":");
			if (marker === -1) {
				continue;
			}

			const key = pair.slice(0, marker).trim();
			const value = pair.slice(marker + 1).trim();
			const node = stack[stack.length - 1].node;

			if (value === "") {
				node[key] = {};
				stack.push({ indent: indent, node: node[key] });
				continue;
			}

			node[key] = this.parsevalue(value);
		}

		return root;
	}

	parsevalue(value) {
		switch (value) {
			case "true":
				return true;
			case "false":
				return false;
			case "null":
			case "~":
				return null;
			default:
				break;
		}

		if (/^-?\d+(\.\d+)?$/.test(value)) {
			return Number(value);
		}

		if (/^\[.*\]$/.test(value) || /^\{.*\}$/.test(value)) {
			try {
				return window.jsyaml ? window.jsyaml.load(value) : JSON.parse(value.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":'));
			} catch (_error) {
				return value;
			}
		}

		if ((value[0] === '"' && value[value.length - 1] === '"') || (value[0] === "'" && value[value.length - 1] === "'")) {
			return value.slice(1, -1);
		}

		return value;
	}
}

class Vector extends Type {
	constructor(...input) {
		super([]);
		this.value = input.map((item) => {
			const number = Number(item);
			return Number.isFinite(number) ? number : 0;
		});
		this.type = "vector";
		this.sync();
	}

	sync() {
		this.length = this.value.length;
		for (let index = 0; index < this.value.length; index++) {
			this[index] = this.value[index];
		}
	}

	apply(...vector) {
		for (let vectorindex = 0; vectorindex < vector.length; vectorindex++) {
			if (!(vector[vectorindex] instanceof Vector)) {
				continue;
			}

			const source = vector[vectorindex].value;
			const length = Math.max(this.value.length, source.length);
			for (let index = 0; index < length; index++) {
				const left = Number.isFinite(this.value[index]) ? this.value[index] : 0;
				const right = Number.isFinite(source[index]) ? source[index] : 0;
				this.value[index] = left + right;
			}
		}

		this.sync();
		return this;
	}

	clone() {
		return new Vector(...this.value);
	}
}

class Position extends Vector {
	constructor(x = 0, y = 0, z = 0) {
		super(x, y, z);
		this.type = "position";
		this.alias("x", 0);
		this.alias("horizontal", 0);
		this.alias("y", 1);
		this.alias("vertical", 1);
		this.alias("z", 2);
		this.alias("depth", 2);
	}

	alias(name, index) {
		Object.defineProperty(this, name, {
			get: () => this.value[index],
			set: (entry) => {
				const number = Number(entry);
				this.value[index] = Number.isFinite(number) ? number : 0;
				this[index] = this.value[index];
			},
			enumerable: true,
			configurable: true
		});
	}
}

class Color extends Type {
	constructor(value = "black") {
		super(value);
		this.value = [0, 0, 0];
		this.type = "color";
		this.alias("r", 0);
		this.alias("red", 0);
		this.alias("g", 1);
		this.alias("green", 1);
		this.alias("b", 2);
		this.alias("blue", 2);
		this.set(value);
	}

	alias(name, index) {
		Object.defineProperty(this, name, {
			get: () => this.value[index],
			set: (entry) => {
				const number = Number(entry);
				const channel = Number.isFinite(number) ? number : 0;
				this.value[index] = Math.max(0, Math.min(255, Math.round(channel)));
			},
			enumerable: true,
			configurable: true
		});
	}

	set(entry) {
		switch (true) {
			case typeof entry === "string":
				this.setstring(entry);
				return this;
			case Array.isArray(entry):
				this.r = entry[0] ?? 0;
				this.g = entry[1] ?? 0;
				this.b = entry[2] ?? 0;
				return this;
			case !!entry && typeof entry === "object":
				this.r = entry.r ?? entry.red ?? 0;
				this.g = entry.g ?? entry.green ?? 0;
				this.b = entry.b ?? entry.blue ?? 0;
				return this;
			default:
				this.r = 0;
				this.g = 0;
				this.b = 0;
				return this;
		}
	}

	setstring(entry) {
		const named = {
			black: "#000000",
			white: "#ffffff",
			red: "#ff0000",
			green: "#00ff00",
			blue: "#0000ff",
			yellow: "#ffff00",
			cyan: "#00ffff",
			magenta: "#ff00ff",
			crimson: "#dc143c"
		};

		let text = entry.trim().toLowerCase();
		if (named[text]) {
			text = named[text];
		}

		switch (true) {
			case /^#[0-9a-f]{3}$/i.test(text):
				this.r = parseInt(text[1] + text[1], 16);
				this.g = parseInt(text[2] + text[2], 16);
				this.b = parseInt(text[3] + text[3], 16);
				return;
			case /^#[0-9a-f]{6}$/i.test(text):
				this.r = parseInt(text.slice(1, 3), 16);
				this.g = parseInt(text.slice(3, 5), 16);
				this.b = parseInt(text.slice(5, 7), 16);
				return;
			default:
				break;
		}

		const match = text.match(/^rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)$/);
		if (match) {
			this.r = Number(match[1]);
			this.g = Number(match[2]);
			this.b = Number(match[3]);
			return;
		}

		this.r = 0;
		this.g = 0;
		this.b = 0;
	}

	toString() {
		return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
	}
}

window.Data = Data;
window.Type = Type;
window.File = File;
window.Vector = Vector;
window.Position = Position;
window.Color = Color;
