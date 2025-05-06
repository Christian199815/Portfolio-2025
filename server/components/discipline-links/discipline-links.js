const disciplineImages = {
    'web-programming': '../../../public/images/web-programming.png',
    'web-design': '../../../public/images/image-placeholder.png',
    'game-programming': '../../../public/images/game-programming.png',
    'game-design': '../../../public/images/image-placeholder.png'
};


import { getElement } from "../../../client/document";


function setupDisciplineHover() {
    const disciplinesList = getElement('[data-disciplines-list]');
    const disciplineImage = getElement('[data-highlight-image]');
    
    if (!disciplinesList || !disciplineImage) return;
    
    const disciplineItems = disciplinesList.getElementsByTagName('li');
    
    Array.from(disciplineItems).forEach(li => {
        const link = li.querySelector('a');
        const disciplineName = link.querySelector('p').textContent.toLowerCase().replace(/\s+/g, '-');
        
        // Set initial image if it's the first item
        if (li === disciplineItems[0]) {
            link.dataset.hoverImage = disciplineImages[disciplineName] || '../../../public/images/img-placeholder.png';
            disciplineImage.src = link.dataset.hoverImage;
        } else {
            link.dataset.hoverImage = disciplineImages[disciplineName] ||  '../../../public/images/img-placeholder.png';
        }
        
        li.addEventListener('mouseenter', () => {
            disciplineImage.src = link.dataset.hoverImage;
        });
        
        li.addEventListener('mouseleave', () => {
            // Optional: Reset to default image when not hovering
            // disciplineImage.src = './img-placeholder.png';
        });
    });
}

setupDisciplineHover();