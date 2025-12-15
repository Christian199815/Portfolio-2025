import { announceToScreenReader } from "../../../client/document";

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
    // Ensure project language pills have no JS-injected background color
    const languageItems = document.querySelectorAll('#project-languages-list li');
    languageItems.forEach(li => {
        li.style.backgroundColor = 'transparent';
        li.style.color = '';
    });

    // Initialise progress media carousels
    const carousels = document.querySelectorAll('[data-progress-carousel]');

    carousels.forEach((carousel) => {
        const track = carousel.querySelector('[data-progress-track]');
        if (!track) return;

        const items = Array.from(track.querySelectorAll('.content-item'));
        const prevBtn = carousel.querySelector('[data-progress-prev]');
        const nextBtn = carousel.querySelector('[data-progress-next]');

        if (items.length <= 1) {
            // Hide nav if only one item
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        let currentIndex = 0;

        function goToSlide(idx, announce = true) {
            // Wrap around for infinite loop
            if (idx < 0) {
                currentIndex = items.length - 1;
            } else if (idx >= items.length) {
                currentIndex = 0;
            } else {
                currentIndex = idx;
            }
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update ARIA states
            items.forEach((item, i) => {
                item.setAttribute('aria-hidden', i !== currentIndex ? 'true' : 'false');
            });
            
            // Buttons are never disabled in infinite mode
            if (prevBtn) {
                prevBtn.disabled = false;
                prevBtn.setAttribute('aria-disabled', 'false');
            }
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.setAttribute('aria-disabled', 'false');
            }
            
            // Announce current slide to screen readers
            if (announce) {
                announceToScreenReader(`Media ${currentIndex + 1} of ${items.length}`);
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex + 1);
            });
        }

        // Initial state (don't announce on page load)
        goToSlide(0, false);
    });

    // Initialize gallery carousel (true infinite loop)
    const galleryCarousels = document.querySelectorAll('[data-gallery-carousel]');

    galleryCarousels.forEach((carousel) => {
        const trackContainer = carousel.querySelector('.gallery-track-container');
        const track = carousel.querySelector('[data-gallery-track]');
        if (!track || !trackContainer) return;

        const originalCards = Array.from(track.querySelectorAll('.gallery-card'));
        const prevBtn = carousel.querySelector('[data-gallery-prev]');
        const nextBtn = carousel.querySelector('[data-gallery-next]');

        if (originalCards.length === 0) return;

        // Determine how many cards to show based on viewport
        function getVisibleCount() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        let visibleCount = getVisibleCount();
        const totalOriginal = originalCards.length;

        // Check if we should center (fewer cards than visible slots)
        function shouldCenter() {
            return totalOriginal < visibleCount;
        }

        function updateCenterState() {
            if (shouldCenter()) {
                track.classList.add('gallery-track--centered');
                if (prevBtn) prevBtn.style.visibility = 'hidden';
                if (nextBtn) nextBtn.style.visibility = 'hidden';
            } else {
                track.classList.remove('gallery-track--centered');
                if (prevBtn) prevBtn.style.visibility = 'visible';
                if (nextBtn) nextBtn.style.visibility = 'visible';
            }
        }

        // For infinite loop: clone cards at beginning and end
        let clonesBefore = [];
        let clonesAfter = [];
        
        function setupClones() {
            // Remove existing clones
            clonesBefore.forEach(c => c.remove());
            clonesAfter.forEach(c => c.remove());
            clonesBefore = [];
            clonesAfter = [];

            if (shouldCenter()) return;

            // Clone last 'visibleCount' cards to prepend
            for (let i = 0; i < visibleCount; i++) {
                const idx = totalOriginal - visibleCount + i;
                if (idx >= 0) {
                    const clone = originalCards[idx].cloneNode(true);
                    clone.setAttribute('aria-hidden', 'true');
                    clone.classList.add('gallery-card--clone');
                    track.insertBefore(clone, track.firstChild);
                    clonesBefore.unshift(clone);
                }
            }

            // Clone first 'visibleCount' cards to append
            for (let i = 0; i < visibleCount; i++) {
                if (i < totalOriginal) {
                    const clone = originalCards[i].cloneNode(true);
                    clone.setAttribute('aria-hidden', 'true');
                    clone.classList.add('gallery-card--clone');
                    track.appendChild(clone);
                    clonesAfter.push(clone);
                }
            }
        }

        // Current position (index into original cards, 0-based)
        let currentIndex = 0;
        let isTransitioning = false;

        function getCardWidth() {
            return trackContainer.offsetWidth / visibleCount;
        }

        function updateCarousel(animate = true, announce = true) {
            if (shouldCenter()) {
                track.style.transform = 'translateX(0)';
                return;
            }

            const cardWidth = getCardWidth();
            // Account for clones at the beginning
            const offset = (currentIndex + clonesBefore.length) * cardWidth;
            
            if (animate) {
                track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = `translateX(-${offset}px)`;

            // Update ARIA states on original cards
            originalCards.forEach((card, i) => {
                const isVisible = i >= currentIndex && i < currentIndex + visibleCount;
                card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
            });

            if (announce && animate) {
                const displayIndex = ((currentIndex % totalOriginal) + totalOriginal) % totalOriginal;
                const endIndex = Math.min(displayIndex + visibleCount, totalOriginal);
                announceToScreenReader(`Showing images ${displayIndex + 1} to ${endIndex} of ${totalOriginal}`);
            }
        }

        function handleTransitionEnd() {
            if (shouldCenter()) return;
            
            isTransitioning = false;
            
            // If we're at a clone position, jump to the real position
            if (currentIndex >= totalOriginal) {
                currentIndex = currentIndex - totalOriginal;
                updateCarousel(false, false);
            } else if (currentIndex < 0) {
                currentIndex = totalOriginal + currentIndex;
                updateCarousel(false, false);
            }
        }

        track.addEventListener('transitionend', handleTransitionEnd);

        function goNext() {
            if (isTransitioning || shouldCenter()) return;
            isTransitioning = true;
            currentIndex++;
            updateCarousel(true);
        }

        function goPrev() {
            if (isTransitioning || shouldCenter()) return;
            isTransitioning = true;
            currentIndex--;
            updateCarousel(true);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goNext();
            });
        }

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                visibleCount = getVisibleCount();
                currentIndex = Math.max(0, Math.min(currentIndex, totalOriginal - 1));
                setupClones();
                updateCenterState();
                updateCarousel(false, false);
            }, 100);
        });

        // Initial setup
        setupClones();
        updateCenterState();
        updateCarousel(false, false);
    });
});
