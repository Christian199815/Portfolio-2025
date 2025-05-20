import { getAllElement, getElement } from "../../client/document";

document.addEventListener('DOMContentLoaded', function() {
    // Image carousel functionality
    const carousel = getElement('[data-carousel]');
    const slides = getAllElement('[data-slide]');
    const dots = getAllElement('.dot');
    const prevButton = getElement('.prev-slide');
    const nextButton = getElement('.next-slide');
    let currentSlide = 0;
    let autoplayInterval;
    
    function showSlide(index) {
      // Remove active class from current slide and dot
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      
      // Update current slide index
      currentSlide = index;
      
      // Handle wrap-around
      if (currentSlide >= slides.length) {
        currentSlide = 0;
      } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
      }
      
      // Add active class to new slide and dot
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
      showSlide((currentSlide + 1) % slides.length);
    }
    
    function prevSlide() {
      showSlide((currentSlide - 1 + slides.length) % slides.length);
    }
    
    if(nextButton){
    // Set up click handlers for buttons
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
    
    if(dots){
    // Set up click handlers for dots
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        resetAutoplay();
      });
    });
    }
    
    // Auto-play carousel
    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 5000);
    }
    
    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }
    
    // Start autoplay
    startAutoplay();
    if(carousel){
    // Pause autoplay when hovering over carousel
    carousel.addEventListener('mouseenter', function() {
      clearInterval(autoplayInterval);
    });
    
    carousel.addEventListener('mouseleave', function() {
      startAutoplay();
    });
    }
  });