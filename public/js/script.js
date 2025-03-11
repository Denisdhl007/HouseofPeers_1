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
 * Enhanced balloon animation with improved cord-knot connection and subtly clickable balloons
 */
function initPlatformAnimation() {
    // Find the container for the animation
    let heroImageDiv = document.querySelector('.hero-image');
    
    // If container doesn't exist, try to find or create one
    if (!heroImageDiv) {
        const heroContainer = document.querySelector('.hero .container');
        
        if (heroContainer) {
            heroImageDiv = heroContainer.querySelector('.hero-animation-container');
            
            if (!heroImageDiv) {
                heroImageDiv = document.createElement('div');
                heroImageDiv.className = 'hero-image';
                heroImageDiv.style.width = '50%';
                heroImageDiv.style.height = '400px';
                heroImageDiv.style.position = 'relative';
                
                const heroContent = heroContainer.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.after(heroImageDiv);
                } else {
                    heroContainer.appendChild(heroImageDiv);
                }
            }
        }
    }
    
    // If we still don't have a container, stop
    if (!heroImageDiv) {
        console.warn("Impossible de trouver ou créer un conteneur pour l'animation des ballons");
        return;
    }
    
    // Ensure container has proper styling
    heroImageDiv.style.overflow = 'visible';
    if (!heroImageDiv.style.position || heroImageDiv.style.position === 'static') {
        heroImageDiv.style.position = 'relative';
    }
    
    // Create the canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'platform-animation';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    
    // Set cursor to pointer to indicate clickable area
    canvas.style.cursor = 'pointer';
    
    // Clear and add canvas to container
    heroImageDiv.innerHTML = '';
    heroImageDiv.appendChild(canvas);
    
    // Get platform names from the DOM - collecting all available platforms
    let platformData = [];
    document.querySelectorAll('.platform-card').forEach(card => {
        const titleElement = card.querySelector('.platform-title');
        if (titleElement) {
            platformData.push({
                name: titleElement.textContent.trim(),
                element: card
            });
        }
    });

    // Default platform data if none found in DOM
    if (platformData.length === 0) {
        const defaultNames = [
            'STAKE', 'RENDITY', 'BRICKS', 'BRXS', 'MONIWAN', 
            'CORUM', 'MINTOS', 'REVOLUT', 'GOPARITY', 'NEXO',
            'SPLINT INVEST', 'KONVI', 'TIMELESS', 'ECOTREE'
        ];
        
        platformData = defaultNames.map(name => ({ name, element: null }));
    }
    
    // Extract just the platform names
    let platformNames = platformData.map(item => item.name);
    
    // Convert platform names to Title Case (first letter uppercase, rest lowercase)
    platformNames = platformNames.map(name => {
        return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    });
    
    // Update platformData with formatted names
    platformData = platformData.map((item, index) => ({
        ...item,
        name: platformNames[index]
    }));
    
    // Set up canvas context and sizing
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let balloons = [];
    
    // Track which companies are currently displayed to avoid duplicates
    let displayedCompanies = new Set();
    
    // Number of visible balloons
    const VISIBLE_BALLOONS = 5;
    
    // Helper function to split text into multiple lines if needed
    function splitTextIntoLines(text, maxLineLength) {
        if (text.length <= maxLineLength) {
            return [text]; // No need to split
        }
        
        // For long text, try to split on spaces to create natural line breaks
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            
            // If adding this word would make the line too long, start a new line
            if ((currentLine + ' ' + word).length <= maxLineLength) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        // Add the last line
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    // Calculate the optimal balloon size based on text length
    function calculateBalloonRadius(text) {
        // Get text length and estimate number of lines needed
        const textLength = text.length;
        
        // Base radius for short texts
        const baseSize = 75;
        
        // Calculate balloon size based on text length and expected number of lines
        let additionalSize = 0;
        
        // Split long text into multiple lines
        const maxLineLength = 10; // Characters per line
        const lines = splitTextIntoLines(text, maxLineLength);
        const numLines = lines.length;
        
        // Add size based on number of lines and longest line length
        const longestLineLength = Math.max(...lines.map(line => line.length));
        
        if (numLines === 1) {
            // Single line - size based on length
            if (textLength >= 6 && textLength <= 12) {
                additionalSize = 15 + (textLength - 6) * 2;
            } else if (textLength > 12) {
                additionalSize = 25 + (textLength - 12) * 2.5;
            }
        } else {
            // Multiple lines - add size based on number of lines and longest line
            additionalSize = 15 + (numLines - 1) * 10 + longestLineLength * 2;
        }
        
        return baseSize + additionalSize;
    }
    
    // Resize function to handle responsive behavior
    function resizeCanvas() {
        // Get the actual dimensions of the container
        const rect = heroImageDiv.getBoundingClientRect();
        
        // Set canvas dimensions to match container
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Recalculate sizes based on new dimensions
        initAnimation();
    }

    // Get a unique company data (not currently displayed)
    function getUniqueCompanyData() {
        // Filter out companies that are already displayed
        const availablePlatforms = platformData.filter(item => !displayedCompanies.has(item.name));
        
        // If we've used all companies or somehow have none available, reset the tracking
        if (availablePlatforms.length === 0) {
            // Pick a random company to free up
            const companyNameToFree = Array.from(displayedCompanies)[Math.floor(Math.random() * displayedCompanies.size)];
            displayedCompanies.delete(companyNameToFree);
            
            // Find and return the company data
            return platformData.find(item => item.name === companyNameToFree) || platformData[0];
        }
        
        // Select random company from available ones
        return availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
    }
    
    // Initialize the animation parameters
    function initAnimation() {
        // Clear any existing animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Clear existing balloons and tracking
        balloons = [];
        displayedCompanies.clear();
        
        // Create a limited number of balloons
        const numBalloons = Math.min(VISIBLE_BALLOONS, platformData.length);
        
        // Calculate canvas dimensions and anchor point
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Distribute balloons evenly across the width
        const spacing = canvasWidth / (numBalloons + 1);
        
        for (let i = 0; i < numBalloons; i++) {
            // Calculate anchor position (evenly spaced along bottom)
            const anchorX = spacing * (i + 1);
            const anchorY = canvasHeight; // Bottom of the canvas
            
            // Different heights for more varied appearance (30-80% of canvas height)
            const heightPercentage = 0.3 + Math.random() * 0.5;
            const stringLength = canvasHeight * heightPercentage;
            
            // Horizontal movement with higher amplitudes
            const swingFrequency = 0.05 + Math.random() * 0.08; // Slower for more natural pendulum effect
            const swingAmplitude = 8 + Math.random() * 12; // Swing amplitudes for horizontal movement
            
            // Get a unique company data
            const companyData = getUniqueCompanyData();
            displayedCompanies.add(companyData.name);
            
            // Create the balloon
            balloons.push(new Balloon(
                anchorX,
                anchorY,
                stringLength,
                swingFrequency,
                swingAmplitude,
                companyData,
                10 + Math.random() * 7 // Longer time between name changes (10-17 seconds)
            ));
        }
        
        // Start the animation
        animate(0);
        
        // Add click event listener to canvas
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    // Handle clicks on the canvas
    function handleCanvasClick(event) {
        // Get the click coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if any balloon was clicked
        for (const balloon of balloons) {
            if (balloon.isPointInside(x, y)) {
                balloon.handleClick();
                return; // Exit after handling one click
            }
        }
    }
    
    // Handle mouse movements for hover effects
    function handleMouseMove(event) {
        // Get the mouse coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        let anyHovered = false;
        
        // Check hover state for all balloons
        for (const balloon of balloons) {
            const isHovered = balloon.checkHover(x, y);
            if (isHovered) {
                anyHovered = true;
            }
        }
        
        // Update cursor style based on hover state
        canvas.style.cursor = anyHovered ? 'pointer' : 'default';
    }
    
    // Balloon class with cord-driven physics and improved clickability
    class Balloon {
        constructor(anchorX, anchorY, stringLength, swingFrequency, swingAmplitude, companyData, changeInterval) {
            // Anchor point (bottom of the string)
            this.anchorX = anchorX;
            this.anchorY = anchorY;
            
            // Balloon properties
            this.stringLength = stringLength;
            this.swingPhase = Math.random() * Math.PI * 2; // Random starting phase
            this.swingFrequency = swingFrequency; // How fast it swings
            this.swingAmplitude = swingAmplitude; // How wide it swings
            
            // Company data
            this.currentCompanyData = companyData;
            this.radius = calculateBalloonRadius(companyData.name);
            
            // Split text into lines if needed
            this.maxLineLength = 10; // Maximum characters per line
            this.currentLines = splitTextIntoLines(companyData.name, this.maxLineLength);
            
            // Visual properties
            this.color = '#ffffff';
            this.stringColor = 'rgba(201, 167, 75, 0.9)'; // Gold color matching site theme
            this.stringWidth = 1.8; // Thicker string
            this.shadow = {
                color: 'rgba(0, 0, 0, 0.15)',
                offsetX: 3,
                offsetY: 6,
                blur: 8
            };
            
            // Company name display and transition
            this.nextCompanyData = null;
            this.nextLines = [];
            this.nextRadius = this.radius; // Will be recalculated when name changes
            this.textOpacity = 1;
            this.isChangingName = false;
            this.fadeDirection = 0; // 0 = stable, 1 = fading out, 2 = fading in
            
            // Knot position and properties
            this.knotSize = Math.max(4, this.radius * 0.06);
            
            // KEY CHANGE: The knot is now treated as part of the string
            // These variables track the positions for proper connection
            this.knotX = 0; // Knot position X in world coordinates
            this.knotY = 0; // Knot position Y in world coordinates
            
            // Balloon position will be calculated based on knot position
            this.x = 0;
            this.y = 0;
            
            // Timer for company name changes
            this.changeInterval = changeInterval; // Seconds between changes
            this.changeTimer = changeInterval * 0.7 + Math.random() * changeInterval * 0.3; // Stagger initial changes
            
            // Balloon tilt for realistic swinging
            this.tiltAngle = 0;
            
            // Secondary movement variables - adds subtle motion
            this.secondaryPhase = Math.random() * Math.PI * 2;
            this.secondaryFrequency = 0.03 + Math.random() * 0.07; // Slower for more natural movement
            this.secondaryAmplitude = 2 + Math.random() * 3;
            
            // Interactive state
            this.isHovered = false;
            this.clickable = true; // The balloon is clickable
        }
        
        update(deltaTime) {
            // Update swing phase
            this.swingPhase += this.swingFrequency * deltaTime;
            this.secondaryPhase += this.secondaryFrequency * deltaTime;
            
            // Calculate the current swing angle with added secondary movement
            const swingAngle = Math.sin(this.swingPhase) * (this.swingAmplitude * Math.PI / 180);
            const secondaryAngle = Math.sin(this.secondaryPhase) * (this.secondaryAmplitude * Math.PI / 180);
            const combinedAngle = swingAngle + secondaryAngle;
            
            // CRITICAL CHANGE: First calculate the knot position as the end of the string
            const horizontalFactor = 0.25; // Controls how much horizontal movement
            this.knotX = this.anchorX + Math.sin(combinedAngle) * this.stringLength * horizontalFactor;
            
            // String length from anchor to knot determines the knot's Y position
            const effectiveStringLength = this.stringLength - this.knotSize;
            this.knotY = this.anchorY - Math.cos(combinedAngle) * effectiveStringLength;
            
            // Now update the tilt angle based on swing motion
            this.tiltAngle = Math.sin(this.swingPhase + Math.PI / 2) * 0.1;
            
            // THEN calculate the balloon position based on the knot and tilt
            // The balloon is attached to the knot (not the other way around)
            const attachmentOffsetX = -Math.sin(this.tiltAngle) * (this.radius + this.knotSize * 0.5);
            const attachmentOffsetY = -Math.cos(this.tiltAngle) * (this.radius + this.knotSize * 0.5);
            
            this.x = this.knotX + attachmentOffsetX;
            this.y = this.knotY + attachmentOffsetY;
            
            // Update knot size based on balloon radius - ensures consistent transition
            this.knotSize = Math.max(4, this.radius * 0.06);
            
            // Ensure balloon stays within canvas boundaries
            const boundaryMargin = this.radius * 1.2;
            const canvasWidth = canvas.width;
            if (this.x < boundaryMargin) {
                const diff = boundaryMargin - this.x;
                this.x = boundaryMargin;
                this.knotX += diff; // Move knot with balloon
            }
            if (this.x > canvasWidth - boundaryMargin) {
                const diff = this.x - (canvasWidth - boundaryMargin);
                this.x = canvasWidth - boundaryMargin;
                this.knotX -= diff; // Move knot with balloon
            }
            
            // Handle company name changes
            this.changeTimer -= deltaTime;
            
            if (this.changeTimer <= 0 && !this.isChangingName) {
                // Start name change process
                this.isChangingName = true;
                this.fadeDirection = 1; // Start fading out
                
                // Reset timer for next change
                this.changeTimer = this.changeInterval;
            }
            
            // Handle text fade transitions
            if (this.isChangingName) {
                if (this.fadeDirection === 1) { // Fading out
                    this.textOpacity -= deltaTime * 1.5; // Speed of fade
                    
                    if (this.textOpacity <= 0) {
                        this.textOpacity = 0;
                        this.fadeDirection = 2; // Start fading in
                        
                        // Remove current name from tracking
                        displayedCompanies.delete(this.currentCompanyData.name);
                        
                        // Get new unique company data
                        this.nextCompanyData = getUniqueCompanyData();
                        
                        // Split new name into lines
                        this.nextLines = splitTextIntoLines(this.nextCompanyData.name, this.maxLineLength);
                        
                        // Calculate new balloon size based on the new name
                        this.nextRadius = calculateBalloonRadius(this.nextCompanyData.name);
                        
                        // Add new name to tracking
                        displayedCompanies.add(this.nextCompanyData.name);
                    }
                } else if (this.fadeDirection === 2) { // Fading in
                    this.textOpacity += deltaTime * 1.5; // Speed of fade
                    
                    // Gradually update the balloon size to match the new text
                    this.radius = this.radius + (this.nextRadius - this.radius) * deltaTime * 3;
                    
                    if (this.textOpacity >= 1) {
                        this.textOpacity = 1;
                        this.fadeDirection = 0; // Done transitioning
                        this.isChangingName = false;
                        this.currentCompanyData = this.nextCompanyData;
                        this.currentLines = this.nextLines;
                        this.radius = this.nextRadius; // Finalize radius change
                        this.nextCompanyData = null; // Clear next data
                    }
                }
            }
        }
        
        draw(ctx) {
            // Draw the string first - now the knot is part of the string
            this.drawString(ctx);
            
            // Draw the knot at the end of the string
            this.drawKnot(ctx);
            
            // Save the current state before drawing balloon
            ctx.save();
            
            // Move to balloon position
            ctx.translate(this.x, this.y);
            
            // Apply tilt for realistic swinging
            ctx.rotate(this.tiltAngle);
            
            // Apply shadow to the balloon
            ctx.shadowColor = this.shadow.color;
            ctx.shadowOffsetX = this.shadow.offsetX;
            ctx.shadowOffsetY = this.shadow.offsetY;
            ctx.shadowBlur = this.shadow.blur;
            
            // Create a more realistic balloon look with gradient
            const gradient = ctx.createRadialGradient(
                -this.radius * 0.2, -this.radius * 0.2, this.radius * 0.1,
                0, 0, this.radius * 1.2
            );
            
            // Set gradient colors - slightly different if hovered
            if (this.isHovered) {
                gradient.addColorStop(0, '#ffffff'); // Bright highlight
                gradient.addColorStop(0.3, '#fcfcfc');
                gradient.addColorStop(0.7, '#f0f0f0');
                gradient.addColorStop(1, '#e8e8e8'); // Slightly darker edge for hover effect
            } else {
                gradient.addColorStop(0, '#ffffff'); // Bright highlight
                gradient.addColorStop(0.3, '#fdfdfd');
                gradient.addColorStop(0.7, '#f5f5f5');
                gradient.addColorStop(1, '#f0f0f0'); // Edge
            }
            
            // Draw the balloon (slightly oval for more realistic shape)
            ctx.beginPath();
            // Use ellipse instead of circle to make slightly oval (more balloon-like)
            ctx.ellipse(0, 0, this.radius, this.radius * 1.05, 0, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Add a subtle border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            // Remove shadow for text and highlights
            ctx.shadowColor = 'transparent';
            
            // Draw the pinched bottom of the balloon (connects to the knot)
            this.drawBalloonNeck(ctx);
            
            // Draw the company name text
            this.drawCompanyName(ctx);
            
            // Add balloon highlights for realism
            this.drawBalloonHighlights(ctx);
            
            // If hovered, add a more obvious clickable indication
            if (this.isHovered) {
                // Draw subtle click indicator (circle around balloon)
                ctx.beginPath();
                ctx.ellipse(0, 0, this.radius + 8, this.radius * 1.05 + 8, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(201, 167, 75, 0.6)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Add a small "click me" indicator
                const clickMe = "cliquez";
                ctx.fillStyle = "rgba(201, 167, 75, 0.9)";
                ctx.font = "bold 14px 'Nobile', sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(clickMe, 0, this.radius * 0.6);
            }
            
            // Restore canvas state
            ctx.restore();
        }
        
        // Draw the string from anchor point to knot
        drawString(ctx) {
            ctx.beginPath();
            
            // Start at the anchor point (bottom of string)
            ctx.moveTo(this.anchorX, this.anchorY);
            
            // Draw a simple curved string to the knot center
            // The control point makes the string curve naturally
            const controlPointX = this.anchorX + (this.knotX - this.anchorX) * 0.5;
            const controlPointY = this.anchorY - (this.anchorY - this.knotY) * 0.2;
            
            // Draw the curve to the knot position
            ctx.quadraticCurveTo(controlPointX, controlPointY, this.knotX, this.knotY);
            
            // Style the string
            ctx.strokeStyle = this.stringColor;
            ctx.lineWidth = this.stringWidth;
            ctx.stroke();
        }
        
        // Draw the knot as a proper balloon tie/knot at the end of the string
        drawKnot(ctx) {
            // Save context for knot drawing
            ctx.save();
            
            // Move to knot position
            ctx.translate(this.knotX, this.knotY);
            
            // Draw the main knot circle (the tied part of balloon)
            ctx.beginPath();
            ctx.arc(0, 0, this.knotSize, 0, Math.PI * 2);
            ctx.fillStyle = '#f0f0f0';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 0.8;
            ctx.fill();
            ctx.stroke();
            
            // Add shadow crease across the knot for realism
            ctx.beginPath();
            ctx.arc(0, 0, this.knotSize * 0.6, Math.PI * 0.25, Math.PI * 1.25);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
            ctx.lineWidth = this.knotSize * 0.4;
            ctx.stroke();
            
            // Add highlight to knot for 3D effect
            ctx.beginPath();
            ctx.arc(-this.knotSize * 0.3, -this.knotSize * 0.2, this.knotSize * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            
            // Restore context
            ctx.restore();
        }
        
        // Draw the pinched neck of the balloon that connects to the knot
        drawBalloonNeck(ctx) {
            // Calculate the direction to the knot in balloon space
            const knotDirX = (this.knotX - this.x) / this.radius;
            const knotDirY = (this.knotY - this.y) / this.radius;
            
            // Normalize the direction
            const length = Math.sqrt(knotDirX * knotDirX + knotDirY * knotDirY);
            const normalizedDirX = knotDirX / length;
            const normalizedDirY = knotDirY / length;
            
            // Calculate perpendicular direction for the width of the neck
            const perpDirX = -normalizedDirY;
            const perpDirY = normalizedDirX;
            
            // Draw a natural pinched bottom that points toward the knot
            const neckWidth = this.radius * 0.35;
            
            // Create a natural looking pinched end of the balloon
            ctx.beginPath();
            
            // Side 1 of pinch
            ctx.moveTo(perpDirX * neckWidth, perpDirY * neckWidth);
            ctx.quadraticCurveTo(
                normalizedDirX * this.radius * 0.3,
                normalizedDirY * this.radius * 0.3,
                normalizedDirX * this.radius * 0.7,
                normalizedDirY * this.radius * 0.7
            );
            
            // Side 2 of pinch
            ctx.quadraticCurveTo(
                normalizedDirX * this.radius * 0.3,
                normalizedDirY * this.radius * 0.3,
                -perpDirX * neckWidth,
                -perpDirY * neckWidth
            );
            
            // Close the shape
            ctx.closePath();
            
            // Fill with balloon color
            ctx.fillStyle = '#f0f0f0';
            ctx.fill();
            
            // Add a slight crease for realism
            ctx.beginPath();
            ctx.moveTo(perpDirX * neckWidth * 0.5, perpDirY * neckWidth * 0.5);
            ctx.quadraticCurveTo(
                normalizedDirX * this.radius * 0.2,
                normalizedDirY * this.radius * 0.2,
                -perpDirX * neckWidth * 0.5,
                -perpDirY * neckWidth * 0.5
            );
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
        
        // Method to draw the company name on the balloon
        drawCompanyName(ctx) {
            // Save current state
            ctx.save();
            
            // Determine which lines to display based on fade state
            const displayLines = this.fadeDirection === 2 ? this.nextLines : this.currentLines;
            
            // Calculate optimal font size based on balloon size and number of lines
            const numLines = displayLines.length;
            const maxWidth = this.radius * 1.7; // Width available for text
            
            // Calculate font size based on number of lines and longest line
            const longestLineLength = Math.max(...displayLines.map(line => line.length));
            
            let fontSize;
            if (numLines === 1) {
                fontSize = Math.min(this.radius * 0.35, maxWidth / (longestLineLength * 0.35));
            } else {
                // Reduce font size for multiple lines
                fontSize = Math.min(
                    this.radius * 0.3 / Math.sqrt(numLines),
                    maxWidth / (longestLineLength * 0.4)
                );
            }
            
            // Ensure reasonable font size limits
            fontSize = Math.max(12, Math.min(fontSize, 24));
            
            // Draw company name with current opacity
            // Use a slightly different color if hovered
            const textColor = this.isHovered 
                ? `rgba(10, 30, 64, ${this.textOpacity + 0.2})` 
                : `rgba(10, 30, 64, ${this.textOpacity})`;
                
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${fontSize}px 'Nobile', sans-serif`;
            
            // Calculate starting Y position for multi-line text
            const lineHeight = fontSize * 1.2;
            const totalTextHeight = lineHeight * numLines;
            let startY = -totalTextHeight / 2 + lineHeight / 2;
            
            // Draw each line of text
            displayLines.forEach((line, index) => {
                const lineY = startY + index * lineHeight;
                ctx.fillText(line, 0, lineY);
            });
            
            // If hovered, add underline effect to indicate clickability
            if (this.isHovered) {
                const lineY = startY + (numLines - 1) * lineHeight + fontSize * 0.8;
                const lineWidth = Math.min(this.radius * 1.2, fontSize * displayLines[0].length * 0.6);
                
                ctx.beginPath();
                ctx.moveTo(-lineWidth/2, lineY);
                ctx.lineTo(lineWidth/2, lineY);
                ctx.strokeStyle = textColor;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Restore state
            ctx.restore();
        }
        
        // Method to draw balloon highlights for more realism
        drawBalloonHighlights(ctx) {
            // Main highlight (upper left)
            const highlightX = -this.radius * 0.3;
            const highlightY = -this.radius * 0.4;
            const highlightRadiusX = this.radius * 0.4;
            const highlightRadiusY = this.radius * 0.3;
            
            ctx.beginPath();
            ctx.ellipse(highlightX, highlightY, highlightRadiusX, highlightRadiusY, -Math.PI/4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();
            
            // Second smaller highlight
            ctx.beginPath();
            ctx.ellipse(-this.radius * 0.1, -this.radius * 0.1, this.radius * 0.15, this.radius * 0.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            
            // Edge highlight for more 3D effect
            ctx.beginPath();
            ctx.ellipse(this.radius * 0.4, this.radius * 0.3, this.radius * 0.1, this.radius * 0.08, Math.PI/4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        }
        
        // Check if a point is inside the balloon (for hovering)
        checkHover(x, y) {
            // Simple distance check
            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Update hover state
            const wasHovered = this.isHovered;
            this.isHovered = distance <= this.radius * 1.1; // Slightly larger hit area
            
            return this.isHovered;
        }
        
        // Check if a point is inside the balloon (for clicking)
        isPointInside(x, y) {
            // Simple distance check
            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= this.radius * 1.1; // Slightly larger hit area
        }
        
        // Handle click on this balloon
        handleClick() {
            // If not clickable, ignore
            if (!this.clickable) return;
            
            // Find the platform card element
            const platformElement = this.currentCompanyData.element;
            
            if (platformElement) {
                // If we have a reference to the card, scroll to it
                platformElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add a subtle highlight to the card
                platformElement.classList.add('highlighted-card');
                
                // Remove the highlight after a moment
                setTimeout(() => {
                    platformElement.classList.remove('highlighted-card');
                }, 2000);
                
                // Add expanded class if it exists
                if (!platformElement.classList.contains('expanded')) {
                    platformElement.classList.add('expanded');
                    
                    // Find and click the details button
                    const detailsButton = platformElement.querySelector('.toggle-details');
                    if (detailsButton) {
                        // Simulate a click on the details button
                        detailsButton.click();
                    }
                }
            } else {
                // If no element reference, try to find the card by name
                const platformName = this.currentCompanyData.name.toUpperCase();
                const platformCards = document.querySelectorAll('.platform-card');
                
                // Find the matching card (case insensitive)
                for (const card of platformCards) {
                    const titleElement = card.querySelector('.platform-title');
                    if (titleElement && titleElement.textContent.trim().toUpperCase() === platformName) {
                        // Scroll to the found card
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Add a highlight
                        card.classList.add('highlighted-card');
                        setTimeout(() => {
                            card.classList.remove('highlighted-card');
                        }, 2000);
                        
                        // Open the card details
                        if (!card.classList.contains('expanded')) {
                            card.classList.add('expanded');
                            
                            // Find and click the details button
                            const detailsButton = card.querySelector('.toggle-details');
                            if (detailsButton) {
                                detailsButton.click();
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    
    // Animation timing variables
    let lastTime = 0;
    
    // Animation loop
    function animate(currentTime) {
        // Convert to seconds
        currentTime *= 0.001;
        const deltaTime = Math.min(0.05, currentTime - lastTime); // Cap delta to prevent huge jumps
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
    
    // Handle window resize
    window.addEventListener('resize', debounce(resizeCanvas, 250));
    
    // Helper function for debouncing resize events
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Add CSS for highlighted cards
    const style = document.createElement('style');
    style.textContent = `
        .highlighted-card {
            animation: card-highlight 2s ease;
            position: relative;
            z-index: 100;
        }
        @keyframes card-highlight {
            0%, 100% { box-shadow: var(--shadow-md); }
            50% { box-shadow: 0 8px 30px rgba(201, 167, 75, 0.6); }
        }
    `;
    document.head.appendChild(style);
    
    // Initial setup
    resizeCanvas();
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