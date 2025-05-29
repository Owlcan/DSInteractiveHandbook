/**
 * Table of Contents Generator for Species/Races Section
 */

// Function to assign unique IDs to headers
function assignHeaderIDs() {
  const racesContent = document.getElementById('races-content');
  if (!racesContent) return;
  
  const headers = racesContent.querySelectorAll('h2, h3, h4');
  
  headers.forEach((header, index) => {
    if (!header.id) {
      // Create ID based on text content (simplified for links)
      const id = header.textContent
        .toLowerCase()
        .replace(/[^\w\s]/g, '')  // Remove special characters
        .replace(/\s+/g, '-');     // Replace spaces with hyphens
      
      header.id = id || `species-header-${index}`;
    }
  });
}

// Function to generate the table of contents
function generateTableOfContents() {
  // Get the races content element
  const racesContent = document.getElementById('races-content');
  const tocList = document.getElementById('toc-list');
  
  if (!racesContent || !tocList) return;
  
  // Get all headers (h2, h3, h4) from the races content
  const headers = racesContent.querySelectorAll('h2, h3, h4');
  
  // Clear any existing TOC entries
  tocList.innerHTML = '';
  
  // Process each header to create TOC entries
  headers.forEach((header, index) => {
    // Skip headers that don't need to be in TOC (optional)
    if (header.textContent === "Table of Contents") return;
    
    // Create unique ID for each header if it doesn't have one
    if (!header.id) {
      header.id = `species-header-${index}`;
    }
    
    // Create the TOC entry
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    
    // Add appropriate class based on header level for indentation
    listItem.className = `toc-level-${header.tagName.toLowerCase()}`;
    
    // Set the link text and href
    link.textContent = header.textContent;
    link.href = `#${header.id}`;
    
    // Add click event to scroll to the section
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(header.id).scrollIntoView({ behavior: 'smooth' });
    });
    
    listItem.appendChild(link);
    tocList.appendChild(listItem);
  });
}

// Initialize the TOC functionality
function initTableOfContents() {
  // Find the races button in the nav
  const racesButton = document.querySelector('a[data-section="races"]');
  
  if (racesButton) {
    // When the races section is activated
    racesButton.addEventListener('click', () => {
      // Check if we need to load the races content from simple-handbook.html
      const racesContent = document.getElementById('races-content');
      
      // Wait a bit for the content to be fully loaded/rendered before generating TOC
      setTimeout(() => {
        assignHeaderIDs();
        generateTableOfContents();
      }, 200);
    });
  }

  // Also initialize if we're already on the races page
  if (document.getElementById('races-section') && 
      document.getElementById('races-section').classList.contains('active')) {
    setTimeout(() => {
      assignHeaderIDs();
      generateTableOfContents();
    }, 200);
  }
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initTableOfContents);

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    assignHeaderIDs,
    generateTableOfContents,
    initTableOfContents
  };
}
