/**
 * Main Application - Math Snake Adventure
 * Handles user interactions and connects UI with game logic
 */

class MathGameApp {
    constructor() {
        this.game = null;
        this.isGameInitialized = false;
        
        this.initializeApp();
    }

    initializeApp() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        // Initialize the game
        this.game = new MathSnakeGame('gameCanvas');
        this.isGameInitialized = true;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial UI update
        this.updateUI();
        
        console.log('Math Snake Adventure loaded successfully!');
    }

    setupEventListeners() {
        // Game control buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // Answer submission
        document.getElementById('submitAnswer').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Enter key for answer submission
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // Prevent right-click context menu on canvas (optional)
        document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Auto-focus answer input when game starts
        document.addEventListener('keydown', (e) => {
            // Focus input field when user starts typing numbers (and game is running)
            if (this.game && this.game.gameRunning && /\d/.test(e.key)) {
                const answerInput = document.getElementById('answerInput');
                if (document.activeElement !== answerInput) {
                    answerInput.focus();
                }
            }
        });
    }

    startGame() {
        if (!this.isGameInitialized || !this.game) {
            console.error('Game not initialized yet');
            return;
        }

        this.game.startGame();
        this.updateButtonStates();
        
        // Focus on answer input
        document.getElementById('answerInput').focus();
        
        // Show success message
        this.showMessage('Game Started! Solve the math problem to help the snake!', 'success');
    }

    pauseGame() {
        if (!this.game || !this.game.gameRunning) return;
        
        this.game.pauseGame();
        this.updateButtonStates();
        
        const message = this.game.gamePaused ? 'Game Paused' : 'Game Resumed';
        this.showMessage(message, 'info');
    }

    restartGame() {
        if (!this.game) return;
        
        this.game.restartGame();
        this.updateButtonStates();
        this.updateUI();
        
        // Reset answer input
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').focus();
        
        this.showMessage('Game Restarted! Good luck!', 'info');
    }

    submitAnswer() {
        if (!this.game || !this.game.gameRunning || this.game.gamePaused) {
            this.showMessage('Please start the game first!', 'warning');
            return;
        }

        const answerInput = document.getElementById('answerInput');
        const userAnswer = answerInput.value.trim();
        
        // Validate input
        if (userAnswer === '') {
            this.showMessage('Please enter an answer!', 'warning');
            answerInput.focus();
            return;
        }

        if (isNaN(userAnswer)) {
            this.showMessage('Please enter a valid number!', 'error');
            answerInput.focus();
            return;
        }

        // Check answer
        const isCorrect = this.game.checkAnswer(userAnswer);
        
        if (isCorrect) {
            this.showMessage('Correct! Snake is heading to eat the problem!', 'success');
            answerInput.value = '';
            
            // Add visual feedback
            answerInput.style.borderColor = '#48bb78';
            setTimeout(() => {
                answerInput.style.borderColor = '#cbd5e0';
            }, 1000);
        } else {
            this.showMessage(`Wrong answer! Correct answer was ${this.game.currentProblem.answer}`, 'error');
            
            // Add visual feedback for wrong answer
            answerInput.style.borderColor = '#e53e3e';
            answerInput.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                answerInput.style.borderColor = '#cbd5e0';
                answerInput.style.animation = '';
            }, 1500);
        }

        // Keep focus on input for next problem
        setTimeout(() => {
            answerInput.focus();
        }, 100);
    }

    updateButtonStates() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');

        if (!this.game) return;

        if (this.game.gameRunning) {
            startBtn.textContent = 'Running...';
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pauseBtn.textContent = this.game.gamePaused ? 'Resume' : 'Pause';
            restartBtn.disabled = false;
        } else {
            startBtn.textContent = 'Start Game';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.textContent = 'Pause';
            restartBtn.disabled = false;
        }
    }

    updateUI() {
        if (!this.game) return;
        
        this.game.updateUI();
        this.updateButtonStates();
        
        // Update difficulty info
        const difficultyInfo = this.game.problemGenerator.getDifficultyInfo();
        if (difficultyInfo) {
            // You could add a difficulty display element if desired
            console.log(`Current difficulty: ${difficultyInfo.name} - ${difficultyInfo.description}`);
        }
    }

    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('gameMessage');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'gameMessage';
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.right = '20px';
            messageEl.style.padding = '12px 20px';
            messageEl.style.borderRadius = '8px';
            messageEl.style.fontWeight = 'bold';
            messageEl.style.zIndex = '1000';
            messageEl.style.maxWidth = '300px';
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'all 0.3s ease';
            document.body.appendChild(messageEl);
        }

        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // Set message and style based on type
        messageEl.textContent = message;
        
        const styles = {
            success: { bg: '#48bb78', color: 'white' },
            error: { bg: '#e53e3e', color: 'white' },
            warning: { bg: '#ed8936', color: 'white' },
            info: { bg: '#4299e1', color: 'white' }
        };

        const style = styles[type] || styles.info;
        messageEl.style.backgroundColor = style.bg;
        messageEl.style.color = style.color;

        // Show message
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateX(0)';

        // Hide message after delay
        this.messageTimeout = setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
        }, 3000);
    }

    // Utility method to add keyboard shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.game) return;

            switch(e.key.toLowerCase()) {
                case ' ': // Spacebar to pause/resume
                    e.preventDefault();
                    if (this.game.gameRunning) {
                        this.pauseGame();
                    }
                    break;
                case 'r': // R to restart
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.restartGame();
                    }
                    break;
                case 'escape': // Escape to pause
                    if (this.game.gameRunning) {
                        this.pauseGame();
                    }
                    break;
            }
        });
    }

    // Method to get game statistics
    getGameStats() {
        if (!this.game) return null;

        return {
            score: this.game.score,
            level: this.game.level,
            lives: this.game.lives,
            isRunning: this.game.gameRunning,
            isPaused: this.game.gamePaused,
            currentProblem: this.game.currentProblem
        };
    }
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Initialize the app when the script loads
window.addEventListener('load', () => {
    window.mathGameApp = new MathGameApp();
});

// Export for debugging purposes
window.MathGameApp = MathGameApp;
