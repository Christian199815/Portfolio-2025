import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import { log } from '../client/debug.js';
import sirv from 'sirv';
import fs from 'fs/promises';

const _DebugBool = false;
const _fileName = "server";

// Configuration
const PREPR_CONFIG = {
    apiUrl: 'https://graphql.prepr.io/ac_9d7bfb4993764f97abaf1917d1253592bc985679d7627cba4e367d8e883226e5',
    token: 'ac_9d7bfb4993764f97abaf1917d1253592bc985679d7627cba4e367d8e883226e5'
};


// GraphQL query to fetch projects from Prepr  
const PROJECTS_QUERY = `
query GetDetailPages {
  Detailpages {
    items {
      _id
      _slug
      project_name
      project_body_text
      project_featured_text
      project_featured_image {
        url
      }
      project_images_gallery {
        url
      }
      project_categories
      project_types_select
      project_products_select
      project_date
      project_languages {
        body
        slug
      }
      project_progress {
        progress_name
        progress_body_text
        progress_content {
          duration
        }
      }
      project_quote
    }
  }
}
`;


const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

// GraphQL fetch from Prepr
async function fetchFromPrepr(query, variables = {}) {
    try {
        log(_fileName, _DebugBool, '=== Starting Prepr GraphQL fetch ===');
        log(_fileName, _DebugBool, 'URL:' + PREPR_CONFIG.apiUrl);

        
        const response = await fetch(PREPR_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PREPR_CONFIG.token}`,
                'User-Agent': 'Node-Portfolio-App'
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        log(_fileName, _DebugBool, 'Response status:' + response.status);
        
        if (!response.ok) {
            log(_fileName, _DebugBool, `HTTP error! status: ${response.status}`);
            const text = await response.text();
            log(_fileName, _DebugBool, 'Error response:' + text);
            return null;
        }
        
        const data = await response.json();
        log(_fileName, _DebugBool, 'Raw response data:' + JSON.stringify(data, null, 2));
        
        if (data.errors) {
            log(_fileName, _DebugBool, 'GraphQL errors:' + JSON.stringify(data.errors));
            // Still return data if available, despite errors
            if (data.data) {
                log(_fileName, _DebugBool,'Returning partial data despite errors');
                return data.data;
            }
            return null;
        }
        
        return data.data;
    } catch (error) {
        log(_fileName, _DebugBool, 'Error fetching from Prepr:' + error);
        return null;
    }
}

function ensureAbsolutePaths(project) {
    // Deep clone the project
    const clone = JSON.parse(JSON.stringify(project));
    
    // Debug log
    log(_fileName, _DebugBool, `Processing project: ${clone.projectname}`);
    log(_fileName, _DebugBool, `Original featured image: ${clone.projectFeaturedImage}`);
    
    // Fix featured image
    if (clone.projectFeaturedImage && !clone.projectFeaturedImage.startsWith('http')) {
      // Remove any leading ./ from paths
      let path = clone.projectFeaturedImage.replace(/^\.\//, '');
      
      // Make sure the path is properly formatted
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      
      clone.projectFeaturedImage = path;
      log(_fileName, _DebugBool, `Fixed featured image: ${clone.projectFeaturedImage}`);
    }
    
    // Fix project images
    if (Array.isArray(clone.projectImages)) {
      clone.projectImages = clone.projectImages.map(img => {
        if (img && !img.startsWith('http')) {
          // Remove any leading ./ from paths
          let path = img.replace(/^\.\//, '');
          
          // Make sure the path is properly formatted
          if (!path.startsWith('/')) {
            path = '/' + path;
          }
          
          return path;
        }
        return img;
      });
      
      log(_fileName, _DebugBool, `Fixed project images (first 2): ${clone.projectImages.slice(0, 2).join(', ')}`);
    }
    
    return clone;
}

// Transform Prepr data from GraphQL
function transformPreprData(preprData) {
    log(_fileName, _DebugBool, '=== Transforming Prepr data ===');
    log(_fileName, _DebugBool, 'Raw Prepr data received:' + JSON.stringify(preprData, null, 2));
    
    if (!preprData) {
        log(_fileName, _DebugBool, 'No data from Prepr');
        return { projects: [] };
    }
    
    if (!preprData.Detailpages) {
        log(_fileName, _DebugBool, 'No Detailpages in Prepr data');
        log(_fileName, _DebugBool, 'Available keys:' + Object.keys(preprData));
        return { projects: [] };
    }
    
    if (!preprData.Detailpages.items) {
        log(_fileName, _DebugBool, 'No items in Detailpages');
        log(_fileName, _DebugBool, 'Detailpages content:' + JSON.stringify(preprData.Detailpages));
        return { projects: [] };
    }
    
    log(_fileName, _DebugBool, `Found ${preprData.Detailpages.items.length} items in Prepr data`);
    
    const transformedProjects = preprData.Detailpages.items.map(project => {
        // Extract image gallery URLs - handle both array and single asset
        let projectImages = [];
        if (Array.isArray(project.project_images_gallery)) {
            projectImages = project.project_images_gallery.map(img => img.url);
        } else if (project.project_images_gallery?.url) {
            projectImages = [project.project_images_gallery.url];
        }
        
        // Extract language bodies/slugs (use 'body' or 'slug')
        const projectLanguages = project.project_languages?.map(lang => lang.body || lang.slug) || [];
        
        // Process progress data
        const projectProgress = project.project_progress || [];
        
        return {
            id: project._id,
            projectname: project.project_name,
            projectBodyText: project.project_body_text,
            projectFeaturedImage: project.project_featured_image?.url || '',
            projectImages: projectImages,
            category: project.project_categories,
            typeOfProject: project.project_types_select,
            typeOfProduct: project.project_products_select,
            projectDate: project.project_date, // Just use the date directly
            projectLanguages: projectLanguages,
            project_progress: projectProgress,
            project_quote: project.project_quote,
            source: 'prepr'
        };
    });
    
    log(_fileName, _DebugBool, `Transformed ${transformedProjects.length} projects from Prepr`);
    log(_fileName, _DebugBool, 'Transformed projects:' + JSON.stringify(transformedProjects, null, 2));
    return {
        projects: transformedProjects
    };
}

// Load local JSON file
async function loadLocalJSON() {
    try {
        const data = await fs.readFile('./projects.json', 'utf8');
        const parsed = JSON.parse(data);
        if (parsed.projects) {
            parsed.projects = parsed.projects.map(project => ({
                ...project,
                source: 'local'
            }));
        }
        log(_fileName, _DebugBool, `Loaded ${parsed.projects?.length || 0} projects from local JSON`);
        return parsed;
    } catch (error) {
        log(_fileName, _DebugBool, 'Error loading local JSON:' + error);
        return { projects: [] };
    }
}

// Combine project data
function combineProjectData(preprData, localData) {
    const preprProjects = preprData?.projects || [];
    const localProjects = localData?.projects || [];
    
    const allProjects = [...preprProjects, ...localProjects];
    
    const uniqueProjects = allProjects.reduce((acc, current) => {
        const existing = acc.find(item => item.id === current.id);
        if (!existing) {
            acc.push(current);
        } else if (current.source === 'prepr' && existing.source === 'local') {
            const index = acc.indexOf(existing);
            acc[index] = current;
        }
        return acc;
    }, []);
    
    return uniqueProjects;
}

// Load all project data
async function loadAllProjectData() {
    try {
        const [preprResult, localResult] = await Promise.allSettled([
            fetchFromPrepr(PROJECTS_QUERY).then(data => data ? transformPreprData(data) : null),
            loadLocalJSON()
        ]);
        
        const preprData = preprResult.status === 'fulfilled' ? preprResult.value : null;
        const localData = localResult.status === 'fulfilled' ? localResult.value : { projects: [] };
        
        const combinedData = combineProjectData(preprData, localData);
        
        // Clean up data - replace underscores with spaces
        combinedData.forEach(project => {
            if (project.category) {
                project.category = project.category.replace(/_/g, ' ');
            }
            if (project.typeOfProject) {
                project.typeOfProject = project.typeOfProject.replace(/_/g, ' ');
            }
            if (project.typeOfProduct) {
                project.typeOfProduct = project.typeOfProduct.replace(/_/g, ' ');
            }
        });
        
        log(_fileName, _DebugBool, `Loaded ${combinedData.length} projects total`);
        return combinedData;
    } catch (error) {
        log(_fileName, _DebugBool, 'Error loading project data:' + error);
        return [];
    }
}

// Helper functions
function getRandomProjects(projects, count) {
    if (!projects || projects.length === 0) return [];
    const shuffled = [...projects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
    });
}

function applyFilters(projects, { category, productType, projectType, sortBy }) {
    let filtered = projects.filter(project => {
        const matchesCategory = !category || project.category === category;
        const matchesProductType = !productType || project.typeOfProduct === productType;
        const matchesProjectType = !projectType || project.typeOfProject === projectType;
        
        return matchesCategory && matchesProductType && matchesProjectType;
    });
    
    filtered.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                return new Date(b.projectDate) - new Date(a.projectDate);
            case 'oldest':
                return new Date(a.projectDate) - new Date(b.projectDate);
            case 'name':
                return a.projectname.localeCompare(b.projectname);
            default:
                return 0;
        }
    });
    
    return filtered;
}

// Helper function for unique values
function uniqueValues(projects, prop) {
  const seen = new Map();
  return projects
    .filter(p => p[prop])
    .map(p => p[prop])
    .filter(value => {
      const lowerValue = value.toLowerCase();
      if (seen.has(lowerValue)) return false;
      seen.set(lowerValue, true);
      return true;
    })
    .sort();
}

// Then define the middleware setup function
async function setupMiddleware() {
  app.use(logger());
  
  // Serve static files from the root
//   app.use('/logo.svg', sirv('public', { dev: true }));
//   app.use('/images', sirv('public/images', { dev: true }));
  app.use('/resources', sirv('public/resources', { dev: true }));
  app.use('/public', sirv('public', { dev: true }));
  app.use('/', sirv('dist', { dev: true }));
}

// Setup middleware
setupMiddleware();

// Start server
app.listen(3000, () => console.log('Server available on http://localhost:3000'));

// Routes
app.get('/', async (req, res) => {
  const projects = await loadAllProjectData();
  const randomProjects = getRandomProjects(projects, 3);
  const featuredProjects = getRandomProjects(projects, 3);
  const testProjects = projects.filter(project => 
      project.typeOfProject?.toLowerCase().includes('school project'));
  
  const imageStairs = randomProjects.map(project => ({
      src: project.projectFeaturedImage,
      alt: project.projectname
  }));
  
  return res.send(renderTemplate('server/views/index.liquid', { 
      title: 'Home',
      imageStairs: imageStairs,
      featuredProjects: featuredProjects,
      testProjects: testProjects,
  }));
});

app.get('/work', async (req, res) => {
  const projects = await loadAllProjectData();
  const category = req.query.category || '';
  const productType = req.query.productType || '';
  const projectType = req.query.projectType || '';
  const sortBy = req.query.sortBy || 'newest';
  
  const filteredProjects = applyFilters(projects, {
      category,
      productType,
      projectType,
      sortBy
  });
  
  // Get unique categories, product types, and project types
  const categories = uniqueValues(projects, 'category');
  const productTypes = uniqueValues(projects, 'typeOfProduct');
  const projectTypes = uniqueValues(projects, 'typeOfProject');
  
  return res.send(renderTemplate('server/views/work/work.liquid', {
      title: 'Work',
      projects: filteredProjects,
      categories: categories,
      productTypes: productTypes,
      projectTypes: projectTypes,
      selectedCategory: category,
      selectedProductType: productType,
      selectedProjectType: projectType,
      selectedSort: sortBy,
      formatDate: formatDate
  }));
});

app.get('/project/:id', async (req, res) => {
  const id = req.params.id;
  const projects = await loadAllProjectData();
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).send('Project not found');
  }
  
  // Ensure all image paths are absolute
  const fixedProject = ensureAbsolutePaths(project);
  
  return res.send(renderTemplate('server/views/project/project.liquid', {
      title: `${project.projectname} - Project Detail`,
      project: fixedProject,
      formattedDate: formatDate(project.projectDate)
  }));
});

// Render template helper
const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};