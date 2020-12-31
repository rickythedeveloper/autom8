import { ipcRenderer } from "electron";
import { Scheme } from "./models";

// render schemes once we get the schemes data
ipcRenderer.on("requestSchemes-reply", (event, schemes: { [id: string]: Scheme }) => {
	for (const schemeID in schemes) {
		const scheme = schemes[schemeID];
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
