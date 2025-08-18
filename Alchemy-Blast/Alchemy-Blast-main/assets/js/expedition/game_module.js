/**
 * Game Module for Alchemy Blaster
 * 
 * This is the main entry point for the game that:
 * - Sets up the game components
 * - Handles user input
 * - Manages the game loop
 * - Coordinates between controller and renderer
 */

const AlchemyBlaster = (() => {
    // Game components
    let gameController;
    let gameRenderer;
    let canvas;
    
    // Input state
    const input = {
        left: false,
        right: false,
        fire: false,
        specialFire: false
    };
    
    // Animation frame ID for game loop
    let animationFrameId = null;
    
    // Track game state for music changes
    let gameState = {
        lastRound: 0,
        lastWave: 0
    };

    // Sound effects
    let sounds = {
        // We'll keep these as references but won't actively load Audio objects
        // The actual sounds will be played through the window.audioManager
    };
    
    // Instead of directly playing sounds, delegate to audioManager
    function playCharacterSound(soundType) {
        if (window.audioManager && window.audioManager.selectedCharacter) {
            switch(soundType) {
                case 'hit':
                    window.audioManager.playCharacterSound('hit');
                    break;
                case 'gameOver':
                    window.audioManager.playCharacterSound('gameover');
                    break;
                case 'victory':
                    window.audioManager.playCharacterSound('victory');
                    break;
            }
        }
    }
    
    // Add a new function to check for round changes and update music
    function checkRoundChange(gameState, lastRound, lastWave) {
        if (!gameState) return {lastRound, lastWave};
        
        // Check if round or wave changed
        if (gameState.currentRound !== lastRound || gameState.currentWave !== lastWave) {
            console.log(`Game state change: Round ${gameState.currentRound}, Wave ${gameState.currentWave}`);
            
            // Determine if this is a boss wave
            let isBoss = false;
            if (gameState.currentRound === 1 && gameState.currentWave === 5) isBoss = true;
            if (gameState.currentRound === 2 && gameState.currentWave === 7) isBoss = true;
            if (gameState.currentRound === 3 && gameState.currentWave === 8) isBoss = true;
            
            // FORCE music change when round changes
            if (gameState.currentRound !== lastRound || isBoss) {
                playBackgroundMusic(true);
            }
            
            // Return updated values
            return {
                lastRound: gameState.currentRound,
                lastWave: gameState.currentWave
            };
        }
        
        // No change, return original values
        return {lastRound, lastWave};
    }
    
    // Initialize the game
    function init(canvasId) {
        // Set up canvas
        canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.error(`Canvas with ID '${canvasId}' not found.`);
            return;
        }
        
        // Create game components
        gameController = new GameController();
        gameRenderer = new GameRenderer(canvasId, gameController);
        
        // Set up event listeners
        setupEventListeners();
        
        // Use the singleton audio manager to play title music
        if (window.audioManager) {
            window.audioManager.playMusic('title');
        }
        
        // Set up audio manager
        setupAudioManager();
        
        // Start the game loop
        startGameLoop();
    }
    
    // Set up audio manager for game controller
    function setupAudioManager() {
        // Create audio manager object to inject into game controller
        const audioManager = {
            playSfx: function(sfxName) {
                switch(sfxName) {
                    case 'playerHit':
                        playCharacterSound('hit');
                        break;
                    case 'enemyHit':
                        window.audioManager.playSfx('enemyHit');
                        break;
                    case 'explosion':
                        window.audioManager.playSfx('explosion');
                        break;
                    case 'playerShot':
                        window.audioManager.playSfx('playerShot');
                        break;
                    case 'specialAttack':
                        window.audioManager.playSfx('specialAttack');
                        break;
                    case 'gameOver':
                        playCharacterSound('gameOver');
                        break;
                    case 'victory':
                        playCharacterSound('victory');
                        break;
                    case 'shieldHit':
                        window.audioManager.playSfx('shieldHit');
                        break;
                    case 'healthPotion':
                        window.audioManager.playSfx('healthPotion');
                        break;
                    case 'shieldPotion':
                        window.audioManager.playSfx('shieldPotion');
                        break;
                    case 'powerPotion':
                        window.audioManager.playSfx('powerPotion');
                        break;
                    case 'powerup':
                        window.audioManager.playSfx('powerup');
                        break;
                    case 'shinBeamAttack':
                        window.audioManager.playSfx('shinBeamAttack');
                        break;
                }
            },
            
            stopAll: function() {
                // Stop all currently playing sound effects
                if (window.audioManager) {
                    window.audioManager.stopAll();
                }
            }
        };
        
        // Inject audio manager into game controller
        if (gameController) {
            gameController.audioManager = audioManager;
        }
    }
    
    // Set up event listeners for user input
    function setupEventListeners() {
        // Mouse events for UI interaction
        canvas.addEventListener('click', handleClick);
        
        // Keyboard events for gameplay
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Touch events for mobile support
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    // Handle mouse click on UI elements
    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const element = gameRenderer.getElementAtPosition(x, y);
        
        if (element) {
            switch (element.type) {
                case 'character':
                    // Start game with selected character
                    startGame(element.value);
                    break;
                    
                case 'restart':
                    // Restart game
                    resetGame();
                    break;
                    
                case 'pause':
                    // Toggle pause
                    togglePause();
                    break;
            }
        }
    }
    
    // Adjust music volume
    function adjustVolume(amount) {
        // Use the singleton audio manager to adjust volume
        if (window.audioManager) {
            const currentVolume = window.audioManager.musicVolume || 0.5;
            const newVolume = Math.max(0, Math.min(1, currentVolume + amount));
            window.audioManager.setMusicVolume(newVolume);
            console.log(`Music volume: ${Math.round(newVolume * 100)}%`);
        }
    }
    
    // Set music volume directly to a specific value
    function setVolume(value) {
        // Use the singleton audio manager to set volume
        if (window.audioManager) {
            const newVolume = Math.max(0, Math.min(1, value));
            window.audioManager.setMusicVolume(newVolume);
            console.log(`Music volume set to: ${Math.round(newVolume * 100)}%`);
        }
    }
    
    // Handle key down events
    function handleKeyDown(event) {
        // Volume controls
        if (event.key === '+' || event.key === '=') {
            adjustVolume(0.1);
            return;
        } else if (event.key === '-' || event.key === '_') {
            adjustVolume(-0.1);
            return;
        }
        
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                input.left = true;
                break;
                
            case 'ArrowRight':
            case 'd':
                input.right = true;
                break;
                
            case ' ':
            case 'z':
                if (!input.fire) {
                    input.fire = true;
                    firePlayerWeapon(false);
                }
                break;
                
            case 'x':
            case 'Shift':
                if (!input.specialFire) {
                    input.specialFire = true;
                    firePlayerWeapon(true);
                }
                break;
                
            case 'p':
            case 'Escape':
                togglePause();
                break;
        }
    }
    
    // Handle key up events
    function handleKeyUp(event) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                input.left = false;
                break;
                
            case 'ArrowRight':
            case 'd':
                input.right = false;
                break;
                
            case ' ':
            case 'z':
                input.fire = false;
                // For Shinshi, stop her beam when key is released
                if (gameController.gameState.selectedCharacter === 'shinshi') {
                    gameController.stopPlayerBeam();
                }
                break;
                
            case 'x':
            case 'Shift':
                input.specialFire = false;
                break;
        }
    }
    
    // Handle touch start for mobile controls
    function handleTouchStart(event) {
        event.preventDefault(); // Prevent default scrolling
        
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Check for UI element touch first
        const element = gameRenderer.getElementAtPosition(x, y);
        if (element) {
            switch (element.type) {
                case 'character':
                    startGame(element.value);
                    return;
                    
                case 'restart':
                    resetGame();
                    return;
                    
                case 'pause':
                    togglePause();
                    return;
            }
        }
        
        // If game is active, handle movement/firing
        if (gameController.gameState.isActive && !gameController.gameState.isPaused) {
            const centerX = canvas.width / 2;
            
            if (y > canvas.height * 0.7) {
                // Bottom 30% of screen is movement area
                if (x < centerX - 50) {
                    input.left = true;
                    input.right = false;
                } else if (x > centerX + 50) {
                    input.right = true;
                    input.left = false;
                }
            } else {
                // Upper part of screen is shooting area
                if (!input.fire) {
                    input.fire = true;
                    firePlayerWeapon(x > centerX); // Special fire if on right half
                }
            }
        }
    }
    
    // Handle touch move for mobile controls
    function handleTouchMove(event) {
        event.preventDefault(); // Prevent default scrolling
        
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const centerX = canvas.width / 2;
        
        // Update movement based on touch position
        if (x < centerX - 50) {
            input.left = true;
            input.right = false;
        } else if (x > centerX + 50) {
            input.right = true;
            input.left = false;
        } else {
            input.left = false;
            input.right = false;
        }
    }
    
    // Handle touch end for mobile controls
    function handleTouchEnd(event) {
        event.preventDefault(); // Prevent default scrolling
        
        // Reset input states
        input.left = false;
        input.right = false;
        
        // For Shinshi, stop her beam when touch ends
        if (input.fire && gameController.gameState.selectedCharacter === 'shinshi') {
            gameController.stopPlayerBeam();
        }
        
        input.fire = false;
        input.specialFire = false;
    }
    
    // Start a new game with the selected character
    function startGame(character) {
        // Initialize game controller if not already done
        if (!gameController) {
            gameController = new GameController();
        }
        
        // Pass audio manager to game controller for sound effects
        gameController.audioManager = window.audioManager;
        
        // Set the character in the audio manager
        // This will also play the start sound ONCE through the audio manager
        if (window.audioManager) {
            window.audioManager.setCharacter(character);
        }
        
        // Start the game with the selected character
        gameController.startGame(character);
        
        // Reset tracking variables
        gameState.lastRound = 1;
        gameState.lastWave = 1;
    }
    
    // Reset game to character select
    function resetGame() {
        gameController.gameState.isActive = false;
        gameController.gameState.gameOver = false;
        
        // Play title music using singleton audio manager
        if (window.audioManager) {
            window.audioManager.playMusic('title');
        }
    }
    
    // Toggle pause state
    function togglePause() {
        if (gameController.gameState.isActive) {
            gameController.pauseGame(!gameController.gameState.isPaused);
            
            // Use window.handleGamePause to handle music pausing
            if (window.handleGamePause) {
                window.handleGamePause(gameController.gameState.isPaused);
            }
        }
    }
    
    // Fire player weapon
    function firePlayerWeapon(isSpecial) {
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        const character = gameController.gameState.selectedCharacter;
        
        // Play appropriate attack sounds before firing
        if (window.audioManager) {
            if (isSpecial) {
                // Play special attack sounds based on character
                window.audioManager.playSfx('specialAttack');
            } else {
                // Play normal attack sounds
                window.audioManager.playSfx('playerShot');
            }
        }
        
        // Fire projectile using the controller
        gameController.firePlayerProjectile(isSpecial);
    }
    
    // Handle wave change - updates background music
    function onWaveChange() {
        // Music is handled by the game_controller now, no need to do anything here
    }
    
    // Start the game loop
    function startGameLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Set last timestamp to current time
        let lastTimestamp = performance.now();
        
        // Define the game loop
        function gameLoop(timestamp) {
            // Calculate delta time (for smoother animations)
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            
            // Process movement input
            processInput();
            
            // Check for round/wave changes and update music if needed
            checkRoundChange();
            
            // Update game state
            if (gameController.gameState.isActive && !gameController.gameState.isPaused) {
                gameController.update(timestamp);
            }
            
            // Render the game
            gameRenderer.render(timestamp);
            
            // Continue the game loop
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        // Start the game loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // Check if round/wave changed and update music if needed
    function checkRoundChange() {
        if (!gameController || !gameController.gameState) return;
        
        const currentState = gameController.gameState;
        
        // Check if round or wave changed
        if (currentState.currentRound !== gameState.lastRound || 
            currentState.currentWave !== gameState.lastWave) {
            
            console.log(`Game state change: Round ${currentState.currentRound}, Wave ${currentState.currentWave}`);
            
            // Update tracking variables
            gameState.lastRound = currentState.currentRound;
            gameState.lastWave = currentState.currentWave;
        }
    }
    
    // Process movement input
    function processInput() {
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        // Process left/right movement
        if (input.left) {
            gameController.movePlayer('left', true);
        } else if (input.right) {
            gameController.movePlayer('right', true);
        }
        
        // Handle character-specific continuous fire mechanics
        if (gameController.gameState.selectedCharacter === 'aliza') {
            // Aliza's continuous firing
            if ((input.fire || input.specialFire)) {
                // Get current time to control fire rate
                const currentTime = Date.now();
                
                // Check if enough time has passed since last shot (fire rate limiting)
                if (!gameController.player.lastFireTime || 
                    currentTime - gameController.player.lastFireTime > gameController.player.fireRate) {
                    
                    // Update last fire time
                    gameController.player.lastFireTime = currentTime;
                    
                    // Fire projectile (regular or special based on input)
                    firePlayerWeapon(input.specialFire);
                }
            }
        } else if (gameController.gameState.selectedCharacter === 'shinshi') {
            // Shinshi's beam attack - continuous as long as fire is pressed
            if (input.fire) {
                if (!gameController.player.isBeamActive) {
                    // Start beam attack by firing normal weapon
                    firePlayerWeapon(false);
                    
                    // Play initial beam sound when starting
                    if (window.audioManager) {
                        window.audioManager.playSfx('shinBeamAttack');
                    }
                }
                
                // Keep firing while button is held, using normal fire logic
                const currentTime = Date.now();
                if (!gameController.player.lastFireTime || 
                    currentTime - gameController.player.lastFireTime > gameController.player.fireRate) {
                    
                    gameController.player.lastFireTime = currentTime;
                    
                    // Don't play attack sound every frame - just update the beam
                    gameController.firePlayerProjectile(false);
                }
            }
            
            // Handle special attack button press
            if (input.specialFire && !gameController.player.specialActive) {
                firePlayerWeapon(true);
            }
        }
    }
    
    // Public API
    return {
        init,
        onWaveChange
    };
})();

// Initialize the game when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Initialize with AlchemyBlaster.js instead of expedition.js
    AlchemyBlaster.init('gameCanvas');
});