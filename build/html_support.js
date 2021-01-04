"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttribute = exports.getElementById = void 0;
/**
 * Gets the element by ID and throws an error if not found.
 * @param id Element ID
 */
function getElementById(id) {
    var elem = document.getElementById(id);
    if (!elem) {
        throw Error("Element not found");
    }
    return elem;
}
exports.getElementById = getElementById;
/**
 * Gets a specified attribute of the given element
 * @param element
 * @param attribute
 */
function getAttribute(element, attribute) {
    var attr = element.getAttribute(attribute);
    if (attr) {
        return attr;
    }
    throw Error("Could not get attribute: " + attribute);
}
exports.getAttribute = getAttribute;
