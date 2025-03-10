/**
 * House of Peers - Main JavaScript
 * Handles all interactions, navigation, UI behavior and animations
 */

// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initAccordions();
    initPlatformCards();
    initSearch();
    updateCopyrightYear();
    addStripeEffect();
    
    // Initialize the platform animation
    initPlatformAnimation();
});














/**
 * Animation de ballons blancs avec rotation de noms d'entreprise - Version corrigée
 */
function initPlatformAnimation() {
    // D'après la capture d'écran, on doit cibler le bon conteneur
    // 1. Essayons d'abord de trouver le div.hero-image existant
    let heroImageDiv = document.querySelector('.hero-image');
    
    // 2. S'il n'existe pas, cherchons un autre conteneur approprié
    if (!heroImageDiv) {
        // Chercher le container dans la section hero
        const heroContainer = document.querySelector('.hero .container');
        
        if (heroContainer) {
            // Vérifier si un div pour l'animation existe déjà
            heroImageDiv = heroContainer.querySelector('.hero-animation-container');
            
            // Sinon, créons un nouveau conteneur pour notre animation
            if (!heroImageDiv) {
                heroImageDiv = document.createElement('div');
                heroImageDiv.className = 'hero-image';
                heroImageDiv.style.width = '50%';  // Définir la largeur
                heroImageDiv.style.height = '400px';  // Définir la hauteur
                heroImageDiv.style.position = 'relative'; // Position relative pour le contenu absolu
                
                // Trouver où insérer le div (après hero-content ou à la fin du container)
                const heroContent = heroContainer.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.after(heroImageDiv);
                } else {
                    heroContainer.appendChild(heroImageDiv);
                }
            }
        }
    }
    
    // Si nous n'avons toujours pas de conteneur, arrêtons
    if (!heroImageDiv) {
        console.warn("Impossible de trouver ou créer un conteneur pour l'animation des ballons");
        return;
    }
    
    // Assurer que le conteneur a une position et une taille appropriées
    heroImageDiv.style.overflow = 'visible';
    if (!heroImageDiv.style.position || heroImageDiv.style.position === 'static') {
        heroImageDiv.style.position = 'relative';
    }
    
    // Créer le canvas à la taille du conteneur
    const canvas = document.createElement('canvas');
    canvas.className = 'platform-animation';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    
    // Vider et ajouter le canvas au conteneur
    heroImageDiv.innerHTML = '';
    heroImageDiv.appendChild(canvas);
    
    // Get platform names from the DOM
    let platformNames = [];
    document.querySelectorAll('.platform-card .platform-title').forEach(titleElement => {
        platformNames.push(titleElement.textContent.trim());
    });

    // Add some default platforms if none found in DOM
    if (platformNames.length === 0) {
        platformNames.push(
            'STAKE', 'RENDITY', 'BRICKS', 'BRXS', 'MONIWAN', 
            'CORUM', 'MINTOS', 'REVOLUT', 'GOPARITY', 'NEXO',
            'SPLINT', 'KONVI', 'ECOTREE', 'N26', 'SWAPER'
        );
    }
    
    // Set up canvas context and sizing
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let balloons = [];
    
    // Number of visible balloons
    const VISIBLE_BALLOONS = 5;
    
    // Resize function to handle responsive behavior
    function resizeCanvas() {
        // Get the actual dimensions of the container
        const rect = heroImageDiv.getBoundingClientRect();
        
        // Set canvas dimensions to match container
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Log sizes for debugging
        console.log("Canvas resized to:", canvas.width, "x", canvas.height);
        
        // Recalculate sizes based on new dimensions
        initAnimation();
    }
    
    // Initialize the animation parameters
    function initAnimation() {
        // Clear any existing animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Clear existing balloons
        balloons = [];
        
        // Create a limited number of balloons
        const numBalloons = Math.min(VISIBLE_BALLOONS, platformNames.length);
        
        // Calculate canvas dimensions and anchor point
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const anchorY = canvasHeight; // Bottom of the canvas for the anchor points
        
        // Distribute balloons evenly across the width
        const spacing = canvasWidth / (numBalloons + 1);
        
        for (let i = 0; i < numBalloons; i++) {
            // Calculate anchor position (evenly spaced along bottom)
            const anchorX = spacing * (i + 1);
            
            // Create balloon with different heights, swing speeds, and rotation speeds
            const height = canvasHeight * (0.4 + Math.random() * 0.4); // Random height 40-80% of canvas
            const swingFrequency = 0.3 + Math.random() * 0.6; // Different swing speeds (slower)
            const swingAmplitude = 20 + Math.random() * 30; // Different swing amplitudes (reduced)
            const rotationSpeed = 0.1 + Math.random() * 0.2; // Different rotation speeds (slower)
            
            // Create the balloon
            balloons.push(new Balloon(
                platformNames,
                anchorX,
                anchorY,
                height,
                swingFrequency,
                swingAmplitude,
                rotationSpeed,
                i // Starting platform index offset for variety
            ));
        }
        
        // Start the animation
        animate(0);
    }
    
    // Balloon class
    class Balloon {
        constructor(platforms, anchorX, anchorY, stringLength, swingFrequency, swingAmplitude, rotationSpeed, startOffset) {
            this.platforms = platforms;
            
            // Anchor point (bottom of the string)
            this.anchorX = anchorX;
            this.anchorY = anchorY;
            
            // Balloon properties
            this.stringLength = stringLength;
            this.currentPlatformIndex = (startOffset * 3) % platforms.length; // Offset to start with different platforms
            this.swingPhase = Math.random() * Math.PI * 2; // Random starting phase
            this.swingFrequency = swingFrequency; // How fast it swings
            this.swingAmplitude = swingAmplitude; // How wide it swings
            
            // Rotation properties for the 3D effect
            this.rotationPhase = Math.random() * Math.PI * 2; // Random starting rotation
            this.rotationSpeed = rotationSpeed; // How fast it rotates
            
            // Calculate balloon position based on string length and angle
            this.x = this.anchorX;
            this.y = this.anchorY - this.stringLength;
            
            // Balloon size (proportional to string length but with limits)
            this.radius = Math.min(50, Math.max(35, stringLength / 10));
            
            // Visual properties
            this.color = '#ffffff';
            this.stringColor = 'rgba(0, 0, 0, 0.6)';
            this.stringWidth = 1.5;
            this.shadow = {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 3,
                offsetY: 6,
                blur: 8
            };
            
            // Side selection for name display (front/back)
            this.currentSide = 0; // 0 = front, 1 = back
            this.nextChangeTime = 3 + Math.random() * 2; // Random time to first flip
            this.changeTimePassed = 0;
            
            // Different platforms on each side
            this.frontPlatformIndex = this.currentPlatformIndex;
            this.backPlatformIndex = (this.currentPlatformIndex + Math.floor(platforms.length / 2)) % platforms.length;
            
            // Balloon tilt for realistic swinging
            this.tiltAngle = 0;
        }
        
        update(deltaTime) {
            // Update swing phase
            this.swingPhase += this.swingFrequency * deltaTime;
            
            // Calculate the current swing angle
            const swingAngle = Math.sin(this.swingPhase) * (this.swingAmplitude * Math.PI / 180);
            
            // Update tilt angle based on swing motion (balloon tilts into the swing direction)
            this.tiltAngle = Math.sin(this.swingPhase + Math.PI / 2) * 0.15; // Slight tilt for realism
            
            // Calculate new balloon position with the pendulum motion
            this.x = this.anchorX + Math.sin(swingAngle) * this.stringLength;
            this.y = this.anchorY - Math.cos(swingAngle) * this.stringLength;
            
            // Update rotation for 3D effect
            this.rotationPhase += this.rotationSpeed * deltaTime;
            
            // Track time to change the displayed platform names
            this.changeTimePassed += deltaTime;
            if (this.changeTimePassed >= this.nextChangeTime) {
                // Update platform indices
                this.frontPlatformIndex = (this.frontPlatformIndex + 1) % this.platforms.length;
                this.backPlatformIndex = (this.backPlatformIndex + 1) % this.platforms.length;
                
                // Reset timer and set new random change time
                this.changeTimePassed = 0;
                this.nextChangeTime = 3 + Math.random() * 2; // Every 3-5 seconds
            }
            
            // Calculate which side is visible based on rotation
            const normalizedRotation = ((this.rotationPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            this.currentSide = normalizedRotation < Math.PI ? 0 : 1; // Front or back
        }
        
        draw(ctx) {
            // Save the current state
            ctx.save();
            
            // Draw the string
            ctx.beginPath();
            ctx.moveTo(this.anchorX, this.anchorY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.stringColor;
            ctx.lineWidth = this.stringWidth;
            ctx.stroke();
            
            // Move to balloon position
            ctx.translate(this.x, this.y);
            
            // Apply tilt for realistic swinging
            ctx.rotate(this.tiltAngle);
            
            // Calculate 3D scale factor based on rotation (simulating perspective)
            const rotationVisibility = Math.abs(Math.cos(this.rotationPhase));
            const scaleX = 0.6 + 0.4 * rotationVisibility; // Scale between 60-100% based on rotation
            
            // Apply the scale transformation
            ctx.scale(scaleX, 1);
            
            // Apply shadow
            ctx.shadowColor = this.shadow.color;
            ctx.shadowOffsetX = this.shadow.offsetX;
            ctx.shadowOffsetY = this.shadow.offsetY;
            ctx.shadowBlur = this.shadow.blur;
            
            // Draw the balloon (oval shape)
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 1.2, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Draw the knot at the bottom of the balloon
            ctx.beginPath();
            ctx.arc(0, this.radius, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#f0f0f0';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.fill();
            ctx.stroke();
            
            // Remove shadow for the text
            ctx.shadowColor = 'transparent';
            
            // Determine which text to display based on visible side
            const platformText = this.currentSide === 0 
                ? this.platforms[this.frontPlatformIndex] 
                : this.platforms[this.backPlatformIndex];
            
            // Calculate optimal font size based on balloon size and text length
            const textLength = platformText.length;
            const maxWidth = this.radius * 1.6 * scaleX; // Account for the 3D scaling
            let fontSize = Math.min(
                this.radius * 0.6,
                maxWidth / (textLength * 0.6)
            );
            fontSize = Math.max(12, fontSize); // Minimum font size for readability
            
            // Draw platform name with opacity based on rotation for 3D effect
            ctx.fillStyle = `rgba(10, 30, 64, ${0.7 + 0.3 * rotationVisibility})`; // Text gets lighter when balloon turns
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${fontSize}px 'Nobile', sans-serif`;
            
            // Draw text slightly above center for better balloon aesthetics
            ctx.fillText(platformText, 0, -this.radius * 0.1);
            
            // Add a highlight on the balloon for 3D effect
            const highlightX = -this.radius * 0.3;
            const highlightY = -this.radius * 0.4;
            const highlightRadiusX = this.radius * 0.4;
            const highlightRadiusY = this.radius * 0.3;
            
            ctx.beginPath();
            ctx.ellipse(highlightX, highlightY, highlightRadiusX, highlightRadiusY, -Math.PI/4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();
            
            // Restore the original state
            ctx.restore();
        }
    }
    
    // Animation timing variables
    let lastTime = 0;
    
    // Animation loop
    function animate(currentTime) {
        // Convert to seconds
        currentTime *= 0.001;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw all balloons
        balloons.forEach(balloon => {
            balloon.update(deltaTime);
            balloon.draw(ctx);
        });
        
        // Continue animation
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Add a debug button to manually test the animation (will be removed in production)
    function addDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Réinitialiser l\'animation';
        debugBtn.style.position = 'fixed';
        debugBtn.style.zIndex = '9999';
        debugBtn.style.bottom = '10px';
        debugBtn.style.right = '10px';
        debugBtn.style.padding = '5px 10px';
        debugBtn.style.background = '#1A3A6A';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.cursor = 'pointer';
        debugBtn.onclick = resizeCanvas;
        document.body.appendChild(debugBtn);
    }
    
    // Uncomment this line to add a debug button during development
    // addDebugButton();
    
    // Handle window resize
    window.addEventListener('resize', debounce(resizeCanvas, 250));
    
    // Initial setup
    resizeCanvas();
    
    // Apply fade effect to hero content on scroll
    if (typeof applyHeroContentFade === 'function') {
        applyHeroContentFade();
    }
}













/**
 * Apply fade effect to hero content on scroll (simplified from parallax)
 */
function applyHeroContentFade() {
    const heroContent = document.querySelector('.hero-content');
    const hero = document.querySelector('.hero');
    
    if (!heroContent || !hero) return;
    
    // Add fade effect on scroll
    window.addEventListener('scroll', function() {
        // Only apply effect if hero section is visible
        const heroRect = hero.getBoundingClientRect();
        if (heroRect.bottom < 0) return; // Hero is above viewport
        
        const scroll = window.scrollY;
        
        // Smoother opacity transition
        if (scroll < 600) {
            const opacity = Math.max(0.2, 1 - (scroll / 700));
            heroContent.style.opacity = opacity;
        }
    });
}

/**
 * Mobile Navigation
 */
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navList.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navList.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Add scrolled class to header when scrolling down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
    });

    // Add scrolled class immediately if page is already scrolled
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Update active nav link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Get current scroll position
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    // Find the current section
    sections.forEach(section => {
        const sectionTop = section.offsetTop - document.querySelector('.header').offsetHeight;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            // Remove active class from all links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to corresponding nav link
            const currentId = section.getAttribute('id');
            document.querySelector(`.nav-link[href="#${currentId}"]`)?.classList.add('active');
        }
    });
}









/**
 * Platform of the Month functionality
 * Creates a special enhanced display for the featured platform
 */
function initRandomPlatformOfMonth() {
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = now.getFullYear();
    
    // Array of month names
    const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    
    // Update month badge
    const monthNameEl = document.querySelector('.month-name');
    const yearNumberEl = document.querySelector('.year-number');
    
    if (monthNameEl) {
        monthNameEl.textContent = monthNames[currentMonth];
    }
    
    if (yearNumberEl) {
        yearNumberEl.textContent = currentYear.toString();
    }
    
    // Collect all platform cards from the page
    let allPlatformCards = document.querySelectorAll('.platforms .platform-card');
    
    // If no cards found yet (page might still be loading), set a retry
    if (allPlatformCards.length === 0) {
        setTimeout(initRandomPlatformOfMonth, 500);
        return;
    }
    
    // Convert NodeList to Array
    allPlatformCards = Array.from(allPlatformCards);
    
    // Use the current month and year as a seed for the random selection
    const seed = currentMonth + currentYear * 12;
    const randomIndex = seededRandom(0, allPlatformCards.length - 1, seed);
    
    // Select a random platform card
    const selectedCard = allPlatformCards[randomIndex];
    
    // If we found a card, create an enhanced version
    if (selectedCard) {
        const container = document.getElementById('featured-platform-container');
        if (container) {
            // Extract data from the selected card
            const platformTitle = selectedCard.querySelector('.platform-title')?.textContent || 'Featured Platform';
            const platformDescription = selectedCard.querySelector('.platform-description')?.textContent || '';
            const investmentTag = selectedCard.querySelector('.investment-tag')?.textContent || '';
            const primaryAction = selectedCard.querySelector('.platform-actions a')?.href || '#';
            const primaryActionText = selectedCard.querySelector('.platform-actions a')?.textContent || 'INVEST NOW';
            
            // Get flags
            const flags = selectedCard.querySelectorAll('.platform-flags img');
            const flagUrls = [];
            flags.forEach(flag => {
                flagUrls.push({
                    src: flag.src,
                    alt: flag.alt,
                    title: flag.title
                });
            });
            
            // Determine category based on platform type or parent section
            const platformType = selectedCard.dataset.platform || '';
            let categoryLink = '#real-estate'; // Default
            
            if (platformType.includes('bricks') || platformType.includes('rendity') || 
                platformType.includes('brxs') || platformType.includes('stake')) {
                categoryLink = '#real-estate';
            } else if (platformType.includes('mintos') || platformType.includes('goparity')) {
                categoryLink = '#sme-crowd';
            } else if (platformType.includes('revolut') || platformType.includes('nexo')) {
                categoryLink = '#money';
            } else if (platformType.includes('splint') || platformType.includes('timeless')) {
                categoryLink = '#alternative';
            } else if (platformType.includes('augment')) {
                categoryLink = '#livestyle';
            }
            
            // Generate benefits based on platform type
            const benefits = [];
            
            // Add platform-specific benefits
            if (platformType.includes('stake') || platformType.includes('bricks') || 
                platformType.includes('brxs') || platformType.includes('rendity')) {
                benefits.push('Fractional real estate ownership');
                benefits.push('Regular passive income from rental yields');
                benefits.push('Long-term appreciation potential');
            } else if (platformType.includes('mintos') || platformType.includes('goparity')) {
                benefits.push('Diversified lending opportunities');
                benefits.push('Fixed returns on investments');
                benefits.push('Support for small and medium enterprises');
            } else if (platformType.includes('revolut') || platformType.includes('nexo')) {
                benefits.push('Modern digital financial services');
                benefits.push('Easy to use mobile applications');
                benefits.push('Competitive rates and fees');
            } else if (platformType.includes('splint') || platformType.includes('timeless')) {
                benefits.push('Access to unique asset classes');
                benefits.push('Portfolio diversification opportunities');
                benefits.push('Historically uncorrelated with markets');
            } else if (platformType.includes('augment')) {
                benefits.push('Hassle-free subscription service');
                benefits.push('All maintenance included');
                benefits.push('Environmentally friendly transportation');
            } else {
                benefits.push('Exclusive investment opportunities');
                benefits.push('Professional portfolio management');
                benefits.push('Competitive returns on investment');
            }
            
            // Create new HTML structure for the enhanced featured platform
            const featuredPlatformHTML = `
                <div class="featured-platform">
                    <div class="featured-platform-badge">FEATURED THIS MONTH</div>
                    
                    <div class="featured-platform-image">
                        <img class="platform-logo" src="./public/assets/platforms/${platformType || 'default'}.png" alt="${platformTitle}" onerror="this.src='./public/assets/platforms/default.png';">
                        
                        <div class="flags-container">
                            ${flagUrls.map(flag => `
                                <img src="${flag.src}" alt="${flag.alt}" title="${flag.title}" class="featured-flag">
                            `).join('')}
                        </div>
                        
                        <div class="featured-investment-tag">${investmentTag}</div>
                    </div>
                    
                    <div class="featured-platform-content">
                        <h3 class="featured-platform-title">${platformTitle}</h3>
                        <p class="featured-platform-description">${platformDescription}</p>
                        
                        <div class="featured-benefits">
                            ${benefits.map(benefit => `
                                <div class="benefit-item">
                                    <div class="benefit-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div class="benefit-text">${benefit}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="featured-actions">
                            <a href="${primaryAction}" target="_blank" class="featured-btn featured-btn-primary">${primaryActionText}</a>
                            <a href="${categoryLink}" class="featured-btn featured-btn-outline">VIEW CATEGORY</a>
                        </div>
                    </div>
                </div>
            `;
            
            // Set the HTML to the container
            container.innerHTML = featuredPlatformHTML;
        }
    }
}

/**
 * Seeded random number generator for consistent results based on seeds
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {number} seed - Seed for randomization
 * @returns {number} - Random integer between min and max
 */
function seededRandom(min, max, seed) {
    // Simple seeded random function
    const seedValue = (seed * 9301 + 49297) % 233280;
    const rnd = seedValue / 233280.0;
    
    return Math.floor(min + rnd * (max - min + 1));
}

// Add this to your document ready function
document.addEventListener('DOMContentLoaded', () => {
    // Your existing initializations
    // ...
    
    // Initialize Random Platform of the Month
    // Slight delay to ensure all platform cards are loaded
    setTimeout(initRandomPlatformOfMonth, 100);
});











/**
 * Accordion functionality
 */
function initAccordions() {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    const disclaimerTrigger = document.querySelector('.disclaimer-trigger');
    
    // General accordions
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const accordion = trigger.closest('.accordion-item');
            const isActive = accordion.classList.contains('active');
            
            // If in an accordion group, close other accordions
            const accordionGroup = accordion.closest('.info-accordion, .detail-accordions');
            if (accordionGroup) {
                accordionGroup.querySelectorAll('.accordion-item.active').forEach(item => {
                    if (item !== accordion) {
                        item.classList.remove('active');
                        const trigger = item.querySelector('.accordion-trigger');
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                });
            }
            
            // Toggle current accordion
            accordion.classList.toggle('active');
            trigger.setAttribute('aria-expanded', !isActive);
        });
    });
    
    // Footer disclaimer accordion
    if (disclaimerTrigger) {
        disclaimerTrigger.addEventListener('click', () => {
            const accordion = disclaimerTrigger.closest('.disclaimer-accordion');
            const isActive = accordion.classList.contains('active');
            
            accordion.classList.toggle('active');
            disclaimerTrigger.setAttribute('aria-expanded', !isActive);
        });
    }
}

/**
 * Platform cards and detail toggle
 */
function initPlatformCards() {
    const detailButtons = document.querySelectorAll('.toggle-details');
    
    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.platform-card');
            const isExpanded = card.classList.contains('expanded');
            
            card.classList.toggle('expanded');
            button.textContent = isExpanded ? 'DETAILS' : 'CLOSE';
            
            // Scroll to card if it's now expanded
            if (!isExpanded) {
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    const loadMoreButton = document.querySelector('.load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', (e) => {
            e.preventDefault();
            // This would typically load more platforms via AJAX
            // For now, we'll just show a message
            loadMoreButton.textContent = 'NO MORE PLATFORMS AVAILABLE';
            loadMoreButton.disabled = true;
        });
    }
}

/**
 * Enhanced search functionality that only searches platform titles
 * Replace your existing initSearch() function with this implementation
 */
function initSearch() {
    const searchInput = document.getElementById('platform-search');
    const searchSection = document.querySelector('.search-section');
    
    if (!searchInput) return;
    
    // Create UI elements for search functionality
    const searchWrapper = document.querySelector('.search-wrapper');
    
    // Create notification element
    const searchNotification = document.createElement('div');
    searchNotification.className = 'search-notification';
    searchNotification.style.display = 'none';
    
    // Create autocomplete container
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-container';
    
    // Insert elements into the DOM
    if (searchWrapper) {
        searchWrapper.after(searchNotification);
        searchWrapper.appendChild(autocompleteContainer);
    }
    
    // Build a list of all platform titles
    let platformData = [];
    let platformTitles = [];
    
    function collectPlatformData() {
        platformData = [];
        platformTitles = [];
        
        document.querySelectorAll('.platform-card').forEach(card => {
            const titleElement = card.querySelector('.platform-title');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                
                // Add the platform data
                platformData.push({
                    title: title,
                    element: card
                });
                
                // Add title to searchable terms (for autocomplete)
                platformTitles.push(title.toLowerCase());
            }
        });
    }
    
    // Collect initial platform data
    collectPlatformData();
    
    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let totalResults = 0;
        
        // Clear previous notification
        searchNotification.style.display = 'none';
        
        // Show suggestions or hide them based on search term
        if (searchTerm.length > 0) {
            showSuggestions(searchTerm);
        } else {
            autocompleteContainer.innerHTML = '';
            autocompleteContainer.style.display = 'none';
        }
        
        // Handle empty search
        if (searchTerm === '') {
            // Show all cards when search is cleared
            platformData.forEach(platform => {
                platform.element.style.display = 'flex';
                platform.element.classList.remove('search-highlight');
            });
            
            // Remove no-results messages
            document.querySelectorAll('.no-results').forEach(el => el.remove());
            return;
        }
        
        // Process search - only matching against platform titles
        platformData.forEach(platform => {
            const titleMatch = platform.title.toLowerCase().includes(searchTerm);
            
            if (titleMatch) {
                platform.element.style.display = 'flex';
                totalResults++;
                
                // Add a subtle highlight animation
                platform.element.classList.add('search-highlight');
                setTimeout(() => {
                    platform.element.classList.remove('search-highlight');
                }, 1000);
            } else {
                platform.element.style.display = 'none';
            }
        });
        
        // Check if no results were found in visible sections
        const platformSections = document.querySelectorAll('.platforms');
        platformSections.forEach(section => {
            const visibleCards = Array.from(section.querySelectorAll('.platform-card')).filter(card => card.style.display !== 'none');
            
            const noResultsEl = section.querySelector('.no-results');
            
            if (visibleCards.length === 0 && searchTerm !== '') {
                if (!noResultsEl) {
                    const noResults = document.createElement('p');
                    noResults.className = 'no-results';
                    noResults.textContent = 'No platforms match your search criteria';
                    section.querySelector('.platform-grid, .platform-preview')?.after(noResults);
                }
            } else if (noResultsEl) {
                noResultsEl.remove();
            }
        });
        
        // Display search results notification
        if (searchTerm !== '') {
            if (totalResults > 0) {
                searchNotification.textContent = `Found ${totalResults} platform${totalResults !== 1 ? 's' : ''} for "${searchTerm}"`;
                searchNotification.className = 'search-notification search-success';
            } else {
                searchNotification.textContent = `No platforms found for "${searchTerm}"`;
                searchNotification.className = 'search-notification search-empty';
            }
            searchNotification.style.display = 'block';
            
            // Auto-hide notification after 5 seconds
            setTimeout(() => {
                searchNotification.style.opacity = '0';
                setTimeout(() => {
                    if (searchInput.value.toLowerCase().trim() !== searchTerm) {
                        searchNotification.style.display = 'none';
                        searchNotification.style.opacity = '1';
                    }
                }, 500);
            }, 5000);
        }
    });
    
    // Function to show autocomplete suggestions
    function showSuggestions(searchTerm) {
        // Clear previous suggestions
        autocompleteContainer.innerHTML = '';
        
        // Find matching platform titles
        const matches = platformTitles.filter(title => 
            title.includes(searchTerm)
        );
        
        // Sort matches by relevance (starts with > contains)
        matches.sort((a, b) => {
            const aStartsWith = a.startsWith(searchTerm);
            const bStartsWith = b.startsWith(searchTerm);
            
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            
            return 0;
        });
        
        // Limit to 5 suggestions
        const limitedMatches = matches.slice(0, 5);
        
        if (limitedMatches.length > 0) {
            // Create suggestion elements
            limitedMatches.forEach(match => {
                const suggestion = document.createElement('div');
                suggestion.className = 'autocomplete-suggestion';
                
                // Highlight the matching part
                const matchIndex = match.indexOf(searchTerm);
                const beforeMatch = match.substring(0, matchIndex);
                const matchPart = match.substring(matchIndex, matchIndex + searchTerm.length);
                const afterMatch = match.substring(matchIndex + searchTerm.length);
                
                suggestion.innerHTML = `${beforeMatch}<strong>${matchPart}</strong>${afterMatch}`;
                
                // Add click handler
                suggestion.addEventListener('click', () => {
                    searchInput.value = match;
                    autocompleteContainer.innerHTML = '';
                    autocompleteContainer.style.display = 'none';
                    // Trigger search with the selected term
                    searchInput.dispatchEvent(new Event('input'));
                });
                
                autocompleteContainer.appendChild(suggestion);
            });
            
            autocompleteContainer.style.display = 'block';
        } else {
            autocompleteContainer.style.display = 'none';
        }
    }
    
    // Handle keyboard navigation for autocomplete
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = autocompleteContainer.querySelectorAll('.autocomplete-suggestion');
        if (!suggestions.length) return;
        
        // Find currently selected suggestion
        const currentSelected = autocompleteContainer.querySelector('.selected');
        let currentIndex = -1;
        
        if (currentSelected) {
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i] === currentSelected) {
                    currentIndex = i;
                    break;
                }
            }
        }
        
        // Handle arrow keys, enter, and escape
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < suggestions.length - 1) {
                    if (currentSelected) currentSelected.classList.remove('selected');
                    suggestions[currentIndex + 1].classList.add('selected');
                } else {
                    if (currentSelected) currentSelected.classList.remove('selected');
                    suggestions[0].classList.add('selected');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    if (currentSelected) currentSelected.classList.remove('selected');
                    suggestions[currentIndex - 1].classList.add('selected');
                } else {
                    if (currentSelected) currentSelected.classList.remove('selected');
                    suggestions[suggestions.length - 1].classList.add('selected');
                }
                break;
                
            case 'Enter':
                if (currentSelected) {
                    e.preventDefault();
                    searchInput.value = currentSelected.textContent;
                    autocompleteContainer.innerHTML = '';
                    autocompleteContainer.style.display = 'none';
                    searchInput.dispatchEvent(new Event('input'));
                }
                break;
                
            case 'Escape':
                autocompleteContainer.innerHTML = '';
                autocompleteContainer.style.display = 'none';
                searchInput.value = '';
                // Trigger input event to update results
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
                break;
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchWrapper.contains(e.target)) {
            autocompleteContainer.style.display = 'none';
        }
    });
    
    // Refresh platform data if content changes
    document.addEventListener('DOMContentLoaded', collectPlatformData);
    window.addEventListener('load', collectPlatformData);
}


/**
 * Automatically updates the year in the copyright footer
 * This script can be included in your main JavaScript file
 */
function updateCopyrightYear() {
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Find all elements that should display the year
    const yearElements = document.querySelectorAll('.copyright-year');
    
    // If no specific elements with .copyright-year class are found, look for the footer year element by ID
    if (yearElements.length === 0) {
        const footerYearEl = document.getElementById('current-year');
        if (footerYearEl) {
            footerYearEl.textContent = currentYear.toString();
        }
    } else {
        // Update all elements with the .copyright-year class
        yearElements.forEach(element => {
            element.textContent = currentYear.toString();
        });
    }
}
// Run this when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', updateCopyrightYear);

/**
 * Add stripe effect to platform cards (inspired by Kappa jersey pattern)
 */
function addStripeEffect() {
    const platformCards = document.querySelectorAll('.platform-card');
    
    platformCards.forEach(card => {
        // Create stripe overlay
        const stripeOverlay = document.createElement('div');
        stripeOverlay.className = 'stripe-overlay';
        card.appendChild(stripeOverlay);
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            stripeOverlay.classList.add('active');
        });
        
        card.addEventListener('mouseleave', () => {
            stripeOverlay.classList.remove('active');
        });
    });
}

/**
 * Debounce utility function to prevent excessive calculations
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}