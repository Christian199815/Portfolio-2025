/**
 * image-pop.js
 * A reusable function that adds click handlers to images for showing them in a popover.
 * WCAG compliant with proper focus management and keyboard accessibility.
 * 
 * Usage:
 * 1. Include image-popover.css in your head
 * 2. Include this script and call initImagePopovers()
 */

(function() {
    let previouslyFocusedElement = null;

    // Create and show the popover
    function showImagePopover(imgSrc, imgAlt) {
      // Store currently focused element for focus restoration
      previouslyFocusedElement = document.activeElement;
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'image-popover-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Enlarged image view');
      
      // Create container
      const container = document.createElement('div');
      container.className = 'image-popover-container';
      
      // Create image
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = imgAlt || 'Enlarged view';
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'image-popover-close';
      closeBtn.setAttribute('type', 'button');
      closeBtn.setAttribute('aria-label', 'Close image view');
      closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
      
      // Add click handler to close
      function closePopover() {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.parentNode) {
            document.body.removeChild(overlay);
          }
          // Restore focus to previously focused element
          if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
          }
        }, 300);
        document.removeEventListener('keydown', handleKeydown);
      }
      
      closeBtn.addEventListener('click', closePopover);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closePopover();
        }
      });
      
      // Handle keyboard navigation
      function handleKeydown(e) {
        if (e.key === 'Escape') {
          closePopover();
        }
        // Trap focus within the dialog
        if (e.key === 'Tab') {
          // Keep focus on the close button
          e.preventDefault();
          closeBtn.focus();
        }
      }
      document.addEventListener('keydown', handleKeydown);
      
      // Assemble and show popover
      container.appendChild(img);
      container.appendChild(closeBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
      
      // Trigger fade in and focus the close button
      setTimeout(() => {
        overlay.style.opacity = '1';
        closeBtn.focus();
      }, 10);
    }
  
    // Initialize image popovers
    window.initImagePopovers = function(selector = 'img') {
      // Select only elements with data-pop-image
      const images = document.querySelectorAll(`${selector}[data-pop-image]`);
      images.forEach(img => {
        // Add pointer cursor
        img.style.cursor = 'pointer';
        
        // Make image focusable and add ARIA attributes
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `View larger: ${img.alt || 'image'}`);
    
        // Remove any existing handlers
        img.removeEventListener('click', img._popoverHandler);
        img.removeEventListener('keydown', img._popoverKeyHandler);
    
        // Add new click handler
        img._popoverHandler = function() {
          showImagePopover(this.src, this.alt);
        };
        img.addEventListener('click', img._popoverHandler);
        
        // Add keyboard handler for Enter and Space
        img._popoverKeyHandler = function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showImagePopover(this.src, this.alt);
          }
        };
        img.addEventListener('keydown', img._popoverKeyHandler);
      });
    
      return images.length; // Return number of images initialized
    };
  
    // Automatically initialize on load if data-auto-init attribute is present
    document.addEventListener('DOMContentLoaded', function() {
      if (document.querySelector('[data-auto-init-popovers]')) {
        window.initImagePopovers();
      }
    });
  })();