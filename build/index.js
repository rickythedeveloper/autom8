"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// render schemes once we get the schemes data
electron_1.ipcRenderer.on("requestSchemes-reply", function (event, schemes) {
    for (var schemeID in schemes) {
        var scheme = schemes[schemeID];
        renderScheme(scheme);
    }
});
// fetch schemes
electron_1.ipcRenderer.send("requestSchemes", null);
function renderScheme(scheme) {
    var btn = document.createElement("input");
    btn.type = "button";
    btn.value = scheme.data.schemeName;
    document.body.appendChild(btn);
    btn.addEventListener("click", function () {
        editScheme(scheme.data.id);
    });
}
function editScheme(schemeID) {
    electron_1.ipcRenderer.send("editScheme", schemeID);
}
