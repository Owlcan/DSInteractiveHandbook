/**
 * Game Initialization for Alchemy Blaster
 * Sets up and connects all game components
 */
class GameInit {
    constructor() {
        // Use the singleton audio manager instead of creating a new instance
        this.audioManager = window.audioManager;
        
        // Create game instance
        this.game = {
            canvas: document.getElementById('gameCanvas'),
            audioManager: this.audioManager
        };
        
        // Create game controller
        this.gameController = new GameController();
        this.gameController.audioManager = this.audioManager;
        this.game.gameController = this.gameController;
        
        // Create projectile manager with reference to game - FIXED: Use window.ProjectileManager
        this.projectileManager = new window.ProjectileManager(this.game);
        
        // Important: Set projectile manager reference in game controller
        this.gameController.projectileManager = this.projectileManager;
        
        // Create particle system
        this.particleSystem = new ParticleSystem(this.game);
        this.game.particleSystem = this.particleSystem;
    }
    
    /**
     * Start the game
     */
    start() {
        // Play title music using the singleton audio manager
        if (this.audioManager) {
            this.audioManager.playMusic('title');
        }
        
        // Set up event listeners for UI
        this.setupEventListeners();
        
        // Start the game loop
        this.gameLoop();
    }
    
    /**
     * Set up event listeners for user input
     */
    setupEventListeners() {
        // Add your event listeners here
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        // Game update logic
        
        // Request next frame
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the window loads - but only if audio_manager.js has loaded first
window.addEventListener('load', () => {
    // Wait for the audioManager to be initialized
    if (!window.audioManager) {
        console.error('Audio manager not initialized! Make sure audio_manager.js is loaded before game_init.js');
        // Try to wait a small amount of time for the audio manager to initialize
        setTimeout(() => {
            if (window.audioManager) {
                const game = new GameInit();
                game.start();
            } else {
                console.error('Audio manager still not available. Check script loading order.');
            }
        }, 500);
    } else {
        const game = new GameInit();
        game.start();
    }
});
