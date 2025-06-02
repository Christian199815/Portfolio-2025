import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import { log } from '../client/debug.js';
import sirv from 'sirv';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();
import { sendEmail, initializeTransporter, CONTACT_RECIPIENT } from './email.js';

const _DebugBool = true;
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
          url
        }
      }
      project_quote
      project_link
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
  
  // Fix featured image
  if (clone.projectFeaturedImage && !clone.projectFeaturedImage.startsWith('http')) {
    // Always use absolute path from site root to public/images
    let filename = clone.projectFeaturedImage.split('/').pop(); // Get just the filename
    clone.projectFeaturedImage = `/public/images/${filename}`;
    log(_fileName, _DebugBool, `Fixed featured image: ${clone.projectFeaturedImage}`);
  }
  
  // Fix project images
  if (Array.isArray(clone.projectImages)) {
    clone.projectImages = clone.projectImages.map(img => {
      if (img && !img.startsWith('http')) {
        // Always use absolute path from site root to public/images
        let filename = img.split('/').pop(); // Get just the filename
        return `/public/images/${filename}`;
      }
      return img;
    });
  }
  
  // Fix progress content URLs
  if (Array.isArray(clone.projectProgress)) {
    clone.projectProgress.forEach(progress => {
      if (Array.isArray(progress.progressContent)) {
        progress.progressContent.forEach(content => {
          if (content.url && !content.url.startsWith('http')) {
            // Always use absolute path from site root to public/images
            let filename = content.url.split('/').pop(); // Get just the filename
            content.url = `/public/images/${filename}`;
          }
        });
      }
    });
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
            slug: project._slug, // Adding slug from query
            projectname: project.project_name,
            projectBodyText: project.project_body_text,
            projectFeaturedText: project.project_featured_text, // Adding featured text
            projectFeaturedImage: project.project_featured_image?.url || '',
            projectImages: projectImages,
            category: project.project_categories,
            typeOfProject: project.project_types_select,
            typeOfProduct: project.project_products_select,
            projectDate: project.project_date,
            projectLanguages: projectLanguages,
            projectProgress: project.project_progress?.map(progress => ({
                progressName: progress.progress_name,
                progressBodyText: progress.progress_body_text,
                progressContent: Array.isArray(progress.progress_content) ? 
                    progress.progress_content.map(content => ({
                        duration: content.duration || null,
                        url: content.url || null
                    })) : []
            })) || [],
            projectQuote: project.project_quote,
            link: project.project_link,
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
// Load all project data
async function loadAllProjectData() {
    try {
        // First try to get data from Prepr
        const preprData = await fetchFromPrepr(PROJECTS_QUERY)
            .then(data => data ? transformPreprData(data) : null);
        
        // If we got valid data from Prepr with at least one project, use only that
        if (preprData && preprData.projects && preprData.projects.length > 0) {
            log(_fileName, _DebugBool, `Successfully loaded ${preprData.projects.length} projects from Prepr`);
            
            // Clean up data - replace underscores with spaces
            preprData.projects.forEach(project => {
                if (project.category) {
                    project.category = project.category.replace(/_/g, ' ');
                }
                if (project.typeOfProject) {
                    project.typeOfProject = project.typeOfProject.replace(/_/g, ' ');
                }
                if (project.typeOfProduct) {
                    project.typeOfProduct = project.typeOfProduct.replace(/_/g, ' ');
                }
                
                // Ensure any project-specific transformations are applied
                project.projectProgress = project.projectProgress || [];
                project.projectLanguages = project.projectLanguages || [];
                project.projectImages = project.projectImages || [];
                project.projectFeaturedText = project.projectFeaturedText || '';
                project.slug = project.slug || '';
                project.project_link = project.project_link || '';
            });
            
            return preprData.projects;
        }
        
        // If Prepr failed or returned no projects, fall back to local JSON
        log(_fileName, _DebugBool, 'Prepr data unavailable or empty, falling back to local JSON');
        const localData = await loadLocalJSON();
        const localProjects = localData.projects || [];
        
        // Clean up data - replace underscores with spaces
        localProjects.forEach(project => {
            if (project.category) {
                project.category = project.category.replace(/_/g, ' ');
            }
            if (project.typeOfProject) {
                project.typeOfProject = project.typeOfProject.replace(/_/g, ' ');
            }
            if (project.typeOfProduct) {
                project.typeOfProduct = project.typeOfProduct.replace(/_/g, ' ');
            }
            
            // Ensure local projects have the same structure as Prepr projects
            project.projectProgress = project.projectProgress || [];
            project.projectLanguages = project.projectLanguages || [];
            project.projectImages = project.projectImages || [];
            project.projectFeaturedText = project.projectFeaturedText || '';
            project.slug = project.slug || '';
        });
        
        log(_fileName, _DebugBool, `Loaded ${localProjects.length} projects from local JSON (fallback)`);
        return localProjects;
    } catch (error) {
        log(_fileName, _DebugBool, 'Error loading project data: ' + error);
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
  
  app.use('/resources', sirv('public/resources', { dev: true }));
  app.use('/project/images', sirv('public/images', { dev: true }));
  app.use('/public', sirv('public', { dev: true }));
  app.use('/', sirv('dist', { dev: true }));
}

  // Add JSON body parser for API routes
  app.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          req.body = JSON.parse(body);
          next();
        } catch (error) {
          res.status(400).json({ error: 'Invalid JSON' });
        }
      });
    } else {
      next();
    }
  });

// Setup middleware
setupMiddleware();

try {
  initializeTransporter();
  log(_fileName, _DebugBool, 'Email service initialized successfully');
} catch (error) {
  log(_fileName, _DebugBool, `Failed to initialize email service: ${error.message}`);
}

// Start server
app.listen(3000, () => console.log('Server available on http://localhost:3000'));

// Routes
app.get('/', async (req, res) => {
  const projects = await loadAllProjectData();
  const randomProjects = getRandomProjects(projects, 3);
  const featuredProjects = getRandomProjects(projects, 3);
  const testProjects = projects.filter(project => 
      project.typeOfProject?.toLowerCase().includes('test project'));
  
  const imageStairs = randomProjects.map(project => ({
      src: project.projectFeaturedImage,
      alt: project.projectname,
      link: "/project/" + project.id
  }));
  
  // Get random project from each discipline category
  const disciplineCategories = [
    { name: 'Web Programming', key: 'web-programming' },
    { name: 'Web Designing', key: 'web-design' },
    { name: 'Game Programming', key: 'game-programming' },
    { name: 'Game Designing', key: 'game-design' }
  ];
  const disciplineProjects = {};
  
  disciplineCategories.forEach(({ name, key }) => {
    const categoryProjects = projects.filter(project => 
      project.category?.toLowerCase() === name.toLowerCase() ||
      project.typeOfProject?.toLowerCase() === name.toLowerCase()
    );
    
    if (categoryProjects.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryProjects.length);
      disciplineProjects[key] = categoryProjects[randomIndex];
    }
  });
  
  return res.send(renderTemplate('server/views/index.liquid', { 
      title: 'Chris Donker Portfolio',
      imageStairs: imageStairs,
      featuredProjects: featuredProjects,
      testProjects: testProjects,
      disciplineProjects: disciplineProjects,
  }));
});

app.get('/about', async (req, res) => {
  return res.send(renderTemplate('server/views/about/about.liquid', {
    title: 'About Chris'
  }));
});

app.get('/contact', async (req, res) => {
  return res.send(renderTemplate('server/views/contact/contact.liquid', {
    title: 'Contact Chris'
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
      title: `Chris' Work`,
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
    
    // Add the progress check here
    console.log(`Checking progress items for project: ${project.projectname}`);
    
    if (project.projectProgress && project.projectProgress.length > 0) {
      console.log(`Found ${project.projectProgress.length} progress items`);
      
      // Loop through each progress item
      project.projectProgress.forEach((progressItem, progressIndex) => {
        console.log(`\nProgress Item #${progressIndex + 1}:`);
        console.log('- Progress Name:', progressItem.progressName);
        console.log('- Progress Body Text:', progressItem.progressBodyText);
        
        // Check for content items
        if (progressItem.progressContent && Array.isArray(progressItem.progressContent) && progressItem.progressContent.length > 0) {
          console.log(`  Found ${progressItem.progressContent.length} content items in this progress entry`);
          
          // Loop through all content items
          progressItem.progressContent.forEach((contentItem, contentIndex) => {
            console.log(`\n  Content Item #${contentIndex + 1}:`);
            console.log('  Raw content item:', JSON.stringify(contentItem, null, 2));
            
            // Access specific properties dynamically
            Object.keys(contentItem).forEach(key => {
              console.log(`  - Property '${key}':`, typeof contentItem[key] === 'object' ? 
                          JSON.stringify(contentItem[key], null, 2) : contentItem[key]);
              
              // If this is an image property, it might have a URL
              if (contentItem[key] && typeof contentItem[key] === 'object' && contentItem[key].url) {
                console.log(`    Image/Media URL:`, contentItem[key].url);
              }
            });
          });
        } else {
          console.log('  No content items found in this progress entry');
          console.log('  Raw progressContent:', JSON.stringify(progressItem.progressContent, null, 2));
        }
      });
    } else {
      console.log('No progress items found for this project');
    }
    
    // Continue with the rest of your route handler
    const fixedProject = ensureAbsolutePaths(project);
    
    return res.send(renderTemplate('server/views/project/project.liquid', {
        title: `${project.projectname} - Project Detail`,
        project: fixedProject,
        formattedDate: formatDate(project.projectDate)
    }));
  });

  // Contact form email route
// Contact form email route
// Contact form email route
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const { from, to, message } = req.body;
    const recipient = to || CONTACT_RECIPIENT; 
    
    log(_fileName, _DebugBool, `Contact form submission - From: ${from}, To: ${recipient || 'NOT SET!'}`);
    // Validate inputs
    if (!from || !message) {
      log(_fileName, _DebugBool, 'Missing required fields in contact form submission');
      return res.status(400).json({ 
        success: false, 
        error: 'Email address and message are required' 
      });
    }
    
    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from)) {
      log(_fileName, _DebugBool, `Invalid email format: ${from}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    log(_fileName, _DebugBool, `Processing contact form: from=${from}, to=${recipient}`);
    
    // Send the email
    await sendEmail({
      to: recipient, // Make sure this is being passed correctly
      replyTo: from,
      subject: 'New Contact Form Submission',
      // ...
      text: `From: ${from}\n\nMessage: ${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${from}</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #777; font-size: 12px;">This message was sent from your website's contact form.</p>
        </div>
      `
    });
    
    log(_fileName, _DebugBool, 'Email sent successfully');
    res.json({ success: true });
  } catch (error) {
    log(_fileName, _DebugBool, `Error in contact form submission: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email' 
    });
  }
});

app.post('/api/send-contact-email', async (req, res) => {
  console.log('======================================');
  console.log('RECEIVED FORM SUBMISSION:');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers['content-type']);
  console.log('======================================');
  
  try {
    // Rest of your code...
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Render template helper
const renderTemplate = (template, data) => {
  return engine.renderFileSync(template, data);
};
