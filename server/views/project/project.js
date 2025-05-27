// Accessible Color Randomizer
const AccessibleColorRandomizer = {
    // Enhanced palette with both light and dark colors
    defaultPalette: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9800', '#9C27B0',
        '#2E7D32', '#1565C0', '#B71C1C', '#4A148C', '#E65100',
        '#1B5E20', '#0D47A1', '#880E4F', '#311B92'
    ],
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },
    
    getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1.r, color1.g, color1.b);
        const lum2 = this.getLuminance(color2.r, color2.g, color2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    },
    
    getBestTextColor(backgroundColor, aaLevel = 'AAA') {
        const bgColor = this.hexToRgb(backgroundColor);
        const white = { r: 255, g: 255, b: 255 };
        const black = { r: 0, g: 0, b: 0 };
        
        const whiteContrast = this.getContrastRatio(bgColor, white);
        const blackContrast = this.getContrastRatio(bgColor, black);
        
        const requiredRatio = aaLevel === 'AAA' ? 7 : 4.5;
        
        if (whiteContrast >= requiredRatio) {
            return 'white';
        } else if (blackContrast >= requiredRatio) {
            return 'black';
        } else {
            // Fallback to better contrast even if not meeting standard
            return whiteContrast > blackContrast ? 'white' : 'black';
        }
    },
    
    applyToElements(selector, palette = this.defaultPalette, aaLevel = 'AAA') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const backgroundColor = palette[Math.floor(Math.random() * palette.length)];
            const textColor = this.getBestTextColor(backgroundColor, aaLevel);
            
            element.style.backgroundColor = backgroundColor;
            element.style.color = textColor;
        });
    },
    
    // Ensure no adjacent elements have the same color
    applyWithoutAdjacent(selector, palette = this.defaultPalette, aaLevel = 'AAA') {
        const elements = document.querySelectorAll(selector);
        let lastColor = null;
        
        elements.forEach(element => {
            let newColor;
            do {
                newColor = palette[Math.floor(Math.random() * palette.length)];
            } while (newColor === lastColor && palette.length > 1);
            
            const textColor = this.getBestTextColor(newColor, aaLevel);
            
            element.style.backgroundColor = newColor;
            element.style.color = textColor;
            lastColor = newColor;
        });
    }
};

// Usage
document.addEventListener('DOMContentLoaded', function() {
    // Apply AAA compliant random colors
    AccessibleColorRandomizer.applyToElements('#project-info div ul li');
    
    // Or with AA standard (less strict)
    // AccessibleColorRandomizer.applyToElements('#expertises-section ul li', AccessibleColorRandomizer.defaultPalette, 'AA');
    
    // Or without adjacent duplicates
    // AccessibleColorRandomizer.applyWithoutAdjacent('#expertises-section ul li');
});