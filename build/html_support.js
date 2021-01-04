"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttribute = exports.getElementById = exports.insertChild = exports.insertBefore = exports.insertAfter = void 0;
/**
 * Inserts the newNode after the referenceNode in the html.
 * @param referenceNode
 * @param newNode
 */
function insertAfter(referenceNode, newNode) {
    if (!referenceNode.parentNode) {
        throw Error("Could not insert a new node after a reference node because the parentNode does not exist");
    }
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
exports.insertAfter = insertAfter;
function insertBefore(referenceNode, newNode) {
    if (referenceNode.parentNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }
    else {
        throw Error("Could not insert a new node before a reference node because the parent node was not found.");
    }
}
exports.insertBefore = insertBefore;
function insertChild(childNode, parentNode, index) {
    parentNode.insertBefore(childNode, parentNode.children[index]);
}
exports.insertChild = insertChild;
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
