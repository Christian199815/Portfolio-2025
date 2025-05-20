export function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) console.warn(`Element with selector "${selector}" not found`);
    return element;
}

export function getAllElement(selector) {
    const element = document.querySelectorAll(selector);
    if (!element) console.warn(`Elements with selector "${selector}" not found`);
    return element;
}
