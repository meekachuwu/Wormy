window.WormConfiguration = null;

window.loadWormConfiguration = async function() {
	if (window.WormConfiguration) {
		return window.WormConfiguration;
	}

	var response = await fetch("Assets/config.yaml", { cache: "no-cache" });
	if (!response.ok) {
		throw new Error("Unable to load YAML configuration");
	}

	var yamlText = await response.text();
	window.WormConfiguration = jsyaml.load(yamlText);
	return window.WormConfiguration;
};
