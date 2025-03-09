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
    
    // Initialize the platform animation (instead of parallax since we're replacing the image)
    initPlatformAnimation();
});

/**
 * Platform Animation for Hero Section
 * Creates a dynamic animation with platform logos bouncing inside a circular area
 */
function initPlatformAnimation() {
    // Target the hero-image div
    const heroImageDiv = document.querySelector('.hero-image');
    if (!heroImageDiv) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'platform-animation';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    // Replace the static image with our canvas
    heroImageDiv.innerHTML = '';
    heroImageDiv.appendChild(canvas);
    
    // Platform image paths
    const platformImages = [
        'public/assets/platforms/stake.png',
        'public/assets/platforms/rendity.png',
        'public/assets/platforms/bricks.png',
        'public/assets/platforms/brxs.png',
        'public/assets/platforms/moniwan.png',
        'public/assets/platforms/la_premiere_brique.png',
        'public/assets/platforms/corum.png',
        'public/assets/platforms/mintos.png',
        'public/assets/platforms/revolut.png',
        'public/assets/platforms/splint_invest.png',
        'public/assets/platforms/nexo.png',
        'public/assets/platforms/lendermarket.png',
        'public/assets/platforms/swaper.png',
        'public/assets/platforms/goparity.png'
    ];
    
    // Set up canvas context and sizing
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let balls = [];
    
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
        const radius = Math.min(canvas.width, canvas.height) / 2.2; // Slightly smaller to keep within bounds
        
        // Clear existing balls
        balls = [];
        
        // Load all images first
        const imagePromises = platformImages.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        });
        
        Promise.all(imagePromises)
            .then(images => {
                // Create balls with loaded images
                images.forEach(img => {
                    balls.push(new Ball(img, centerX, centerY, radius));
                });
                
                // Start the animation
                animate();
            })
            .catch(error => {
                console.error('Error loading platform images:', error);
                // Fallback: Create colored balls if images fail to load
                for (let i = 0; i < 12; i++) {
                    balls.push(new Ball(null, centerX, centerY, radius));
                }
                animate();
            });
    }
    
    // Ball class representing each platform
    class Ball {
        constructor(image, centerX, centerY, boundaryRadius) {
            this.image = image;
            this.centerX = centerX;
            this.centerY = centerY;
            this.boundaryRadius = boundaryRadius;
            
            // Random starting position within the circle
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (boundaryRadius * 0.8); // Start inside the boundary
            this.x = centerX + distance * Math.cos(angle);
            this.y = centerY + distance * Math.sin(angle);
            
            // Random velocity
            this.dx = (Math.random() - 0.5) * 1.5; // Reduced speed
            this.dy = (Math.random() - 0.5) * 1.5;
            
            // Size based on if we have an image or not
            this.radius = image ? 25 : 20; // Platform logos are a bit larger
            
            // For fallback colored circles
            this.color = image ? null : `hsl(${Math.random() * 360}, 80%, 70%)`;
            
            // Add slight rotation for dynamic feel
            this.rotation = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        }
        
        update() {
            // Move the ball
            this.x += this.dx;
            this.y += this.dy;
            
            // Rotate the image
            this.rotation += this.rotationSpeed;
            
            // Calculate distance from center
            const distFromCenter = Math.hypot(this.x - this.centerX, this.y - this.centerY);
            
            // Bounce if hitting the boundary
            if (distFromCenter + this.radius >= this.boundaryRadius) {
                // Calculate normal vector
                const normalX = (this.x - this.centerX) / distFromCenter;
                const normalY = (this.y - this.centerY) / distFromCenter;
                
                // Calculate reflection
                const dotProduct = this.dx * normalX + this.dy * normalY;
                this.dx -= 2 * dotProduct * normalX;
                this.dy -= 2 * dotProduct * normalY;
                
                // Add a bit of friction/energy loss
                this.dx *= 0.98;
                this.dy *= 0.98;
            }
        }
        
        draw() {
            ctx.save(); // Save the current state
            
            // Translate to the ball's center, rotate, and draw
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            if (this.image) {
                // Draw the platform logo
                const size = this.radius * 2;
                ctx.drawImage(this.image, -size/2, -size/2, size, size);
            } else {
                // Fallback: draw a colored circle
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            
            ctx.restore(); // Restore the state
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Optional: Draw a subtle circular gradient background
        const gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 10,
            canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/2
        );
        gradient.addColorStop(0, 'rgba(10, 30, 64, 0)');  // Center color (transparent)
        gradient.addColorStop(1, 'rgba(10, 30, 64, 0.1)'); // Edge color (slightly visible)
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw all balls
        balls.forEach(ball => {
            ball.update();
            ball.draw();
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
 * Search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('platform-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const platformCards = document.querySelectorAll('.platform-card');
            
            platformCards.forEach(card => {
                const title = card.querySelector('.platform-title').textContent.toLowerCase();
                const description = card.querySelector('.platform-description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'flex';
                    // Add a subtle highlight animation
                    if (searchTerm !== '') {
                        card.classList.add('search-highlight');
                        setTimeout(() => {
                            card.classList.remove('search-highlight');
                        }, 1000);
                    }
                } else {
                    card.style.display = 'none';
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
        });
    }
}

/**
 * Update copyright year
 */
function updateCopyrightYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

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