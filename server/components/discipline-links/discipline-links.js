import { getElement } from "../../../client/document";

function setupDisciplineHover() {
    const disciplinesList = getElement('[data-disciplines-list]');
    const disciplineHighlighter = getElement('[data-highlight-image]');
    
    if (!disciplinesList || !disciplineHighlighter) return;
    
    const disciplineItems = disciplinesList.getElementsByTagName('li');
    
    // Get discipline projects data (assuming it's available globally or passed in)
    // You might need to pass this data from the server or make it available globally
    const disciplineProjectsData = window.disciplineProjects || {};
    
    Array.from(disciplineItems).forEach((li, index) => {
        const link = li.querySelector('a');
        const disciplineKey = link.dataset.discipline;
        
        // Set initial state for first item
        if (index === 0 && disciplineProjectsData[disciplineKey]) {
            updateDisciplineImage(disciplineProjectsData[disciplineKey]);
        }
        
        li.addEventListener('mouseenter', () => {
            const project = disciplineProjectsData[disciplineKey];
            if (project) {
                updateDisciplineImage(project);
            } else {
                // Show placeholder if no project available
                updateDisciplineImage(null);
            }
        });
    });
    
    function updateDisciplineImage(project) {
        if (project) {
            disciplineHighlighter.innerHTML = `
                <a href="/project/${project.id}" id="discipline-image-link" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;">
                    <img src="${project.projectFeaturedImage}" alt="${project.projectname}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
                </a>
            `;
        } else {
            disciplineHighlighter.innerHTML = `
                <img src="../../../public/images/image-placeholder.png" alt="No project available" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
            `;
        }
    }
}

// Wait for DOM to be ready and disciplineProjects to be available
function initializeDisciplineLinks() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(setupDisciplineHover, 100);
        });
    } else {
        setTimeout(setupDisciplineHover, 100);
    }
}

initializeDisciplineLinks();