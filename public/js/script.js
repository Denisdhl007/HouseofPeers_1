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
 * Enhanced Platform Animation for Hero Section
 * Creates a refined animation with platform logos floating like balloons
 */
function initPlatformAnimation() {
    // Target the hero-image div
    const heroImageDiv = document.querySelector('.hero-image');
    if (!heroImageDiv) return;
    
    // Add a background gradient layer
    const bgLayer = document.createElement('div');
    bgLayer.className = 'hero-animation-background';
    heroImageDiv.appendChild(bgLayer);
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'platform-animation';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    // Append the canvas to our container
    heroImageDiv.appendChild(canvas);
    
    // Platform image paths - Fixed to use correct relative paths
    const platformImages = [
        './public/assets/platforms/stake.png',
        './public/assets/platforms/rendity.png',
        './public/assets/platforms/bricks.png',
        './public/assets/platforms/brxs.png',
        './public/assets/platforms/moniwan.png',
        './public/assets/platforms/la_premiere_brique.png',
        './public/assets/platforms/corum.png',
        './public/assets/platforms/mintos.png',
        './public/assets/platforms/revolut.png',
        './public/assets/platforms/splint_invest.png',
        './public/assets/platforms/nexo.png',
        './public/assets/platforms/lendermarket.png',
        './public/assets/platforms/swaper.png',
        './public/assets/platforms/goparity.png'
    ];
    
    // Set up canvas context and sizing
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let balloons = [];
    
    // Resize function to handle responsive behavior
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Recalculate circle size based on new dimensions
        initAnimation();
    }
    
    // Initialize the animation parameters
    function initAnimation() {
        // Clear any existing animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Set up the animation area
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2.2; // Boundary radius
        
        // Clear existing balloons
        balloons = [];
        
        // Load all images first
        const imagePromises = platformImages.map((src, index) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    resolve(img);
                };
                img.onerror = (error) => {
                    console.error(`Failed to load image: ${src}`, error);
                    // Try again with absolute path as fallback
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => {
                        resolve(fallbackImg);
                    };
                    fallbackImg.onerror = () => {
                        reject(new Error(`Failed to load image: ${src}`));
                    };
                    fallbackImg.src = src.replace('./public/', '/');
                };
                img.src = src;
            });
        });
        
        Promise.all(imagePromises)
            .then(images => {
                // Create balloons with loaded images
                images.forEach((img, index) => {
                    // More distributed starting positions
                    const angle = (index / images.length) * Math.PI * 2;
                    const distance = radius * 0.6 * Math.random() + 0.2 * radius;
                    
                    balloons.push(new Balloon(
                        img, 
                        centerX + distance * Math.cos(angle),
                        centerY + distance * Math.sin(angle),
                        centerX,
                        centerY,
                        radius
                    ));
                });
                
                // Start the animation
                animate();
            })
            .catch(error => {
                console.error('Error loading platform images:', error);
                // Fallback: Create colored circles if images fail to load
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const distance = radius * 0.6 * Math.random() + 0.2 * radius;
                    
                    balloons.push(new Balloon(
                        null, 
                        centerX + distance * Math.cos(angle),
                        centerY + distance * Math.sin(angle),
                        centerX,
                        centerY,
                        radius
                    ));
                }
                animate();
            });
    }
    
    // Enhanced Balloon class (previously Ball)
    class Balloon {
        constructor(image, x, y, centerX, centerY, boundaryRadius) {
            this.image = image;
            this.x = x;
            this.y = y;
            this.centerX = centerX;
            this.centerY = centerY;
            this.boundaryRadius = boundaryRadius;
            
            // Smaller, smoother velocities
            this.dx = (Math.random() - 0.5) * 0.7; // Reduced speed
            this.dy = (Math.random() - 0.5) * 0.7;
            
            // Size based on screen size
            this.radius = image ? 
                Math.min(35, Math.max(25, canvas.width / 25)) : 
                Math.min(25, Math.max(15, canvas.width / 30));
            
            // Balloon styling
            this.shadow = {
                color: 'rgba(0,0,0,0.15)',
                offsetX: 2,
                offsetY: 4,
                blur: 5
            };
            
            // For fallback colored circles
            this.color = image ? null : `hsl(${Math.random() * 360}, 85%, 75%)`;
            
            // Add slight rotation for dynamic feel
            this.rotation = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02; // Slower rotation
            
            // Add subtle floating effect
            this.floatOffset = 0;
            this.floatSpeed = 0.01 + Math.random() * 0.01;
            this.floatAmplitude = 0.5 + Math.random() * 1.5;
            
            // Optional: Add slight pulsing effect
            this.pulse = 0;
            this.pulseSpeed = 0.02 + Math.random() * 0.02;
            this.pulseAmplitude = 0.05 + Math.random() * 0.1;
        }
        
        update() {
            // Update floating effect
            this.floatOffset += this.floatSpeed;
            this.pulse += this.pulseSpeed;
            
            // Calculate floating movement
            const floatingY = Math.sin(this.floatOffset) * this.floatAmplitude;
            const pulseScale = 1 + Math.sin(this.pulse) * this.pulseAmplitude;
            
            // Move the balloon (slower movement)
            this.x += this.dx;
            this.y += this.dy + floatingY * 0.1;
            
            // Rotate the image
            this.rotation += this.rotationSpeed;
            
            // Calculate distance from center
            const distFromCenter = Math.hypot(this.x - this.centerX, this.y - this.centerY);
            
            // Soft boundary approach - gradually steer back when approaching the boundary
            if (distFromCenter > this.boundaryRadius * 0.7) {
                // Calculate vector toward center
                const towardCenterX = (this.centerX - this.x) / distFromCenter;
                const towardCenterY = (this.centerY - this.y) / distFromCenter;
                
                // Strength of correction increases as we approach the boundary
                const correctionStrength = Math.min(0.05, (distFromCenter - this.boundaryRadius * 0.7) / (this.boundaryRadius * 0.3) * 0.05);
                
                // Apply soft correction
                this.dx += towardCenterX * correctionStrength;
                this.dy += towardCenterY * correctionStrength;
                
                // Apply slight damping for stability
                this.dx *= 0.995;
                this.dy *= 0.995;
            }
            
            // Hard boundary (safety measure)
            if (distFromCenter + this.radius >= this.boundaryRadius) {
                // Calculate normal vector
                const normalX = (this.x - this.centerX) / distFromCenter;
                const normalY = (this.y - this.centerY) / distFromCenter;
                
                // Calculate reflection
                const dotProduct = this.dx * normalX + this.dy * normalY;
                this.dx -= 2 * dotProduct * normalX;
                this.dy -= 2 * dotProduct * normalY;
                
                // Add a bit of friction/energy loss
                this.dx *= 0.8;
                this.dy *= 0.8;
            }
            
            return { floatingY, pulseScale };
        }
        
        draw(floatingY, pulseScale) {
            ctx.save(); // Save the current state
            
            // Translate to the balloon's center, rotate, and apply pulse
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(pulseScale, pulseScale);
            
            if (this.image) {
                // Calculate size with slight variation
                const size = this.radius * 2;
                
                // Draw shadow (subtle)
                ctx.shadowColor = this.shadow.color;
                ctx.shadowOffsetX = this.shadow.offsetX;
                ctx.shadowOffsetY = this.shadow.offsetY;
                ctx.shadowBlur = this.shadow.blur;
                
                // Draw the platform logo with subtle balloon-like styling
                // First draw a circle behind the logo for a balloon-like effect
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.95, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
                ctx.fill();
                
                // Remove shadow for the image itself
                ctx.shadowColor = 'transparent';
                
                // Draw the logo image
                ctx.drawImage(this.image, -size/2, -size/2, size, size);
                
                // Optional: Add a subtle highlight for balloon effect
                ctx.beginPath();
                ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fill();
            } else {
                // Fallback: draw a colored circle with balloon styling
                
                // Draw shadow
                ctx.shadowColor = this.shadow.color;
                ctx.shadowOffsetX = this.shadow.offsetX;
                ctx.shadowOffsetY = this.shadow.offsetY;
                ctx.shadowBlur = this.shadow.blur;
                
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                
                // Add highlight
                ctx.beginPath();
                ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
            
            ctx.restore(); // Restore the state
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a subtle radial gradient background
        const gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 10,
            canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/2
        );
        gradient.addColorStop(0, 'rgba(10, 30, 64, 0)');  // Center color (transparent)
        gradient.addColorStop(1, 'rgba(10, 30, 64, 0.05)'); // Edge color (slightly visible)
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw all balloons
        balloons.forEach(balloon => {
            const { floatingY, pulseScale } = balloon.update();
            balloon.draw(floatingY, pulseScale);
        });
        
        // Continue animation
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Handle window resize
    window.addEventListener('resize', debounce(resizeCanvas, 250));
    
    // Initial setup
    resizeCanvas();
    
    // Apply fade effect to hero content on scroll
    applyHeroContentFade();
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