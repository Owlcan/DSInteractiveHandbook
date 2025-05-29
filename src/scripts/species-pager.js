/**
 * Species Pager - Handles navigation between different species sections
 */
class SpeciesPager {
  constructor() {
    this.sections = [];
    this.currentIndex = 0;
  }

  init() {
    // Find all main species sections
    const racesContent = document.getElementById('races-content');
    if (!racesContent) return;

    // Add CSS class to each main species section
    const mainHeaders = racesContent.querySelectorAll('h2[id]');
    mainHeaders.forEach(header => {
      // Create section wrapper if needed
      const section = document.createElement('div');
      section.className = 'species-section';
      section.id = `section-${header.id}`;
      
      // Move content into the section
      let currentElement = header;
      const elements = [];
      
      // Collect all elements that belong to this section
      while (currentElement && 
             (currentElement.nextElementSibling && 
              !currentElement.nextElementSibling.matches('h2[id], .page-break'))) {
        elements.push(currentElement.nextElementSibling);
        currentElement = currentElement.nextElementSibling;
      }
      
      // Add navigation buttons to each section
      const navDiv = document.createElement('div');
      navDiv.className = 'species-nav';
      navDiv.innerHTML = `
        <button class="prev-species">◄ Previous Species</button>
        <button class="next-species">Next Species ►</button>
      `;
      
      // Move the header and its content into the section
      header.parentNode.insertBefore(section, header);
      section.appendChild(header);
      elements.forEach(el => section.appendChild(el));
      section.appendChild(navDiv);
      
      this.sections.push(section);
    });
    
    // Set up navigation events
    this.setupNavigation();
    
    // Initially show only the first section or the one specified in the URL
    this.showCurrentSection();
  }
  
  setupNavigation() {
    // Add click handlers for the prev/next buttons
    document.querySelectorAll('.prev-species').forEach(btn => {
      btn.addEventListener('click', () => this.goToPreviousSection());
    });
    
    document.querySelectorAll('.next-species').forEach(btn => {
      btn.addEventListener('click', () => this.goToNextSection());
    });
    
    // Allow keyboard navigation with arrow keys
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('races-section').classList.contains('active')) {
        if (e.key === 'ArrowRight') {
          this.goToNextSection();
        } else if (e.key === 'ArrowLeft') {
          this.goToPreviousSection();
        }
      }
    });
    
    // Handle hash changes to navigate to specific species
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
  }
  
  handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    
    // Find section index by hash
    const sectionIndex = this.sections.findIndex(section => {
      return section.querySelector(`h2#${hash}`) !== null;
    });
    
    if (sectionIndex !== -1) {
      this.currentIndex = sectionIndex;
      this.showCurrentSection();
    }
  }
  
  showCurrentSection() {
    // Hide all sections
    this.sections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Show current section
    if (this.sections[this.currentIndex]) {
      this.sections[this.currentIndex].style.display = 'block';
      
      // Update navigation button states
      this.updateNavigationButtons();
      
      // Scroll to top of section
      this.sections[this.currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  updateNavigationButtons() {
    // Update prev/next button states
    const section = this.sections[this.currentIndex];
    if (!section) return;
    
    const prevBtn = section.querySelector('.prev-species');
    const nextBtn = section.querySelector('.next-species');
    
    if (prevBtn) prevBtn.disabled = this.currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = this.currentIndex >= this.sections.length - 1;
  }
  
  goToNextSection() {
    if (this.currentIndex < this.sections.length - 1) {
      this.currentIndex++;
      this.showCurrentSection();
      
      // Update URL hash without triggering scroll
      const header = this.sections[this.currentIndex].querySelector('h2[id]');
      if (header && header.id) {
        history.replaceState(null, null, `#${header.id}`);
      }
    }
  }
  
  goToPreviousSection() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showCurrentSection();
      
      // Update URL hash without triggering scroll
      const header = this.sections[this.currentIndex].querySelector('h2[id]');
      if (header && header.id) {
        history.replaceState(null, null, `#${header.id}`);
      }
    }
  }
}

// Initialize the species pager when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const speciesPager = new SpeciesPager();
  
  // Initialize the pager when the races section is displayed
  document.querySelector('[data-section="races"]').addEventListener('click', () => {
    // Allow time for the content to load
    setTimeout(() => {
      speciesPager.init();
    }, 100);
  });
  
  // Handle direct URL access with hash
  if (window.location.hash && document.getElementById('races-section')) {
    setTimeout(() => {
      speciesPager.init();
    }, 100);
  }
});
