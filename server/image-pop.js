/**
 * image-pop.js
 * A reusable function that adds click handlers to images for showing them in a popover.
 * 
 * Usage:
 * 1. Include image-popover.css in your head
 * 2. Include this script and call initImagePopovers()
 */

(function() {
    // Create and show the popover
    function showImagePopover(imgSrc) {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'image-popover-overlay';
      
      // Create container
      const container = document.createElement('div');
      container.className = 'image-popover-container';
      
      // Create image
      const img = document.createElement('img');
      img.src = imgSrc;
      
      // Create close button
      const closeBtn = document.createElement('div');
      closeBtn.className = 'image-popover-close';
      
      // Add click handler to close
      function closePopover() {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.parentNode) {
            document.body.removeChild(overlay);
          }
        }, 300);
      }
      
      closeBtn.addEventListener('click', closePopover);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closePopover();
        }
      });
      
      // Handle escape key
      function handleEscape(e) {
        if (e.key === 'Escape') {
          closePopover();
          document.removeEventListener('keydown', handleEscape);
        }
      }
      document.addEventListener('keydown', handleEscape);
      
      // Assemble and show popover
      container.appendChild(img);
      container.appendChild(closeBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
      
      // Trigger fade in
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
    }
  
    // Initialize image popovers
  // Initialize image popovers
window.initImagePopovers = function(selector = 'img') {
    // Select only elements with data-pop-image
    const images = document.querySelectorAll(`${selector}[data-pop-image]`);
    images.forEach(img => {
      // Add pointer cursor
      img.style.cursor = 'pointer';
  
      // Remove any existing click handler
      img.removeEventListener('click', img._popoverHandler);
  
      // Add new click handler
      img._popoverHandler = function() {
        showImagePopover(this.src);
      };
      img.addEventListener('click', img._popoverHandler);
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