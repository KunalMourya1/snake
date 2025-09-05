/**
 * Math Snake Game - Core Game Logic
 * Snake game that integrates with mathematical problems
 */

class MathSnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game configuration
        this.gridSize = 25;
        this.tileCount = {
            x: Math.floor(this.canvas.width / this.gridSize),
            y: Math.floor(this.canvas.height / this.gridSize)
        };
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Snake properties
        this.snake = [
            { x: Math.floor(this.tileCount.x / 2), y: Math.floor(this.tileCount.y / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Math problem circle
        this.problemCircle = null;
        this.currentProblem = null;
        this.problemGenerator = new MathProblemGenerator();
        
        // Game timing
        this.gameSpeed = 300;
        this.lastGameUpdate = 0;
        
        // Smooth movement
        this.smoothMovement = true;
        this.moveProgress = 0;
        this.targetSnake = [];
        this.currentSnake = [];
        
        // Snake appearance
        this.snakeColors = [
            { head: '#7C3AED', body: '#10B981', name: 'Purple-Green' },
            { head: '#DC2626', body: '#F59E0B', name: 'Red-Orange' },
            { head: '#2563EB', body: '#06B6D4', name: 'Blue-Cyan' },
            { head: '#059669', body: '#8B5CF6', name: 'Green-Violet' },
            { head: '#DB2777', body: '#F97316', name: 'Pink-Orange' },
            { head: '#7C2D12', body: '#65A30D', name: 'Brown-Lime' },
            { head: '#1F2937', body: '#EF4444', name: 'Dark-Red' },
            { head: '#FBBF24', body: '#3B82F6', name: 'Gold-Blue' }
        ];
        this.currentColorIndex = 0;
        
        // Visual effects
        this.particles = [];
        this.backgroundStars = this.generateBackgroundStars();
        this.floatingElements = this.generateFloatingElements();
        
        this.initializeGame();
    }

    initializeGame() {
        // Initialize smooth movement arrays
        this.currentSnake = this.snake.map(segment => ({ ...segment }));
        this.targetSnake = this.snake.map(segment => ({ ...segment }));
        
        this.generateNewProblem();
        this.draw();
    }

    generateNewProblem() {
        this.currentProblem = this.problemGenerator.generateProblem();
        
        // Generate random position for the problem circle
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            this.problemCircle = {
                x: Math.floor(Math.random() * this.tileCount.x),
                y: Math.floor(Math.random() * this.tileCount.y),
                radius: 40,
                color: '#4299e1',
                pulsePhase: 0
            };
            
            // Check if position overlaps with snake
            validPosition = !this.snake.some(segment => 
                segment.x === this.problemCircle.x && segment.y === this.problemCircle.y
            );
            
            attempts++;
        }
        
        // Update UI
        document.getElementById('mathProblem').textContent = this.currentProblem.question;
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').focus();
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }

    pauseGame() {
        this.gamePaused = !this.gamePaused;
    }

    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Reset snake
        this.snake = [
            { x: Math.floor(this.tileCount.x / 2), y: Math.floor(this.tileCount.y / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Reset smooth movement
        this.currentSnake = this.snake.map(segment => ({ ...segment }));
        this.targetSnake = this.snake.map(segment => ({ ...segment }));
        this.moveProgress = 0;
        
        // Reset math problem generator
        this.problemGenerator.setLevel(1);
        this.generateNewProblem();
        
        // Update UI
        this.updateUI();
        this.hideGameOver();
        this.draw();
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) {
            if (this.gameRunning) {
                requestAnimationFrame(() => this.gameLoop());
            }
            return;
        }

        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.lastGameUpdate;
        
        if (timeSinceLastUpdate >= this.gameSpeed) {
            this.update();
            this.lastGameUpdate = currentTime;
            this.moveProgress = 0;
        } else {
            // Update move progress for smooth movement
            this.moveProgress = Math.min(1, timeSinceLastUpdate / this.gameSpeed);
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Store current positions as starting point for smooth movement
        this.currentSnake = this.snake.map(segment => ({ ...segment }));
        
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Move snake to target position
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount.x || 
            head.y < 0 || head.y >= this.tileCount.y) {
            this.handleWallCollision();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.handleSelfCollision();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if snake reached problem circle
        if (this.isNearProblemCircle(head)) {
            // Snake reached the problem area - this should only happen with correct answer
            this.handleCorrectAnswer();
            // Don't remove tail - snake grows!
        } else {
            // Normal movement - remove tail
            this.snake.pop();
        }
        
        // Store target positions for smooth movement
        this.targetSnake = this.snake.map(segment => ({ ...segment }));
        
        // Update particles
        this.updateParticles();
    }

    isNearProblemCircle(position) {
        if (!this.problemCircle) return false;
        
        const distance = Math.sqrt(
            Math.pow(position.x - this.problemCircle.x, 2) + 
            Math.pow(position.y - this.problemCircle.y, 2)
        );
        
        return distance < 1.5; // Within 1.5 grid units
    }

    handleCorrectAnswer() {
        // Add score
        this.score += (this.level * 10);
        
        // Grow snake by keeping the tail (don't remove it this time)
        // This makes the snake longer
        
        // Change snake color
        this.currentColorIndex = (this.currentColorIndex + 1) % this.snakeColors.length;
        
        // Create celebration particles with current snake color
        const currentColor = this.snakeColors[this.currentColorIndex];
        this.createParticles(this.problemCircle.x, this.problemCircle.y, currentColor.head);
        
        // Create color change effect particles
        this.createColorChangeEffect();
        
        // Check for level progression
        if (this.score > 0 && this.score % 100 === 0) {
            this.level = Math.min(5, this.level + 1);
            this.problemGenerator.setLevel(this.level);
            // Don't increase speed, keep it slower for better gameplay
        }
        
        // Generate new problem
        this.generateNewProblem();
        this.updateUI();
    }

    handleWallCollision() {
        this.lives--;
        this.createParticles(this.snake[0].x, this.snake[0].y, '#e53e3e');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetSnakePosition();
        }
        
        this.updateUI();
    }

    handleSelfCollision() {
        this.lives--;
        this.createParticles(this.snake[0].x, this.snake[0].y, '#ed8936');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetSnakePosition();
        }
        
        this.updateUI();
    }

    resetSnakePosition() {
        // Reset snake to center
        this.snake = [
            { x: Math.floor(this.tileCount.x / 2), y: Math.floor(this.tileCount.y / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }

    checkAnswer(userAnswer) {
        const correctAnswer = this.currentProblem.answer;
        
        // First, reverse the snake's direction when any answer is entered
        this.reverseDirection();
        
        if (parseInt(userAnswer) === correctAnswer) {
            // Correct answer - after reversing, direct snake toward problem circle
            setTimeout(() => {
                this.directSnakeToCircle();
            }, 100); // Small delay to see the reverse first
            return true;
        } else {
            
            return false;
        }
    }

    reverseDirection() {
        // Reverse the current direction
        this.nextDirection = {
            x: -this.direction.x,
            y: -this.direction.y
        };
    }
    
    directSnakeToCircle() {
        if (!this.problemCircle) return;
        
        const head = this.snake[0];
        const dx = this.problemCircle.x - head.x;
        const dy = this.problemCircle.y - head.y;
        
        // Choose the direction that gets us closer
        if (Math.abs(dx) > Math.abs(dy)) {
            this.nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
        } else {
            this.nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                color: color
            });
        }
    }
    
    createColorChangeEffect() {
        // Create sparkly particles around the snake head when color changes
        const head = this.snake[0];
        const currentColor = this.snakeColors[this.currentColorIndex];
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: head.x * this.gridSize + this.gridSize / 2 + (Math.random() - 0.5) * 50,
                y: head.y * this.gridSize + this.gridSize / 2 + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 40,
                color: Math.random() > 0.5 ? currentColor.head : currentColor.body
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            return particle.life > 0;
        });
    }

    generateBackgroundStars() {
        const stars = [];
        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01
            });
        }
        return stars;
    }
    
    generateFloatingElements() {
        const elements = [];
        for (let i = 0; i < 8; i++) {
            elements.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 15 + 10,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.5 + 0.2,
                type: Math.random() > 0.5 ? 'circle' : 'diamond'
            });
        }
        return elements;
    }

    draw() {
        // Clear canvas with gradient background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(0.5, '#16213e');
        bgGradient.addColorStop(1, '#0f3460');
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw magical background elements
        this.drawBackgroundStars();
        this.drawFloatingElements();
        
        // Draw grid (subtle)
        this.drawGrid();
        
        // Draw problem circle
        this.drawProblemCircle();
        
        // Draw snake
        this.drawSnake();
        
        // Draw particles
        this.drawParticles();
        
        // Draw pause overlay if paused
        if (this.gamePaused) {
            this.drawPauseOverlay();
        }
    }

    drawBackgroundStars() {
        this.backgroundStars.forEach(star => {
            star.twinkle += star.speed;
            const alpha = (Math.sin(star.twinkle) + 1) / 2;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.8;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawFloatingElements() {
        this.floatingElements.forEach(element => {
            element.angle += element.speed * 0.01;
            element.y += Math.sin(element.angle) * 0.5;
            element.x += Math.cos(element.angle * 0.7) * 0.3;
            
            // Wrap around screen
            if (element.x > this.canvas.width + element.size) element.x = -element.size;
            if (element.x < -element.size) element.x = this.canvas.width + element.size;
            if (element.y > this.canvas.height + element.size) element.y = -element.size;
            if (element.y < -element.size) element.y = this.canvas.height + element.size;
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.translate(element.x, element.y);
            this.ctx.rotate(element.angle);
            
            if (element.type === 'circle') {
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, element.size);
                gradient.addColorStop(0, '#FF6B9D');
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, element.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#4A90E2';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -element.size);
                this.ctx.lineTo(element.size, 0);
                this.ctx.lineTo(0, element.size);
                this.ctx.lineTo(-element.size, 0);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x < this.tileCount.x; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.tileCount.y; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        const currentColors = this.snakeColors[this.currentColorIndex];
        
        // Use the snake positions to draw from
        const snakeToRender = this.getInterpolatedSnake();
        
        snakeToRender.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const centerX = x + this.gridSize / 2;
            const centerY = y + this.gridSize / 2;
            
            if (index === 0) {
                // Fantasy Snake Head with dynamic gradient colors
                const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.gridSize / 2);
                gradient.addColorStop(0, currentColors.head);  // Dynamic head color
                gradient.addColorStop(0.7, this.lightenColor(currentColors.head, 20)); // Lighter version
                gradient.addColorStop(1, this.darkenColor(currentColors.head, 20));   // Darker edge
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.gridSize / 2 - 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add sparkle effect
                this.ctx.fillStyle = '#F0E68C';
                this.ctx.beginPath();
                this.ctx.arc(centerX - 4, centerY - 4, 2, 0, Math.PI * 2);
                this.ctx.arc(centerX + 4, centerY + 4, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Fantasy Eyes with glow
                this.ctx.fillStyle = '#FFD700'; // Golden eyes
                this.ctx.beginPath();
                this.ctx.arc(centerX - 5, centerY - 3, 3, 0, Math.PI * 2);
                this.ctx.arc(centerX + 5, centerY - 3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Eye pupils
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(centerX - 5, centerY - 3, 1.5, 0, Math.PI * 2);
                this.ctx.arc(centerX + 5, centerY - 3, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                
            } else {
                // Fantasy Body with dynamic colors and scales pattern
                const bodyGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.gridSize / 2);
                bodyGradient.addColorStop(0, currentColors.body); // Dynamic body color
                bodyGradient.addColorStop(0.6, this.darkenColor(currentColors.body, 15)); // Darker version
                bodyGradient.addColorStop(1, this.darkenColor(currentColors.body, 30));   // Darkest edge
                
                this.ctx.fillStyle = bodyGradient;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.gridSize / 2 - 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add scale pattern with dynamic color
                this.ctx.strokeStyle = this.lightenColor(currentColors.body, 25);
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.gridSize / 3, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Add shimmer effect on some segments
                if (index % 3 === 0) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(centerX - 2, centerY - 2, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }

    drawProblemCircle() {
        if (!this.problemCircle) return;
        
        const centerX = this.problemCircle.x * this.gridSize + this.gridSize / 2;
        const centerY = this.problemCircle.y * this.gridSize + this.gridSize / 2;
        
        // Update pulse animation
        this.problemCircle.pulsePhase += 0.1;
        const pulseSize = Math.sin(this.problemCircle.pulsePhase) * 5;
        const currentRadius = this.problemCircle.radius + pulseSize;
        
        // Draw magical glow effect
        const glowGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius + 15);
        glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(255, 107, 157, 0.6)');
        glowGradient.addColorStop(1, 'rgba(74, 144, 226, 0.2)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, currentRadius + 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw main circle with gradient
        const circleGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius);
        circleGradient.addColorStop(0, '#FFD700'); // Gold center
        circleGradient.addColorStop(0.7, '#FF6B9D'); // Pink middle
        circleGradient.addColorStop(1, '#4A90E2'); // Blue edge
        
        this.ctx.fillStyle = circleGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw animated border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineDashOffset = Date.now() / 100;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw sparkling stars around the circle
        for (let i = 0; i < 6; i++) {
            const angle = (Date.now() / 1000 + i * Math.PI / 3) % (Math.PI * 2);
            const starX = centerX + Math.cos(angle) * (currentRadius + 20);
            const starY = centerY + Math.sin(angle) * (currentRadius + 20);
            this.drawStar(starX, starY, 4, '#FFD700');
        }
        
        // Draw animated question mark
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 2;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow effect
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.shadowBlur = 4;
        
        this.ctx.strokeText('?', centerX, centerY);
        this.ctx.fillText('?', centerX, centerY);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
    }
    
    drawStar(x, y, size, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.translate(x, y);
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const outerRadius = size;
            const innerRadius = size / 2;
            
            if (i === 0) {
                this.ctx.moveTo(outerRadius, 0);
            }
            
            const outerX = Math.cos(angle) * outerRadius;
            const outerY = Math.sin(angle) * outerRadius;
            const innerX = Math.cos(angle + Math.PI / 5) * innerRadius;
            const innerY = Math.sin(angle + Math.PI / 5) * innerRadius;
            
            this.ctx.lineTo(outerX, outerY);
            this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'block';
    }

    hideGameOver() {
        document.getElementById('gameOverScreen').style.display = 'none';
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    lightenColor(color, percent) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Lighten
        const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
        const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
        const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    darkenColor(color, percent) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Darken
        const newR = Math.max(0, Math.floor(r * (100 - percent) / 100));
        const newG = Math.max(0, Math.floor(g * (100 - percent) / 100));
        const newB = Math.max(0, Math.floor(b * (100 - percent) / 100));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    getInterpolatedSnake() {
        if (!this.smoothMovement || this.currentSnake.length === 0 || this.targetSnake.length === 0) {
            return this.snake;
        }
        
        const interpolatedSnake = [];
        const maxLength = Math.max(this.currentSnake.length, this.targetSnake.length);
        
        for (let i = 0; i < maxLength; i++) {
            const current = this.currentSnake[i];
            const target = this.targetSnake[i];
            
            if (current && target) {
                // Interpolate between current and target position
                const interpX = current.x + (target.x - current.x) * this.moveProgress;
                const interpY = current.y + (target.y - current.y) * this.moveProgress;
                
                interpolatedSnake.push({ x: interpX, y: interpY });
            } else if (target) {
                // New segment (snake growing)
                interpolatedSnake.push({ ...target });
            }
        }
        
        return interpolatedSnake;
    }
}

// Export for use in other files
window.MathSnakeGame = MathSnakeGame;
