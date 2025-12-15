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

/**
 * Announce a message to screen readers via live region
 * @param {string} message - The message to announce
 * @param {boolean} assertive - If true, uses assertive live region (interrupts), otherwise polite
 */
export function announceToScreenReader(message, assertive = false) {
    const announcerId = assertive ? 'sr-announcer-assertive' : 'sr-announcer';
    const announcer = document.getElementById(announcerId);
    
    if (announcer) {
        // Clear the announcer first (helps with repeated announcements)
        announcer.textContent = '';
        
        // Use setTimeout to ensure the DOM updates trigger the announcement
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
}
