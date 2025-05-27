import { getAllElement, getElement } from "../../client/document";

document.addEventListener('DOMContentLoaded', function() {

  if (window.location.pathname === '/' && !window.location.hash && !window.location.search) {
  // Exact root route
    // Image carousel functionality
    const carousel = getElement('[data-carousel]');
    const slides = getAllElement('[data-slide]');
    const dots = getAllElement('.dot');
    const prevButton = getElement('.prev-slide');
    const nextButton = getElement('.next-slide');
    let currentSlide = 0;
    let autoplayInterval;
    
    // Find which slide is initially active
    slides.forEach(function(slide, index) {
        if (slide.classList.contains('active')) {
            currentSlide = index;
        }
    });
    
    function updateSlidePositions() {
        slides.forEach(function(slide, index) {
            const offset = index - currentSlide;
            const translateX = offset * 250;
            
            slide.classList.remove('active');
            
            if (index === currentSlide) {
                slide.style.transform = 'translate(-50%, -50%) translateX(0) scale(1)';
                slide.style.zIndex = '3';
                slide.style.opacity = '1';
                slide.classList.add('active');
            } else {
                slide.style.transform = `translate(-50%, -50%) translateX(${translateX}px) scale(0.75)`;
                slide.style.zIndex = '1';
                slide.style.opacity = '0.6';
            }
        });
    }
    
    function showSlide(index) {
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
        }
        
        currentSlide = index;
        
        if (currentSlide >= slides.length) {
            currentSlide = 0;
        } else if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }
        
        updateSlidePositions();
        
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }
    
    function nextSlide() {
        showSlide((currentSlide + 1) % slides.length);
    }
    
    function prevSlide() {
        showSlide((currentSlide - 1 + slides.length) % slides.length);
    }
    
    // Initialize carousel
    if (slides.length > 0) {
        updateSlidePositions();
    }
    
    if(nextButton){
        nextButton.addEventListener('click', function() {
            nextSlide();
            resetAutoplay();
        });
    }   
    
    if(prevButton){
        prevButton.addEventListener('click', function() {
            prevSlide();
            resetAutoplay();
        });
    }
    
    if(dots && dots.length > 0){
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                resetAutoplay();
            });
        });
    }
    
    // Modified click handler - only navigate carousel on non-active slides
    slides.forEach(function(slide, index) {
        slide.addEventListener('click', function(e) {
            if (index !== currentSlide) {
                // Prevent link navigation for non-active slides
                e.preventDefault();
                showSlide(index);
                resetAutoplay();
            }
            // Active slides will naturally follow the link
        });
    });
    
    // Auto-play carousel
    function startAutoplay() {
        if (slides.length > 1) {
            autoplayInterval = setInterval(nextSlide, 5000);
        }
    }
    
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    startAutoplay();
    
    if(carousel){
        carousel.addEventListener('mouseenter', function() {
            clearInterval(autoplayInterval);
        });
        
        carousel.addEventListener('mouseleave', function() {
            startAutoplay();
        });
    }
  }
});