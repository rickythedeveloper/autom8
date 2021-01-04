/**
 * Inserts the newNode after the referenceNode in the html.
 * @param referenceNode
 * @param newNode
 */
function insertAfter(referenceNode: HTMLElement, newNode: HTMLElement) {
	if (!referenceNode.parentNode) {
		throw Error("Could not insert a new node after a reference node because the parentNode does not exist");
	}
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(referenceNode: HTMLElement, newNode: HTMLElement) {
	if (referenceNode.parentNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode);
	} else {
		throw Error("Could not insert a new node before a reference node because the parent node was not found.");
	}
}

function insertChild(childNode: HTMLElement, parentNode: HTMLElement, index: number) {
	parentNode.insertBefore(childNode, parentNode.children[index]);
}

/**
 * Gets the element by ID and throws an error if not found.
 * @param id Element ID
 */
function getElementById(id: string): HTMLElement {
	const elem = document.getElementById(id);
	if (!elem) {
		throw Error("Element not found");
	}
	return elem;
}

/**
 * Gets a specified attribute of the given element
 * @param element
 * @param attribute
 */
function getAttribute(element: HTMLElement, attribute: string): string {
	const attr = element.getAttribute(attribute);
	if (attr) {
		return attr;
	}
	throw Error("Could not get attribute: " + attribute);
}

export { insertAfter, insertBefore, insertChild, getElementById, getAttribute };
