import { getElement } from "../../../client/document";

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/contact' && !window.location.hash && !window.location.search) {
        
        // Carousel only
        const carousel = getElement('[data-carousel]');
        const slides = document.querySelectorAll('[data-slide]');
        let currentSlide = 0;
        let carouselInterval;
        
        if (slides && carousel && slides.length > 0) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[0].classList.add('active');
            
            function nextSlide() {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }
            
            carouselInterval = setInterval(nextSlide, 2000);
            
            carousel.addEventListener('mouseenter', () => {
                clearInterval(carouselInterval);
            });
            
            carousel.addEventListener('mouseleave', () => {
                carouselInterval = setInterval(nextSlide, 5000);
            });
        }
    }
});