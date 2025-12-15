import { getElement, announceToScreenReader } from "../../../client/document";

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/contact' && !window.location.hash && !window.location.search) {
        
        // Carousel only
        const carousel = getElement('[data-carousel]');
        const slides = document.querySelectorAll('[data-slide]');
        let currentSlide = 0;
        let carouselInterval;
        
        if (slides && carousel && slides.length > 0) {
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                slide.setAttribute('aria-hidden', 'true');
            });
            slides[0].classList.add('active');
            slides[0].setAttribute('aria-hidden', 'false');
            
            function nextSlide() {
                slides[currentSlide].classList.remove('active');
                slides[currentSlide].setAttribute('aria-hidden', 'true');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
                slides[currentSlide].setAttribute('aria-hidden', 'false');
            }
            
            carouselInterval = setInterval(nextSlide, 2000);
            
            carousel.addEventListener('mouseenter', () => {
                clearInterval(carouselInterval);
            });
            
            carousel.addEventListener('mouseleave', () => {
                carouselInterval = setInterval(nextSlide, 5000);
            });
            
            // Pause carousel when user prefers reduced motion
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                clearInterval(carouselInterval);
            }
        }
    }
});