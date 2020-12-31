import { ipcRenderer } from "electron";
import { Scheme } from "./models";

// render schemes once we get the schemes data
ipcRenderer.on("requestSchemes-reply", (event, schemes: Scheme[]) => {
	for (const scheme of schemes) {
		renderScheme(scheme);
	}
});

// fetch schemes
ipcRenderer.send("requestSchemes", null);

function renderScheme(scheme: Scheme) {
	var btn = document.createElement("input");
	btn.type = "button";
	btn.value = scheme.data.schemeName;
	document.body.appendChild(btn);
	btn.addEventListener("click", function () {
		editScheme(scheme.data.id);
	});
}

function editScheme(schemeID: string) {
	ipcRenderer.send("editScheme", schemeID);
}
