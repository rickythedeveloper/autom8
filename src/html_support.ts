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

export { getElementById, getAttribute };
