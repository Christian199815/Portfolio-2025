import { getElement } from "../../../client/document";

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the work route
  const currentPath = window.location.pathname;
  const isWorkRoute = currentPath === '/work' || currentPath.startsWith('/work/');
  
  // Only run the filter code on the work route
  if (!isWorkRoute) {
    console.log('Filters not initialized: Not on work route');
    return;
  }
  
  console.log('Initializing filters for work route');
  
  // Get filter elements using data attributes
  const elements = {
    categoryFilter: getElement('[data-category-filter]'),
    productTypeFilter: getElement('[data-product-type-filter]'),
    projectTypeFilter: getElement('[data-project-type-filter]'),
    sortByFilter: getElement('[data-sort-by-filter]'),
    clearButton: getElement('[data-clear-filters]')
  };
  
  // Log which elements were found or not found for debugging
  console.log('Elements found:', elements);
  
  // Check if any element is missing
  const missingElements = Object.entries(elements)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
    
  if (missingElements.length > 0) {
    console.warn(`Missing elements: ${missingElements.join(', ')}. Check your HTML data attributes.`);
    return; // Exit early if any element is missing
  }
  
  // Apply filters function
  function applyFilters() {
    const categoryValue = elements.categoryFilter.value;
    const productTypeValue = elements.productTypeFilter.value;
    const projectTypeValue = elements.projectTypeFilter.value;
    const sortByValue = elements.sortByFilter.value;
    
    // Build the URL with query parameters
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    if (categoryValue) params.set('category', categoryValue.replace(/_/g, ' '));
    else params.delete('category');
    
    if (productTypeValue) params.set('productType', productTypeValue.replace(/_/g, ' '));
    else params.delete('productType');
    
    if (projectTypeValue) params.set('projectType', projectTypeValue.replace(/_/g, ' '));
    else params.delete('projectType');
    
    if (sortByValue) params.set('sortBy', sortByValue);
    else params.delete('sortBy');
    
    // Navigate to the new URL
    window.location.href = url.toString();
  }
  
  // Clear filters function
  function clearFilters() {
    // Navigate to the base URL without parameters
    window.location.href = window.location.pathname;
  }
  
  // Add event listeners using the elements object
  elements.categoryFilter.addEventListener('change', applyFilters);
  elements.productTypeFilter.addEventListener('change', applyFilters);
  elements.projectTypeFilter.addEventListener('change', applyFilters);
  elements.sortByFilter.addEventListener('change', applyFilters);
  elements.clearButton.addEventListener('click', clearFilters);
});