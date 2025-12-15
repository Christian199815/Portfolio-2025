import { getElement, getAllElement, announceToScreenReader } from "../../client/document";

function initBentoView() {
  // Check if bento elements exist on the page
  const grid = document.querySelector("[data-bento-grid]");
  
  if (!grid) {
    // Not a bento page, exit silently
    return;
  }

  const disciplineButtons = getAllElement("[data-bento-discipline]");

  if (!disciplineButtons || disciplineButtons.length === 0) {
    console.warn("Bento view: discipline buttons not found");
    return;
  }

  // Check for discipline query param in URL
  const urlParams = new URLSearchParams(window.location.search);
  const disciplineFromUrl = urlParams.get("discipline");
  
  // Valid discipline keys
  const validDisciplines = ["all", "web-programming", "web-design", "game-programming", "game-design"];
  
  // Determine initial discipline from URL or default to "all"
  const initialDiscipline = validDisciplines.includes(disciplineFromUrl) ? disciplineFromUrl : "all";

  // Immediately set active class on the correct discipline button
  disciplineButtons.forEach((btn) => {
    if (btn.dataset.discipline === initialDiscipline) {
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-pressed", "false");
    }
  });

  const staticCards = Array.from(grid.querySelectorAll("[data-bento-static]"));

  // Shuffle static cards on page load so they appear in random positions
  function shuffleStaticCards() {
    const cards = Array.from(grid.querySelectorAll("[data-bento-static]"));
    
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Re-append cards in shuffled order
    cards.forEach((card) => {
      grid.appendChild(card);
    });
  }
  
  // Shuffle on init
  shuffleStaticCards();

  const allProjects = window.bentoAllProjects || [];
  const projectsByDiscipline = window.bentoProjectsByDiscipline || {};

  if (!Array.isArray(allProjects)) {
    console.warn("Bento view: bentoAllProjects is not an array");
  }

  // Current filter state - use the initialDiscipline we determined from URL
  let currentDiscipline = initialDiscipline;
  let currentProductType = "";
  let currentProjectType = "";
  let currentSort = "newest";

  // Extra filter elements
  const productTypeSelect = getElement("[data-bento-product-filter]");
  const projectTypeSelect = getElement("[data-bento-project-filter]");
  const sortSelect = getElement("[data-bento-sort-filter]");
  const clearFiltersBtn = getElement("[data-bento-clear-filters]");

  // Theme toggle in bento card
  const bentoThemeToggle = getElement("[data-bento-theme-toggle]");
  if (bentoThemeToggle) {
    bentoThemeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  function clearProjects() {
    const dynamicCards = grid.querySelectorAll(
      ".bento-card--project, .bento-card--skeleton, .bento-card--empty"
    );
    dynamicCards.forEach((card) => card.remove());
  }

  function insertCardsRandomly(cards) {
    // We keep the original static cards as anchor points and insert projects between them
    const anchors = Array.from(grid.querySelectorAll("[data-bento-static]"));

    cards.forEach((card) => {
      // Allow placement after any anchor or at the end
      const slotCount = anchors.length + 1;
      const randomIndex = Math.floor(Math.random() * slotCount);

      if (randomIndex >= anchors.length) {
        grid.appendChild(card);
      } else {
        const anchor = anchors[randomIndex];
        grid.insertBefore(card, anchor.nextSibling);
      }

      // Treat this project as a new anchor so later cards can be placed around it too
      anchors.push(card);
    });
  }

  function getColumnCount() {
    const width = window.innerWidth;
    if (width < 700) return 1;
    if (width < 900) return 3;
    if (width >= 1440) return 5;
    return 4;
  }

  function swapNodes(a, b) {
    if (a === b) return;
    const parent = a.parentNode;
    const aNext = a.nextSibling;
    const bNext = b.nextSibling;

    if (!parent || parent !== b.parentNode) return;

    parent.insertBefore(a, bNext);
    parent.insertBefore(b, aNext);
  }

  function applyProjectOrientations() {
    const cards = Array.from(grid.querySelectorAll(".bento-card--project"));

    cards.forEach((card) => {
      card.classList.remove(
        "bento-card--project--horizontal",
        "bento-card--project--vertical"
      );
    });

    const columns = getColumnCount();

    // Only apply spanning behaviour when we have more than one column
    if (columns <= 1) return;

    cards.forEach((card, index) => {
      const img = card.querySelector(".bento-project-image");
      let orientation = "none"; // default: no spanning

      if (img && img.naturalWidth && img.naturalHeight) {
        const ratio = img.naturalWidth / img.naturalHeight;

        // Only span for notably landscape images (wider than 1.3:1)
        if (ratio > 1.3) {
          orientation = "horizontal";
        } else if (ratio < 0.7) {
          // Only span for notably portrait images (taller than 1:1.4)
          orientation = "vertical";
        }
        // Square and near-square images stay 1x1
      }

      const colIndex = index % columns; // 0..columns-1 in current grid

      // If the card is in the last column, avoid horizontal expansion
      if (colIndex === columns - 1 && orientation === "horizontal") {
        orientation = "none";
      }

      // Apply the class
      if (orientation === "horizontal") {
        card.classList.add("bento-card--project--horizontal");
      } else if (orientation === "vertical") {
        card.classList.add("bento-card--project--vertical");
      }
      // "none" means no extra class, card stays 1x1
    });
  }

  function ensureLastInRowNotProject() {
    const columns = getColumnCount();
    if (columns <= 1) return; // Single column layout – nothing to adjust

    const children = Array.from(grid.children).filter((node) =>
      node.classList?.contains("bento-card")
    );

    for (let i = 0; i < children.length; i += columns) {
      const rowEnd = Math.min(i + columns - 1, children.length - 1);
      if (rowEnd < i) continue;

      const last = children[rowEnd];
      if (!last.classList.contains("bento-card--project")) continue;

      // Find a non-project card earlier in the same row
      let replacementIndex = -1;
      for (let j = i; j < rowEnd; j++) {
        if (!children[j].classList.contains("bento-card--project")) {
          replacementIndex = j;
          break;
        }
      }

      if (replacementIndex === -1) continue; // Entire row is projects – nothing we can do

      const replacement = children[replacementIndex];
      swapNodes(last, replacement);

      // Update our local array to match the new DOM order
      children[rowEnd] = replacement;
      children[replacementIndex] = last;
    }
  }

  function setActiveDiscipline(key) {
    disciplineButtons.forEach((btn) => {
      const isActive = btn.dataset.discipline === key;
      if (isActive) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  function renderSkeleton(count = 6) {
    clearProjects();

    for (let i = 0; i < count; i++) {
      const card = document.createElement("article");
      card.className = "bento-card bento-card--project bento-card--skeleton";
      card.innerHTML = `
        <div class="bento-skeleton-thumb"></div>
        <div class="bento-skeleton-line medium"></div>
        <div class="bento-skeleton-line long"></div>
        <div class="bento-skeleton-line short"></div>
      `;
      grid.appendChild(card);
    }
  }

  function buildProjectCard(project) {
    const card = document.createElement("article");
    card.className = "bento-card bento-card--project";
    card.setAttribute("tabindex", "0");

    const description =
      project.projectFeaturedText ||
      project.projectBodyText ||
      "Project description coming soon…";

    const shortDescription =
      description.length > 120 ? `${description.slice(0, 120)}…` : description;

    const disciplineLabel =
      project.category || project.typeOfProject || project.typeOfProduct || "Project";

    card.innerHTML = `
      <a href="/project/${project.id}" aria-label="${project.projectname || "View project"}">
        <img
          class="bento-project-image"
          src="${project.projectFeaturedImage || "/public/images/Chris-Hoofd.webp"}"
          alt="Featured image of ${project.projectname || "project"}"
          loading="lazy"
        />
        <div class="bento-project-overlay">
          <p class="bento-project-chip">${disciplineLabel}</p>
          <h3>${project.projectname || "Untitled project"}</h3>
          <p class="bento-project-description">
            ${shortDescription}
          </p>
        </div>
      </a>
    `;

    // When the image finishes loading, we can better determine its orientation
    const img = card.querySelector(".bento-project-image");
    if (img) {
      img.addEventListener("load", () => {
        applyProjectOrientations();
      });
    }

    // Navigate on Enter or Space when card is focused
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const link = card.querySelector("a");
        if (link) link.click();
      }
    });

    return card;
  }

  function applyFiltersAndSort(projects) {
    let filtered = [...projects];

    // Filter by product type
    if (currentProductType) {
      filtered = filtered.filter(
        (p) => p.typeOfProduct?.toLowerCase() === currentProductType.toLowerCase()
      );
    }

    // Filter by project type
    if (currentProjectType) {
      filtered = filtered.filter(
        (p) => p.typeOfProject?.toLowerCase() === currentProjectType.toLowerCase()
      );
    }

    // Sort
    if (currentSort === "newest") {
      filtered.sort((a, b) => new Date(b.projectDate) - new Date(a.projectDate));
    } else if (currentSort === "oldest") {
      filtered.sort((a, b) => new Date(a.projectDate) - new Date(b.projectDate));
    } else if (currentSort === "name") {
      filtered.sort((a, b) => (a.projectname || "").localeCompare(b.projectname || ""));
    }

    return filtered;
  }

  function renderProjectsForDiscipline(key) {
    let sourceProjects =
      key === "all"
        ? allProjects
        : Array.isArray(projectsByDiscipline[key])
        ? projectsByDiscipline[key]
        : [];

    // Apply extra filters and sorting
    sourceProjects = applyFiltersAndSort(sourceProjects);

    clearProjects();

    if (!sourceProjects || sourceProjects.length === 0) {
      const emptyCard = document.createElement("article");
      emptyCard.className = "bento-card bento-card--empty";
      emptyCard.setAttribute("role", "status");
      emptyCard.innerHTML = `
        <h3>No projects found</h3>
        <p>Try adjusting your filters or view all work.</p>
      `;
      grid.appendChild(emptyCard);
      
      // Announce to screen readers
      announceToScreenReader("No projects found. Try adjusting your filters.");
      return;
    }

    const cards = sourceProjects.map((project) => buildProjectCard(project));
    insertCardsRandomly(cards);
    applyProjectOrientations();
    ensureLastInRowNotProject();
    
    // Announce results to screen readers
    const disciplineName = key === "all" ? "all disciplines" : key.replace(/-/g, " ");
    announceToScreenReader(`Showing ${sourceProjects.length} projects for ${disciplineName}`);
  }

  function handleDisciplineChange(key) {
    currentDiscipline = key;
    setActiveDiscipline(key);
    renderSkeleton();

    // Smooth scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Simulate loading delay for a smoother skeleton effect
    setTimeout(() => {
      renderProjectsForDiscipline(key);
    }, 500);
  }

  function handleFiltersChange() {
    renderSkeleton();
    setTimeout(() => {
      renderProjectsForDiscipline(currentDiscipline);
    }, 300);
  }

  // Wire up click handlers for discipline buttons
  disciplineButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const key = btn.dataset.discipline || "all";
      handleDisciplineChange(key);
    });
  });

  // Wire up extra filter selects
  if (productTypeSelect) {
    productTypeSelect.addEventListener("change", (e) => {
      currentProductType = e.target.value;
      handleFiltersChange();
    });
  }

  if (projectTypeSelect) {
    projectTypeSelect.addEventListener("change", (e) => {
      currentProjectType = e.target.value;
      handleFiltersChange();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      handleFiltersChange();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      currentProductType = "";
      currentProjectType = "";
      currentSort = "newest";
      if (productTypeSelect) productTypeSelect.value = "";
      if (projectTypeSelect) projectTypeSelect.value = "";
      if (sortSelect) sortSelect.value = "newest";
      handleFiltersChange();
      
      // Announce to screen readers
      announceToScreenReader("All filters cleared");
    });
  }

  // Initial render - use discipline from URL or default to "all"
  handleDisciplineChange(currentDiscipline);

  // Re-apply orientations on resize so the last-column fix keeps working
  window.addEventListener("resize", () => {
    applyProjectOrientations();
    ensureLastInRowNotProject();
  });
}

document.addEventListener("DOMContentLoaded", initBentoView);


