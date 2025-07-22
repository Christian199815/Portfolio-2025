import { getElement } from "../../../client/document";

class SettingsMenu {
    constructor() {
        this.trigger = getElement('[data-settings-trigger]');
        this.menu = getElement('[data-settings-menu]');
        this.closeButton = getElement('[data-settings-close]');
        this.themeLabel = getElement('[data-theme-label]');
        
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.trigger || !this.menu || !this.closeButton) return;
        
        // Bind event listeners
        this.trigger.addEventListener('click', () => this.openMenu());
        this.closeButton.addEventListener('click', () => this.closeMenu());
        
        // Auto-close when buttons are clicked inside the menu
        this.menu.addEventListener('click', (e) => {
            // Find the closest button element (handles nested elements like SVGs)
            const clickedButton = e.target.closest('button');
            
            // Check if a button was clicked and it's not the close button
            if (clickedButton && clickedButton !== this.closeButton) {
                // Small delay to allow the button action to complete
                setTimeout(() => this.closeMenu(), 150);
            }
        });
        
        // Listen for theme changes to update label
        document.addEventListener('themeChanged', (e) => {
            this.updateThemeLabel(e.detail.theme);
        });
        
        // Set initial theme label
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.updateThemeLabel(currentTheme);
        
        // ESC key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    openMenu() {
        this.isOpen = true;
        this.menu.classList.add('open');
        
        // Focus management
        this.closeButton.focus();
    }

    closeMenu() {
        this.isOpen = false;
        this.menu.classList.remove('open');
        
        // Return focus to trigger
        this.trigger.focus();
    }

    updateThemeLabel(theme) {
        if (this.themeLabel) {
            this.themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }
}

// Initialize settings menu when DOM is ready
function initializeSettingsMenu() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => new SettingsMenu(), 100);
        });
    } else {
        setTimeout(() => new SettingsMenu(), 100);
    }
}

initializeSettingsMenu();