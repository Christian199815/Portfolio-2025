import { getElement } from "../../../client/document";

document.addEventListener('DOMContentLoaded', function() {
    // Configuration

const messageDestination = ""; 
    
    const contactForm = getElement('[data-form]');
    const submitBtn = getElement('[data-submit]');
    const captchaContainer = getElement('[data-captcha]');
    const captchaBox = getElement('[data-captcha-box]');
    const captchaInput = getElement('[data-captcha-input]');
    const verifyCaptchaBtn = getElement('[data-verify]');
    const formFeedback = getElement('[data-feedback]');
    
    let captchaCode = '';
    
    // Generate random captcha code
    function generateCaptcha() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        captchaCode = '';
        for (let i = 0; i < 6; i++) {
            captchaCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        captchaBox.textContent = captchaCode;
    }
    
    // Handle form submit
    // contactForm.addEventListener('submit', function(e) {
    //     e.preventDefault();
        
    //     // Validate email
    //     const emailInput = document.querySelector('[data-email]');
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
    //     if (!emailRegex.test(emailInput.value)) {
    //         formFeedback.textContent = 'Please enter a valid email address';
    //         formFeedback.className = 'error';
    //         formFeedback.style.display = 'block';
    //         return;
    //     }
        
    //     // Show captcha after form submit
    //     generateCaptcha();
    //     captchaContainer.classList.add('visible');
    //     submitBtn.disabled = true;
        
    //     // Make the captcha input required only after it's visible
    //     captchaInput.setAttribute('required', '');
    // });


// verifyCaptchaBtn.addEventListener('click', async function() {
//     if (captchaInput.value === captchaCode) {
//         // Gather form data
//         const emailFrom = document.querySelector('[data-email]').value;
//         const messageText = document.querySelector('[data-message]').value;
        
//         // Show sending status
//         formFeedback.textContent = 'Sending message...';
//         formFeedback.className = 'info';
//         formFeedback.style.display = 'block';
//         verifyCaptchaBtn.disabled = true;
        
//         try {
//             // Send data to the server using our Node.js API endpoint
//             const response = await fetch('/api/send-contact-email', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     from: emailFrom,
//                     to: messageDestination,
//                     message: messageText
//                 })
//             });
            
//             const data = await response.json();
            
//             if (response.ok && data.success) {
//                 // Success - server confirmed the email was sent
//                 formFeedback.textContent = `Message successfully sent!`;
//                 formFeedback.className = 'success';
//                 captchaContainer.classList.remove('visible');
//                 contactForm.reset();
//                 submitBtn.disabled = false;
//                 captchaInput.removeAttribute('required');
//             } else {
//                 // Error - server reported an issue
//                 formFeedback.textContent = `Error: ${data.error || 'Failed to send message'}`;
//                 formFeedback.className = 'error';
//                 verifyCaptchaBtn.disabled = false;
//             }
//         } catch (error) {
//             // Network or other error
//             console.error('Error sending email:', error);
//             formFeedback.textContent = 'Error sending message. Please try again or contact us directly.';
//             formFeedback.className = 'error';
//             verifyCaptchaBtn.disabled = false;
//         }
//     } else {
//         formFeedback.textContent = 'Incorrect captcha, please try again';
//         formFeedback.className = 'error';
//         formFeedback.style.display = 'block';
//         generateCaptcha();
//         captchaInput.value = '';
//     }
// });
    
    // Image carousel functionality
    const carousel = getElement('[data-carousel]');
    const slides = document.querySelectorAll('[data-slide]');
    let currentSlide = 0;
    
    if(slides && carousel){
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    // Auto-play carousel
    setInterval(nextSlide, 5000);
    }
});