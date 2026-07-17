document.addEventListener('DOMContentLoaded', function() {
    const pushTextContainer = document.querySelector('[data-push-text]');
    
    if (!pushTextContainer) return;
    
    const items = pushTextContainer.querySelectorAll('[data-push-item]');
    
    if (items.length === 0) return;
    
    let currentIndex = 0;
    const intervalTime = 3000; // 3 seconds between transitions
    
    // Initialize first item as active
    items[0].classList.add('active');
    
    function nextItem() {
        const currentItem = items[currentIndex];
        const nextIndex = (currentIndex + 1) % items.length;
        const nextItem = items[nextIndex];
        
        // Exit current item
        currentItem.classList.remove('active');
        currentItem.classList.add('exiting');
        
        // Enter next item
        nextItem.classList.add('active');
        
        // Clean up exiting class after transition
        setTimeout(() => {
            currentItem.classList.remove('exiting');
            // Reset position for next cycle
            currentItem.style.transform = 'translateX(100%)';
            // Force reflow
            currentItem.offsetHeight;
            currentItem.style.transform = '';
        }, 500);
        
        currentIndex = nextIndex;
    }
    
    // Only run animation if user doesn't prefer reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(nextItem, intervalTime);
    }
});

