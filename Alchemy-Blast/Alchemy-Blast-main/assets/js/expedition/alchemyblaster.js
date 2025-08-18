// Alchemy Blaster - Rail Shooter Mini-Game
class AlchemyBlaster {
    constructor(options = {}) {
        // Save options
        this.options = options;
        this.container = options.container || document.getElementById('expedition-container');
        this.sounds = options.sounds || {};
        this.onRewardsCollected = options.onRewardsCollected;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 640;
        this.canvas.height = 800;
        this.canvas.style.cursor = 'none';
        
        // Add canvas to container if provided
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(this.canvas);
        }

        this.gameState = 'loading';
        this.selectedCharacter = null; // Add character selection state
        this.isPaused = false;
        this.score = 0;
        this.round = 1;
        this.wave = 1;
        this.assets = {
            images: {},
            sounds: {},
            loaded: 0,
            total: 0
        };
        this.player = null;
        
        // Initialize systems
        this.particleSystem = new ParticleSystem(this);
        this.projectileManager = new ProjectileManager(this);
        
        // Initialize game arrays
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        
        // Initialize input handling
        this.keys = {
            left: false,
            right: false
        };
        this.mousePosition = { x: 0, y: 0 };
        this.isShooting = false;

        // Bind event handlers to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.setupEventListeners();
        
        // Load assets after events are set up
        this.loadAssets();
    }

    /**
     * Gets the player's actual collision position (fixed Y coordinate)
     * This is the global rule that should be used everywhere for player collision
     * @param {number} playerX - The player's visual X position
     * @returns {Object} - The player's collision position with fixed Y coordinate 
     */
    getPlayerCollisionPosition(playerX) {
        return {
            x: playerX,
            y: this.canvas.height - 250 // FIXED: Now 250px from bottom of screen (previously was 525)
        };
    }

    handleMouseUp(e) {
        if (e.button === 0) { // Left click
            this.isShooting = false;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    async loadAssets() {
        const imagesToLoad = {
            'playerLeft': './assets/images/darklings/dereleft.png',
            'playerRight': './assets/images/darklings/dereright.png',
            'playerHP1': './assets/images/darklings/derehp1.png',
            'playerHP2': './assets/images/darklings/derehp2.png',
            'playerHP3': './assets/images/darklings/derehp3.png',
            'shot1': './assets/images/darklings/shot1.png',
            'shot1a': './assets/images/darklings/shot1a.png',
            'shot1b': './assets/images/darklings/shot1b.png',
            'shotImpact1': './assets/images/darklings/shotimpact1.png',
            'shotImpact2': './assets/images/darklings/shotimpact2.png',
            'background': './assets/images/darklings/lissomeplainsBG.png',
            'foreground': './assets/images/darklings/lissomeplainsFG.png',
            'gameOver': './assets/images/darklings/deregameover.png',
            // Aliza character sprites
            'alizaLeft': './assets/images/darklings/alizaleft.png',
            'alizaRight': './assets/images/darklings/alizaright.png',
            'alizaShot1': './assets/images/darklings/alizashot1.png',
            'alizaShot2': './assets/images/darklings/alizashot2.png',
            'alizaShot3': './assets/images/darklings/alizashot3.png',
            'alizaShotImpact1': './assets/images/darklings/alizashotimpact1.png',
            'alizaShotImpact2': './assets/images/darklings/alizashotimpact2.png',
            // Character select images
            'dereharacterselect': './assets/images/darklings/dereharacterselect.png',
            'alizacharacterselect': './assets/images/darklings/alizacharacterselect.png',
            // Add potion images
            'healthPotion': './assets/images/darklings/health_potion.png',
            'powerPotion': './assets/images/darklings/power_potion.png',
            'shieldPotion': './assets/images/darklings/shield_potion.png',
            // Enemy sprites with correct paths using darklingmob filenames
            'darkling1': './assets/images/darklings/darklingmob1.png',
            'darkling2': './assets/images/darklings/darklingmob2.png',
            'darkling3': './assets/images/darklings/darklingmob3.png',
            'darkling4': './assets/images/darklings/darklingmob4.png',
            'darkling5': './assets/images/darklings/darklingmob5.png',
            'darkling6': './assets/images/darklings/darklingmob6.png',
            'darkling7': './assets/images/darklings/darklingmob7.png',
            'darkling8': './assets/images/darklings/darklingmob8.png',
            'darkling9': './assets/images/darklings/darklingmob9.png',
            'darkling10': './assets/images/darklings/darklingmob10.png',
            // New vanguard enemies for final boss
            'darkling11': './assets/images/darklings/darklingmob11.png',
            'darkling12': './assets/images/darklings/darklingmob12.png',
            'darkling13': './assets/images/darklings/darklingmob13.png',
            'darklingboss1': './assets/images/darklings/darklingboss1.png',
            'darklingboss2': './assets/images/darklings/darklingboss2.png',
            'darklingboss3': './assets/images/darklings/darklingboss3.png',
            'deregameover': './assets/images/darklings/deregameover.png',
            'alizagameover': './assets/images/darklings/alizagameover.png',
            // Mid-boss sprites
            'darkmidboss1': './assets/images/darklings/darkmidboss1.png', 
            'darkmidboss2': './assets/images/darklings/darkmidboss2.png',
            'darkmidboss3': './assets/images/darklings/darkmidboss3.png',
            'darkmidboss4': './assets/images/darklings/darkmidboss4.png',
            'darkmidboss5': './assets/images/darklings/darkmidboss5.png',
            'darkmidboss6': './assets/images/darklings/darkmidboss6.png',
            'darkmidboss7': './assets/images/darklings/darkmidboss7.png',
            'darkmidboss8': './assets/images/darklings/darkmidboss8.png',
            'darkmidboss9': './assets/images/darklings/darkmidboss9.png',
            'darkmidboss10': './assets/images/darklings/darkmidboss10.png',
            'darkmidboss11': './assets/images/darklings/darkmidboss11.png',
        };

        // Print out all image paths to confirm they exist
        console.log("Loading the following image paths:", Object.values(imagesToLoad));

        const soundsToLoad = {
            hit1: 'hit1.wav',
            hit2: 'hit2.wav',
            shoot: 'shoot.wav',
            victory: 'victory.wav',
            victory1: 'victory1.wav',
            victory2: 'victory2.wav',
            gameOver: 'deregameover.wav',
            gameOver1: 'deregameover1.wav',
            spellfire: ['spellfire.wav', 'spellfire1.mp3', 'spellfire2.mp3', 'spellfire3.mp3'],
            // Add potion sounds
            potion1: 'potion1.wav',
            potion2: 'potion2.wav',
            potion3: 'potion3.wav',
            potion4: 'potion4.wav',
            // Add Aliza's sounds
            alizaVictory1: 'alizavictory1.wav',
            alizaVictory2: 'alizavictory2.wav',
            alizaGameOver1: 'alizagameover1.wav',
            alizaGameOver2: 'alizagameover2.wav',
            alizaHit1: 'alizahit1.wav',
            alizaHit2: 'alizahit2.wav'
        };

        this.assets.total = Object.keys(imagesToLoad).length + Object.keys(soundsToLoad).length;

        // Load images
        for (const [key, path] of Object.entries(imagesToLoad)) {
            this.loadImage(key, path);
        }

        // Load sounds
        for (const [key, path] of Object.entries(soundsToLoad)) {
            if (Array.isArray(path)) {
                this.assets.sounds[key] = path.map(p => this.loadSound(p));
            } else {
                this.assets.sounds[key] = this.loadSound(path);
            }
        }
    }

    loadImage(key, path) {
        const img = new Image();
        img.src = path;
        console.log(`Loading image: ${key} from path: ${path}`);
        img.onload = () => {
            console.log(`Successfully loaded image: ${key}`);
            this.assets.images[key] = img;
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        img.onerror = (error) => {
            console.error(`Failed to load image: ${key} from path: ${path}`, error);
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
    }

    loadSound(path) {
        const audio = new Audio(`assets/sounds/${path}`);
        audio.oncanplaythrough = () => {
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        audio.onerror = () => {
            console.error(`Failed to load sound: ${path}`);
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        return audio;
    }

    checkAllAssetsLoaded() {
        if (this.assets.loaded === this.assets.total) {
            this.initGame();
        }
    }

    initGame() {
        this.gameState = 'menu';
        this.player = new Player(this);
        this.startGameLoop();
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    update() {
        if (this.gameState !== 'playing' || this.isPaused) return;

        if (this.player) {
            this.player.update();
            this.updateProjectiles();
            this.updateEnemies();
            this.updateParticles();
            this.updatePowerups();
            this.checkCollisions();
            this.checkWaveProgress();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        if (this.assets.images.background) {
            this.ctx.drawImage(this.assets.images.background, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Handle different game states
        switch(this.gameState) {
            case 'menu':
                // Draw character selection
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 3;
                this.ctx.textAlign = 'center';
                this.ctx.font = 'bold 32px Arial';
                
                // Draw title
                const title = 'Select Your Character';
                this.ctx.strokeText(title, this.canvas.width/2, 50);
                this.ctx.fillText(title, this.canvas.width/2, 50);

                // Draw character options with larger dimensions
                const charWidth = 300;  // Increased from 200
                const charHeight = 450; // Increased from 300
                const spacing = 50;     // Decreased from 100 to keep them on screen
                const startX = (this.canvas.width - (2 * charWidth + spacing)) / 2;
                const startY = 90;      // Moved up slightly from 100

                // Draw Dere
                if (this.assets.images.dereharacterselect) {
                    this.ctx.drawImage(this.assets.images.dereharacterselect, 
                        startX, startY, charWidth, charHeight);
                }

                // Draw Aliza
                if (this.assets.images.alizacharacterselect) {
                    this.ctx.drawImage(this.assets.images.alizacharacterselect, 
                        startX + charWidth + spacing, startY, charWidth, charHeight);
                }

                // Draw selection boxes
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(startX, startY, charWidth, charHeight);
                this.ctx.strokeRect(startX + charWidth + spacing, startY, charWidth, charHeight);

                // Draw character names
                this.ctx.font = 'bold 28px Arial'; // Increased from 24px
                this.ctx.fillText('Dere', startX + charWidth/2, startY + charHeight + 40);
                this.ctx.fillText('Aliza', startX + charWidth + spacing + charWidth/2, startY + charHeight + 40);
                break;

            case 'playing':
                // Draw the game state underneath
                this.drawGameState();
                
                // Draw targeting reticle
                if (this.selectedCharacter === 'aliza') {
                    // Aliza's targeting reticle - larger and more ornate
                    this.ctx.strokeStyle = '#ff69b4'; // Hot pink
                    this.ctx.lineWidth = 3;
                    
                    // Outer circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 25, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Inner circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 12, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Diagonal crosshairs
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePosition.x - 18, this.mousePosition.y - 18);
                    this.ctx.lineTo(this.mousePosition.x + 18, this.mousePosition.y + 18);
                    this.ctx.moveTo(this.mousePosition.x + 18, this.mousePosition.y - 18);
                    this.ctx.lineTo(this.mousePosition.x - 18, this.mousePosition.y + 18);
                    this.ctx.stroke();
                } else {
                    // Dere's original targeting reticle
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 18, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Draw crosshair
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePosition.x - 12, this.mousePosition.y);
                    this.ctx.lineTo(this.mousePosition.x + 12, this.mousePosition.y);
                    this.ctx.moveTo(this.mousePosition.x, this.mousePosition.y - 12);
                    this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y + 12);
                    this.ctx.stroke();
                }

                this.drawUI();
                break;

            case 'paused':
                // Draw the game state underneath
                this.drawGameState();
                
                // Draw pause overlay
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw pause text
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 3;
                this.ctx.font = 'bold 48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                this.ctx.strokeText('PAUSED', this.canvas.width/2, this.canvas.height/2 - 30);
                this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2 - 30);
                
                this.ctx.font = 'bold 24px Arial';
                this.ctx.strokeText('Press SPACE, Q, or Middle Click to Resume', 
                    this.canvas.width/2, this.canvas.height/2 + 30);
                this.ctx.fillText('Press SPACE, Q, or Middle Click to Resume', 
                    this.canvas.width/2, this.canvas.height/2 + 30);
                break;
                case 'gameOver':
                    // Use character-specific game over image
                    const gameOverKey = this.selectedCharacter === 'aliza' ? 'alizagameover' : 'deregameover';
                    const gameOverImage = this.assets.images[gameOverKey];
                    
                    if (gameOverImage) {
                        // Create a black background
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                        
                        // Simple approach: fit the image to 80% of canvas size while maintaining aspect ratio
                        const maxWidth = this.canvas.width * 0.5;
                        const maxHeight = this.canvas.height * 0.5;
                        
                        // Calculate aspect ratios
                        const imageRatio = gameOverImage.width / gameOverImage.height;
                        
                        // Determine dimensions that fit within our constraints
                        let renderWidth, renderHeight;
                        if (imageRatio > maxWidth / maxHeight) {
                            // Width is the limiting factor
                            renderWidth = maxWidth;
                            renderHeight = renderWidth / imageRatio;
                        } else {
                            // Height is the limiting factor
                            renderHeight = maxHeight;
                            renderWidth = renderHeight * imageRatio;
                        }
                        
                        // Center the image
                        const x = (this.canvas.width - renderWidth) / 2;
                        const y = (this.canvas.height - renderHeight) / 2;
                        
                        // Draw the game over image
                        this.ctx.drawImage(gameOverImage, x, y, renderWidth, renderHeight);
                        
                        // Add text overlay for game over
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
                        
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.font = 'bold 24px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText('Game Over - Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height - 45);
                        this.ctx.font = 'bold 18px Arial';
                        this.ctx.fillText('Press any key to continue', this.canvas.width / 2, this.canvas.height - 20);
                    }
                    break;
        }

        // Draw foreground last
        if (this.assets.images.foreground) {
            this.ctx.drawImage(this.assets.images.foreground, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawGameState() {
        // Draw enemies, projectiles, particles, and UI
        this.drawEnemies();
        this.drawProjectiles();
        this.drawParticles();
        this.drawPowerups();
        
        // Draw player last (on top)
        if (this.player) {
            this.player.draw();
        }
    }

    updateProjectiles() {
        // Use the ProjectileManager for updating projectiles
        if (this.projectileManager) {
            this.projectileManager.update(16); // Provide default deltaTime of 16ms if not passed
            
            // Fix for score display issue
            // The ProjectileManager increases score in gameController.gameState.score
            // But we need to properly obtain this score from the game's structure
            if (this.projectileManager.game && 
                this.projectileManager.game.gameController && 
                this.projectileManager.game.gameController.gameState) {
                // Make sure we have a valid score value (avoid NaN)
                const controllerScore = this.projectileManager.game.gameController.gameState.score;
                if (typeof controllerScore === 'number' && !isNaN(controllerScore)) {
                    this.score = controllerScore;
                }
            }
        } else {
            // Fallback to old method if ProjectileManager is not available
            this.projectiles = this.projectiles.filter(proj => !proj.update());
            
            // Update enemy projectiles
            if (!this.enemyProjectiles) this.enemyProjectiles = [];
            this.enemyProjectiles = this.enemyProjectiles.filter(proj => !proj.update());
        }
    }

    updateEnemies() {
        const time = Date.now();
        this.enemies = this.enemies.filter(enemy => !enemy.update(time));
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => !particle.update());
    }

    updatePowerups() {
        this.powerups = this.powerups.filter(powerup => !powerup.update());
    }

    drawProjectiles() {
        // Use the ProjectileManager for drawing projectiles
        if (this.projectileManager) {
            this.projectileManager.draw();
        } else {
            // Fallback to old method if ProjectileManager is not available
            this.projectiles.forEach(proj => proj.draw());
            if (this.enemyProjectiles) {
                this.enemyProjectiles.forEach(proj => proj.draw());
            }
        }
    }

    drawEnemies() {
        this.enemies.forEach(enemy => enemy.draw());
    }

    drawParticles() {
        this.particles.forEach(particle => particle.draw());
    }

    drawPowerups() {
        this.powerups.forEach(powerup => powerup.draw());
    }

    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = '24px Arial';
        
        // Draw score
        const scoreText = `Score: ${this.score}`;
        this.ctx.strokeText(scoreText, 10, 30);
        this.ctx.fillText(scoreText, 10, 30);
        
        // Draw round and wave info
        const waveText = `Round ${this.round} - Wave ${this.wave}`;
        this.ctx.strokeText(waveText, this.canvas.width - 200, 30);
        this.ctx.fillText(waveText, this.canvas.width - 200, 30);
        
        // Draw health or shield based on character
        if (this.selectedCharacter === 'aliza' && this.player) {
            // Draw shield gauge for Aliza
            const shieldWidth = 150;
            const shieldHeight = 15;
            const shieldX = 10;
            const shieldY = this.canvas.height - 30;
            
            // Draw shield text
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            this.ctx.font = '18px Arial';
            this.ctx.strokeText('Shield:', shieldX, shieldY - 5);
            this.ctx.fillText('Shield:', shieldX, shieldY - 5);
            
            // Draw shield background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(shieldX + 70, shieldY - 15, shieldWidth, shieldHeight);
            
            // Calculate shield percentage and color
            const shieldPercent = this.player.shield / this.player.maxShield;
            let shieldColor;
            if (shieldPercent > 0.7) {
                shieldColor = 'rgba(0, 150, 255, 0.8)';
            } else if (shieldPercent > 0.3) {
                shieldColor = 'rgba(0, 100, 255, 0.8)';
            } else {
                shieldColor = 'rgba(0, 50, 255, 0.8)';
            }
            
            // Draw shield fill
            this.ctx.fillStyle = shieldColor;
            this.ctx.fillRect(shieldX + 70, shieldY - 15, shieldWidth * shieldPercent, shieldHeight);
            
            // Draw shield border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(shieldX + 70, shieldY - 15, shieldWidth, shieldHeight);
            
            // Draw health indicator for Aliza (simple health bar)
            const healthX = 10;
            const healthY = this.canvas.height - 60;
            const healthWidth = 100;
            const healthHeight = 10;
            
            // Draw health text
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`HP: ${this.player.health}`, healthX, healthY - 5);
            
            // Draw health bar background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(healthX + 50, healthY - 10, healthWidth, healthHeight);
            
            // Draw health bar fill
            this.ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
            const healthPercent = this.player.health / 3; // Assuming max health is 3
            this.ctx.fillRect(healthX + 50, healthY - 10, healthWidth * healthPercent, healthHeight);
            
            // Draw health bar border
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(healthX + 50, healthY - 10, healthWidth, healthHeight);
            
            // Draw burst-fire cooldown indicator
            if (this.player.canBurstFire) {
                // Draw burst fire ready indicator
                this.ctx.fillStyle = 'rgba(255, 100, 180, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(shieldX + 250, shieldY - 8, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                
                // Draw "Burst Ready" text
                this.ctx.fillStyle = 'white';
                this.ctx.font = '16px Arial';
                this.ctx.fillText('Burst Ready', shieldX + 265, shieldY - 5);
            } else {
                // Calculate cooldown progress
                const now = Date.now();
                const elapsed = now - this.player.lastBurstFire;
                const cooldownPercent = Math.min(1, elapsed / this.player.burstFireCooldown);
                
                // Draw cooldown circle
                this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(shieldX + 250, shieldY - 8, 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw progress arc
                this.ctx.beginPath();
                this.ctx.moveTo(shieldX + 250, shieldY - 8);
                this.ctx.arc(shieldX + 250, shieldY - 8, 8, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * cooldownPercent));
                this.ctx.lineTo(shieldX + 250, shieldY - 8);
                this.ctx.fillStyle = 'rgba(255, 100, 180, 0.6)';
                this.ctx.fill();
                
                // Draw outline
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(shieldX + 250, shieldY - 8, 8, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Draw cooldown text
                this.ctx.fillStyle = 'white';
                this.ctx.font = '16px Arial';
                this.ctx.fillText('Burst Charging', shieldX + 265, shieldY - 5);
            }
        } else {
            // Draw traditional health for Dere
            const healthText = `HP: ${this.player.health}`;
            this.ctx.strokeText(healthText, 10, this.canvas.height - 10);
            this.ctx.fillText(healthText, 10, this.canvas.height - 10);
        }
        
        // Draw power potion UI if active
        if (this.powerUI) {
            const now = Date.now();
            const elapsed = now - this.powerUI.startTime;
            const remaining = Math.max(0, this.powerUI.duration - elapsed);
            const progress = remaining / this.powerUI.duration;
            
            // Draw power potion timer circle
            const circleX = 50;
            const circleY = 80;
            const radius = 15;
            
            // Draw background circle
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fill();
            
            // Draw progress arc (vertically depletes from top)
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
            this.ctx.lineTo(circleX, circleY);
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            this.ctx.fill();
            
            // Draw outline
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw power icon
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('P', circleX, circleY);
            
            // Reset text alignment
            this.ctx.textAlign = 'start';
            this.ctx.textBaseline = 'alphabetic';
        }
        
        // Draw shield potion UI if active
        if (this.shieldUI) {
            const now = Date.now();
            const elapsed = now - this.shieldUI.startTime;
            const remaining = Math.max(0, this.shieldUI.duration - elapsed);
            const progress = remaining / this.shieldUI.duration;
            
            // Draw shield potion timer circle
            const circleX = 50;
            const circleY = 120;
            const radius = 15;
            
            // Draw background circle
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fill();
            
            // Create flashing effect for shield timer
            let alpha = 0.7;
            if (remaining < 5000) {
                // Fast flicker in last 5 seconds
                alpha = 0.3 + Math.abs(Math.sin(now * 0.01)) * 0.5;
            } else if (remaining < 10000) {
                // Slow flicker between 5-10 seconds remaining
                alpha = 0.5 + Math.abs(Math.sin(now * 0.005)) * 0.3;
            }
            
            // Draw progress arc (vertically depletes from top)
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
            this.ctx.lineTo(circleX, circleY);
            this.ctx.fillStyle = `rgba(0, 150, 255, ${alpha})`;
            this.ctx.fill();
            
            // Draw outline
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw shield icon
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('S', circleX, circleY);
            
            // Reset text alignment
            this.ctx.textAlign = 'start';
            this.ctx.textBaseline = 'alphabetic';
        }
    }
    
    checkWaveProgress() {
        if (this.gameState !== 'playing' || this.isSpawningWave) return;

        // Initialize wave start time if not set
        if (!this.waveStartTime) {
            this.waveStartTime = Date.now();
            console.log(`Wave ${this.wave} started at ${this.waveStartTime}`);
        }

        const currentTime = Date.now();
        const waveElapsedTime = currentTime - this.waveStartTime;

        // Check if this is a boss wave
        const isBossWave = (this.round === 2 && this.wave === 7) || 
                           (this.round === 3 && this.wave === 8);

        // For boss waves, wait for boss defeat
        if (isBossWave) {
            const bossesRemaining = this.enemies.filter(e => e.type.includes('boss')).length;
            console.log(`Boss wave check: ${bossesRemaining} bosses remaining`);
            
            if (bossesRemaining === 0) {
                console.log(`Boss wave ${this.wave} completed in round ${this.round}`);
                this.advanceWave();
            }
            return;
        }

        // For normal waves, use time limit or check if all non-flyby enemies are defeated
        // Filter out flyby enemies when counting remaining enemies
        const normalEnemiesRemaining = this.enemies.filter(enemy => !enemy.isFlyby).length;
        
        // Check if wave is complete (either all required enemies are defeated or time limit reached)
        if (waveElapsedTime >= 30000 || normalEnemiesRemaining === 0) {
            console.log(`Wave ${this.wave} completed in round ${this.round} - Time: ${waveElapsedTime}ms, Required enemies remaining: ${normalEnemiesRemaining}`);
            this.advanceWave();
        }
    }

    advanceWave() {
        this.isSpawningWave = false;
        
        const maxWavesInRound = this.getWavesInRound();
        console.log(`Advancing wave: current ${this.wave}, max ${maxWavesInRound} in round ${this.round}`);
        
        if (this.wave < maxWavesInRound) {
            this.wave++;
            console.log(`Advancing to wave ${this.wave} in round ${this.round}`);
            this.showWaveDialog(`Get Ready for Wave ${this.wave}!`);
        } else if (this.round < 3) {
            this.round++;
            this.wave = 1;
            console.log(`Advancing to round ${this.round}, wave 1`);
            this.showWaveDialog(`Round ${this.round} Start!`);
        } else if (this.round === 3 && this.wave >= maxWavesInRound) {
            console.log('Victory! All rounds and waves completed');
            this.gameState = 'victory';
            // Play victory sound based on health
            const sound = this.player.health === 3 ? this.assets.sounds.victory :
                         this.player.health === 2 ? this.assets.sounds.victory1 :
                         this.assets.sounds.victory2;
            sound.play();
            // Apply victory score multiplier
            this.score *= 6;
            this.distributeRewards();
        }

        // Reset wave start time for next wave
        this.waveStartTime = null;
    }

    showWaveDialog(message) {
        const dialog = document.createElement('div');
        dialog.style.position = 'absolute';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        dialog.style.border = '2px solid #d4af37';
        dialog.style.borderRadius = '8px';
        dialog.style.padding = '20px';
        dialog.style.color = '#fff';
        dialog.style.textAlign = 'center';
        dialog.style.zIndex = '1000';
        dialog.style.fontSize = '24px';
        dialog.textContent = message;

        this.canvas.parentNode.appendChild(dialog);
        
        // Pause spawning until timer expires
        this.isSpawningWave = true;
        
        // Automatically remove dialog and start wave after 2 seconds
        setTimeout(() => {
            dialog.remove();
            this.spawnWave();
        }, 2000);
    }

    getWavesInRound() {
        return this.round === 1 ? 5 : 
               this.round === 2 ? 7 : 8;
    }

    spawnWave() {
        this.isSpawningWave = true;
        const enemies = this.generateWaveEnemies();
        let spawned = 0;
        
        console.log(`Starting to spawn wave ${this.wave} of round ${this.round} with ${enemies.length} enemies`);
        
        // Store reference to this interval so we can clear it if needed
        this.spawnInterval = setInterval(() => {
            if (spawned >= enemies.length || this.gameState !== 'playing') {
                clearInterval(this.spawnInterval);
                this.isSpawningWave = false;
                console.log(`Finished spawning wave ${this.wave}, waiting for enemies to be defeated`);
                return;
            }

            const enemy = enemies[spawned];
            const newEnemy = new Enemy(
                enemy.x,
                enemy.y,
                enemy.type,
                this,
                enemy.pattern
            );
            
            this.enemies.push(newEnemy);
            spawned++;
        }, 2000); // Increased from 1000 to 2000ms to space out enemy spawns more
    }

    generateWaveEnemies() {
        const enemies = [];
        const width = this.canvas.width;
        
        // Handle specific boss waves
        if ((this.round === 2 && this.wave === 7) || 
            (this.round === 3 && this.wave === 8)) {
            
            // Only spawn the boss, no minions
            const bossType = this.round === 2 ? 'darklingboss1' : 
                           (this.round === 3 && this.wave === 8) ? 'darklingboss2' : 'darklingboss3';
            
            enemies.push({
                type: bossType,
                x: width/2,
                y: -150, // Move boss higher up
                pattern: 'boss'
            });
            
            return enemies;
        }
        
        // First wave of round 1 - starter enemies
        if (this.round === 1 && this.wave === 1) {
            // Increased from 3 to 5 for the first wave
            const maxEnemiesWave1 = 5;
            for (let i = 0; i < maxEnemiesWave1; i++) {
                const type = ['darkling1', 'darkling2', 'darkling3'][Math.floor(Math.random() * 3)];
                const x = width * (i + 1) / (maxEnemiesWave1 + 1);
                const yOffset = type === 'darkling1' ? -180 :
                              type === 'darkling2' ? -150 :
                              type === 'darkling3' ? -120 :
                              -150;
                
                enemies.push({ type, x, y: -100 + yOffset, pattern: 'default' });
            }
            return enemies;
        }

        // Calculate increasing enemy counts for each round and wave
        // Base enemy count multiplied by round and wave factors
        const baseEnemyCount = 6; // Increased from ~3-5
        const roundMultiplier = this.round * 1.5; // Higher multiplier for rounds
        const waveMultiplier = 1 + (this.wave * 0.5); // Increasing multiplier for waves
        const totalMultiplier = roundMultiplier * waveMultiplier;
        
        // Calculate final enemy count with a minimum value for each round
        let enemyCount = Math.floor(baseEnemyCount * totalMultiplier);
        
        // Ensure minimum enemy counts per round
        if (this.round === 1) {
            enemyCount = Math.max(8, enemyCount); // At least 8 enemies in round 1
        } else if (this.round === 2) {
            enemyCount = Math.max(15, enemyCount); // At least 15 enemies in round 2
        } else {
            enemyCount = Math.max(25, enemyCount); // At least 25 enemies in round 3
        }
        
        // Cap the maximum number of enemies to prevent overwhelming the player
        enemyCount = Math.min(enemyCount, 40); // Maximum of 40 enemies per wave
        
        console.log(`Spawning wave ${this.wave} in round ${this.round} with ${enemyCount} enemies`);

        const types = this.getEnemyTypesForWave();
        
        // Create enemies in a more interesting formation
        for (let i = 0; i < enemyCount; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Distribute enemies in a more interesting pattern
            let x, y;
            
            // Determine formation pattern based on wave number
            if (this.wave % 3 === 0) {
                // Circular formation for every 3rd wave
                const angle = (i / enemyCount) * Math.PI * 2;
                const radius = width * 0.3;
                x = width/2 + Math.cos(angle) * radius;
                y = -100 - Math.sin(angle) * radius;
            } else if (this.wave % 3 === 1) {
                // Grid formation
                const cols = Math.ceil(Math.sqrt(enemyCount));
                const col = i % cols;
                const row = Math.floor(i / cols);
                x = width * (col + 1) / (cols + 1);
                y = -150 - (row * 80);
            } else {
                // V formation
                const halfCount = Math.ceil(enemyCount / 2);
                if (i < halfCount) {
                    // Left side of V
                    x = width/2 - (width * 0.4 * i / halfCount);
                    y = -100 - (i * 30);
                } else {
                    // Right side of V
                    const rightIndex = i - halfCount;
                    x = width/2 + (width * 0.4 * rightIndex / halfCount);
                    y = -100 - (rightIndex * 30);
                }
            }
            
            // Add randomness to prevent perfect formations
            x += Math.random() * 30 - 15;
            y -= Math.random() * 20;
            
            const yOffset = type === 'darkling1' ? -20 :
                          type === 'darkling2' ? -10 :
                          type === 'darkling3' ? -15 :
                          -10;
            
            enemies.push({ type, x, y: y + yOffset, pattern: 'default' });
        }

        return enemies;
    }

    getEnemyTypesForWave() {
        // Ensure enemy types match exactly with the image keys loaded in loadAssets
        if (this.round === 1) {
            // For round 1, use the first 3 basic enemy types only
            return ['darkling1', 'darkling2', 'darkling3'];
        } else if (this.round === 2) {
            // For round 2, adjust difficulty based on wave number
            if (this.wave <= 2) {
                return ['darkling2', 'darkling3', 'darkling4'];
            } else if (this.wave <= 4) {
                return ['darkling3', 'darkling4', 'darkling5', 'darkling6'];
            } else if (this.wave <= 6) {
                // Harder enemies for later waves in round 2
                return ['darkling4', 'darkling5', 'darkling6'];
            }
            // For wave 7 (boss wave), the boss is handled in generateWaveEnemies
            return ['darkling5', 'darkling6'];
        } else {
            // For round 3, use harder enemies
            return ['darkling4', 'darkling5', 'darkling6', 'darkling7', 'darkling8', 'darkling10'];
        }
    }

    checkCollisions() {
        // Use ProjectileManager for collision detection if available
        if (this.projectileManager) {
            // Pass targets for player projectiles and enemy projectiles
            this.projectileManager.checkCollisions(this.enemies, [this.player]);
            
            // Check powerups vs player with offset
            for (const powerup of this.powerups) {
                // Apply player offset for collision detection
                const playerWithOffset = {
                    x: this.player.x - this.player.width/2,
                    y: -250 - this.player.height/2,
                    width: this.player.width,
                    height: this.player.height
                };
                
                if (this.checkCollision(powerup, playerWithOffset)) {
                    this.powerups = this.powerups.filter(p => p !== powerup);
                    powerup.collect(this.player);
                }
            }
        } else {
            // Fallback to old collision detection method
            // Check player projectiles vs enemies
            for (const proj of this.projectiles) {
                for (const enemy of this.enemies) {
                    if (this.checkCollision(proj, enemy)) {
                        this.projectiles = this.projectiles.filter(p => p !== proj);
                        const defeated = enemy.takeDamage();
                        this.particles.push(new Particle(this, proj.x, proj.y, defeated ? 'defeat' : 'hit'));
                        break;
                    }
                }
            }

            // Check enemy projectiles vs player with offset
            for (const proj of this.enemyProjectiles || []) {
                // Apply player offset for collision detection
                const playerWithOffset = {
                    x: this.player.x - this.player.width/2,
                    y: this.player.y - this.player.height/2,
                    width: this.player.width,
                    height: this.player.height
                };
                
                if (this.checkCollision(proj, playerWithOffset)) {
                    this.enemyProjectiles = this.enemyProjectiles.filter(p => p !== proj);
                    this.player.takeDamage();
                    this.particles.push(new Particle(this, proj.x, proj.y, 'hit'));
                }
            }

            // Check powerups vs player with offset
            for (const powerup of this.powerups) {
                // Apply player offset for collision detection
                const playerWithOffset = {
                    x: this.player.x - this.player.width/2,
                    y: this.player.y - this.player.height/2,
                    width: this.player.width,
                    height: this.player.height
                };
                
                if (this.checkCollision(powerup, playerWithOffset)) {
                    this.powerups = this.powerups.filter(p => p !== powerup);
                    powerup.collect(this.player);
                }
            }
        }
    }

    checkCollision(a, b) {
        // If the collision involves the player, use fixed Y position 275px from bottom of screen
        let aY = a.y;
        let bY = b.y;
        let aHeight = a.height;
        let bHeight = b.height;
        
        // Check if either object is the player
        if (a === this.player || (this.player && a === this.player.position)) {
            aY = 250; // Fixed collision point from bottom
        }
        if (b === this.player || (this.player && b === this.player.position)) {
            bY = 250; // Fixed collision point from bottom
        }
        
        // Standard rectangular collision check with adjusted Y positions
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               aY < bY + bHeight &&
               aY + aHeight > bY;
    }

    distributeRewards() {
        const rewards = [];
        
        // Specific items for Lissome Plains as defined in design doc
        const lissomePlainsItems = [
            'cottonfluff', 'eggs', 'butter', 'cream', 'birch-syrup', 
            'fractalcopper', 'flour', 'rocksalt', 'savourherb', 
            'sweetleaf', 'springwater', 'barkgum', 'berrimaters'
        ];
        
        // Calculate reward count based on score (higher score = more items)
        const baseRewardCount = Math.floor(this.score / 100);
        
        // Cap at 100 items maximum
        const rewardCount = Math.min(baseRewardCount, 100);
        
        console.log(`Distributing ${rewardCount} rewards based on score: ${this.score}`);
        
        // Randomly select rewards from possible items
        for (let i = 0; i < rewardCount; i++) {
            const randomIndex = Math.floor(Math.random() * lissomePlainsItems.length);
            rewards.push(lissomePlainsItems[randomIndex]);
        }
        
        // Special reward for high score - Touch of Love (if score > 2000)
        if (this.score >= 2000) {
            const touchCount = Math.floor(Math.random() * 3) + 1; // 1-3 Touch of Love
            console.log(`Adding ${touchCount} potential Touch of Love items`);
            for (let i = 0; i < touchCount; i++) {
                if (Math.random() < 0.25) { // 25% chance per item
                    rewards.push('touchoflove');
                    console.log("Added Touch of Love!");
                }
            }
        }
        
        // Victory reward - 25% chance for Distillation of a Night Sky
        if (this.gameState === 'victory' && Math.random() < 0.25) {
            rewards.push('distillationofnightsky');
            console.log("Added Distillation of Night Sky for victory!");
        }
        
        // Call callback with rewards if it exists
        if (this.onRewardsCollected) {
            this.onRewardsCollected(rewards);
        }
        
        console.log("Final rewards:", rewards);
        return rewards;
    }

    gameOver() {
        this.gameState = 'gameover';
        
        // Use character-specific game over sound and image
        const gameOverKey = this.selectedCharacter === 'aliza' ? 'alizagameover' : 'deregameover';
        const gameOverImage = this.assets.images[gameOverKey];
        
        if (!gameOverImage) {
            console.error('Game over image not found:', gameOverKey);
            return;
        }

        // Play game over sound
        const gameoverSound = Math.random() < 0.5 ? 
            this.assets.sounds[this.selectedCharacter === 'aliza' ? 'alizaGameOver1' : 'gameOver'] : 
            this.assets.sounds[this.selectedCharacter === 'aliza' ? 'alizaGameOver2' : 'gameOver1'];
        
        if (gameoverSound) {
            gameoverSound.currentTime = 0;
            gameoverSound.play();
        }

        const rewards = this.distributeRewards();
        
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        
        // Use character-specific game over image
        const gameOverImgKey = this.player.gameOverImage;
        const gameOverImg = this.assets.images[gameOverImgKey];
        
        if (!gameOverImg) {
            console.error('Game over image not found:', gameOverImgKey);
        }

        const receivedItemsHTML = rewards.map(item => {
            // Check exact ingredients from the rewards array and use their small images
            if (item === 'cottonfluff') return `<div class="received-item"><img src="assets/images/cottonfluff_small.png" alt="Cotton Fluff"><span>Cotton Fluff</span></div>`;
            if (item === 'eggs') return `<div class="received-item"><img src="assets/images/eggs_small.png" alt="Eggs"><span>Eggs</span></div>`;
            if (item === 'butter') return `<div class="received-item"><img src="assets/images/butter_small.png" alt="Butter"><span>Butter</span></div>`;
            if (item === 'cream') return `<div class="received-item"><img src="assets/images/cream_small.png" alt="Cream"><span>Cream</span></div>`;
            if (item === 'birch-syrup') return `<div class="received-item"><img src="assets/images/birchsyrup_small.png" alt="Birch Syrup"><span>Birch Syrup</span></div>`;
            if (item === 'fractalcopper') return `<div class="received-item"><img src="assets/images/fractalcopper_small.png" alt="Fractal Copper"><span>Fractal Copper</span></div>`;
            if (item === 'flour') return `<div class="received-item"><img src="assets/images/flour_small.png" alt="Flour"><span>Flour</span></div>`;
            if (item === 'rocksalt') return `<div class="received-item"><img src="assets/images/rocksalt_small.png" alt="Rock Salt"><span>Rock Salt</span></div>`;
            if (item === 'savourherb') return `<div class="received-item"><img src="assets/images/savourherb_small.png" alt="Savour Herb"><span>Savour Herb</span></div>`;
            if (item === 'barkgum') return `<div class="received-item"><img src="assets/images/barkgum_small.png" alt="Bark Gum"><span>Bark Gum</span></div>`;
            if (item === 'berrimaters') return `<div class="received-item"><img src="assets/images/berrimaters_small.png" alt="Berrimaters"><span>Berrimaters</span></div>`;
            if (item === 'touchoflove') return `<div class="received-item"><img src="assets/images/touchoflove_small.png" alt="Touch of Love"><span>Touch of Love</span></div>`;
            if (item === 'distillationofnightsky') return `<div class="received-item"><img src="assets/images/distillationofnightsky_small.png" alt="Distillation of Night Sky"><span>Distillation of Night Sky</span></div>`;
            return `<div class="received-item"><span>${item}</span></div>`;
        }).join('');
        
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <img src="assets/images/darklings/${gameOverImgKey}.png" alt="Game Over" style="max-width: 250px; margin: -20px 0 -10px 0;">
                <div style="margin: -10px 0 5px 0;">
                    <h2 style="margin: 0; font-size: 24px;">Final Score: ${this.score}</h2>
                    ${rewards.length > 0 ? 
                        `<div class="received-items" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; margin-top: 5px;">
                            ${receivedItemsHTML}
                        </div>` 
                        : '<p style="margin: 5px 0;">No items were collected.</p>'
                    }
                </div>
                <div class="game-over-buttons" style="margin-top: 5px;">
                    <button class="retry-btn">Try Again</button>
                    <button class="menu-btn">Return to Menu</button>
                    <button class="exit-btn">Exit</button>
                </div>
            </div>
        `;

        // Add CSS for received items
        const style = document.createElement('style');
        style.textContent = `
            .received-item {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                margin: 2px;
                font-size: 10px;
                color: #fff;
            }
            .received-item img {
                width: 24px;
                height: 24px;
                object-fit: contain;
            }
            .received-item span {
                margin-top: 2px;
                white-space: nowrap;
            }
        `;

        document.head.appendChild(style);

        // Add the game over screen to the document
        this.canvas.parentElement.appendChild(gameOverScreen);
    }

    handleClick(e) {
        if (this.gameState === 'playing') {
            this.fireProjectile(e);
        }
    }

    takeDamage(damage = 1) {
        // Check for invincibility from shield potion first
        if (this.shieldActive) {
            console.log("Shield potion active - damage prevented!");
            // Play a shield block sound
            const hitSound = this.game.assets.sounds.hit1;
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.volume = 0.3; // Quieter for shield hit
                hitSound.play().catch(e => console.error("Error playing shield hit sound:", e));
            }
            
            return false; // No damage was applied
        }
        
        // Check for Aliza's regenerating shield mechanic
        if (this.useShield && this.shield > 0) {
            // Reduce shield instead of health
            this.shield -= 20;
            if (this.shield < 0) {
                this.shield = 0; // Prevent shield from going negative
            }
            
            // Play special shield hit sound for Aliza
            const hitSound = this.game.assets.sounds.alizaHit1;
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.volume = 0.4;
                hitSound.play().catch(e => console.error("Error playing Aliza hit sound:", e));
            }
            
            return true; // Shield absorbed the damage, so no health was lost
        }
        
        // Regular health damage if no shield
        this.health -= damage;
        let hitSound;
        
        // Use character-specific hit sounds
        if (this.game.selectedCharacter === 'aliza') {
            hitSound = Math.random() < 0.5 ? this.game.assets.sounds.alizaHit1 : this.game.assets.sounds.alizaHit2;
        } else {
            hitSound = Math.random() < 0.5 ? this.game.assets.sounds.hit1 : this.game.assets.sounds.hit2;
        }
         
        if (hitSound) {
            hitSound.currentTime = 0;
            hitSound.play().catch(e => console.error("Error playing hit sound:", e));
        }

        // Update health overlays if using them
        if (this.healthOverlays && this.healthOverlays.length > 0) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                this.healthOverlays[i].alpha = i < this.health ? 1 : Math.max(0, this.healthOverlays[i].alpha - this.fadeSpeed);
            }
        }

        if (this.health <= 0) {
            this.game.gameOver();
        }
        
        return true; // Damage was applied to health
    }
};

class Player {
    constructor(game) {
        this.game = game;
        this.width = 85;
        this.height = 195;
        this.x = game.canvas.width / 2 - this.width / 2;
        this.y = game.canvas.height - this.height - 60;
        this.speed = 5;
        this.health = 3;
        this.isLeft = false;
        this.lastShot = 0;
        this.shotCooldown = 250; // milliseconds
        this.fadeSpeed = 0.1;
        this.powerShotActive = false;

        // Shield mechanics
        this.shield = 100;
        this.maxShield = 100;
        this.shieldRegenRate = 0.05;
        this.useShield = false;
        
        // Burst fire mechanics
        this.burstFireCooldown = 3000; // 3 seconds
        this.lastBurstFire = 0;
        this.canBurstFire = true;
        this.isBurstFiring = false;

        // Health overlays will be set in initializeSelectedCharacter
        this.healthOverlays = [];
    }

    update() {
        // Handle movement
        if (this.game.keys.left && this.x > 0) {
            this.x -= this.speed;
            this.isLeft = true;
        }
        if (this.game.keys.right && this.x < this.game.canvas.width - this.width) {
            this.x += this.speed;
            this.isLeft = false;
        }

        // Handle shooting
        if (this.game.isShooting) {
            const now = Date.now();
            if (now - this.lastShot >= this.shotCooldown) {
                this.shoot();
                this.lastShot = now;
            }
        }
        
        // Update powerup effects
        this.updatePowerupEffects();
    }
    
    updatePowerupEffects() {
        const now = Date.now();
        
        // Update power shot effects
        if (this.powerShotActive && now > this.powerShotEndTime) {
            this.powerShotActive = false;
            this.speed = this.originalSpeed || 5;
            this.shotCooldown = this.originalShotCooldown || 250;
            console.log("Power potion effect expired");
            
            // Remove UI
            if (this.game.powerUI) {
                this.game.powerUI = null;
            }
        }
        
        // Update shield effects
        if (this.shieldActive && now > this.shieldEndTime) {
            this.shieldActive = false;
            console.log("Shield potion effect expired");
            
            // Remove UI
            if (this.game.shieldUI) {
                this.game.shieldUI = null;
            }
        }
        
        // Regenerate shield if active
        if (this.useShield && this.shield < this.maxShield) {
            this.shield += this.shieldRegenRate;
            if (this.shield > this.maxShield) {
                this.shield = this.maxShield;
            }
        }
    }
    
    draw() {
        // Use character-specific sprites
        const sprite = this.isLeft ? 
            this.game.assets.images[this.game.player.sprites.left] : 
            this.game.assets.images[this.game.player.sprites.right];

        if (sprite) {
            // Draw shield effect if shield potion is active
            if (this.shieldActive) {
                this.game.ctx.save();
                
                // Calculate shield effect properties
                const now = Date.now();
                const timeLeft = this.shieldEndTime - now;
                const shieldRadius = this.width * 0.8;
                
                // Flicker shield at certain thresholds
                let alpha = 0.6;
                if (timeLeft < 5000) {
                    // Fast flicker in last 5 seconds
                    alpha = 0.2 + Math.abs(Math.sin(now * 0.01)) * 0.5;
                } else if (timeLeft < 10000) {
                    // Medium flicker between 5-10 seconds left
                    alpha = 0.3 + Math.abs(Math.sin(now * 0.005)) * 0.4;
                } else if (timeLeft < 20000) {
                    alpha = 0.4 + Math.abs(Math.sin(now * 0.002)) * 0.3;
                }
                
                // Create glowing shield effect with safe coordinates
                const centerX = Math.floor(this.x + this.width/2);
                const centerY = Math.floor(this.y + this.height/2);
                const gradient = this.game.ctx.createRadialGradient(
                    centerX, 
                    centerY, 0,
                    centerX, 
                    centerY, 
                    Math.floor(shieldRadius)
                );
                
                gradient.addColorStop(0, `rgba(100, 200, 255, 0)`);
                gradient.addColorStop(0.5, `rgba(100, 200, 255, ${alpha * 0.3})`);
                gradient.addColorStop(0.8, `rgba(100, 200, 255, ${alpha})`);
                gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);

                this.game.ctx.fillStyle = gradient;
                this.game.ctx.beginPath();
                this.game.ctx.arc(
                    this.x + this.width/2, 
                    this.y + this.height/2, 
                    shieldRadius, 
                    0, 
                    Math.PI * 2
                );
                this.game.ctx.fill();
                
                this.game.ctx.restore();
            }
            
            // Draw the player sprite
            this.game.ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            
            // Draw power shot effect if active
            if (this.powerShotActive) {
                this.game.ctx.save();
                
                const now = Date.now();
                // Green glow effect around player
                this.game.ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';
                this.game.ctx.shadowBlur = 15 + Math.sin(now * 0.01) * 5;
                
                // Show power particles occasionally
                if (Math.random() < 0.2) {
                    const particleX = this.x + Math.random() * this.width;
                    const particleY = this.y + Math.random() * this.height;
                    this.game.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                    this.game.ctx.beginPath();
                    this.game.ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                    this.game.ctx.fill();
                }
                
                this.game.ctx.restore();
            }
        }

        // Only draw health overlays if not ignored
        if (!this.ignoreVisualOverlays && this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                const overlay = this.healthOverlays[i];
                overlay.alpha = i < this.health ? 1 : Math.max(0, overlay.alpha - this.fadeSpeed);
                if (overlay.alpha > 0) {
                    const healthSprite = this.game.assets.images[overlay.sprite];
                    if (healthSprite) {
                        this.game.ctx.globalAlpha = overlay.alpha;
                        this.game.ctx.drawImage(healthSprite, this.x, this.y, this.width, this.height);
                        this.game.ctx.globalAlpha = 1;
                    }
                }
            }
        }
    }

    shoot() {
        // Use the ProjectileManager if available
        if (this.game.projectileManager) {
            // Get player position for targeting
            const playerX = this.game.player.x + (this.game.player.width / 2);
            const playerY = this.game.player.y + (this.game.player.height / 2);
            
            // Play firing sound
            if (this.type.includes('boss')) {
                const spellSounds = this.game.assets.sounds.spellfire;
                const randomSound = spellSounds[Math.floor(Math.random() * spellSounds.length)];
                randomSound.currentTime = 0;
                randomSound.play();
            }
            
            // Different shooting patterns based on enemy type
            switch (this.type) {
                case 'darkling1':
                case 'darkling9':
                    // Simple straight shot for basic enemies that previously didn't shoot
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 90, { speed: 3 }
                    );
                    break;
                    
                case 'darkling2':
                case 'darkling3':
                    // Single shot aimed at player
                    this.game.projectileManager.createTargetedEnemyProjectile(
                        this.x, this.y, { x: playerX, y: playerY }, 
                        { speed: 3 }
                    );
                    break;
                    
                case 'darkling4':
                    // Two angled shots
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 75, { speed: 3.5 }
                    );
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 105, { speed: 3.5 }
                    );
                    break;
                    
                case 'darkling5':
                case 'darkling6':
                    // Spread shots
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 80, { speed: 4 }
                    );
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 100, { speed: 4 }
                    );
                    break;
                    
                case 'darkling7':
                    // Wide spread (3 shots)
                    for (let angle = 75; angle <= 105; angle += 15) {
                        this.game.projectileManager.createEnemyProjectile(
                            this.x, this.y, angle, { speed: 3.5 }
                        );
                    }
                    break;
                    
                case 'darkling8':
                    // Two fast shots
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 85, { speed: 4.5 }
                    );
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 95, { speed: 4.5 }
                    );
                    break;
                    
                case 'darkling10':
                    // Random pattern with multiple options
                    const pattern = Math.floor(Math.random() * 3);
                    if (pattern === 0) {
                        // Single fast shot
                        this.game.projectileManager.createEnemyProjectile(
                            this.x, this.y, 90, { speed: 5 }
                        );
                    } else if (pattern === 1) {
                        // Three-way spread
                        for (let angle = 75; angle <= 105; angle += 15) {
                            this.game.projectileManager.createEnemyProjectile(
                                this.x, this.y, angle, { speed: 3.5 }
                            );
                        }
                    } else {
                        // Targeted shot
                        this.game.projectileManager.createTargetedEnemyProjectile(
                            this.x, this.y, { x: playerX, y: playerY }, 
                            { speed: 4.5, width: 35, height: 35 }
                        );
                    }
                    break;
                    
                case 'darklingboss1':
                    // First boss: multiple shots in a V pattern
                    for (let angle = 75; angle <= 105; angle += 7.5) {
                        this.game.projectileManager.createEnemyProjectile(
                            this.x, this.y, angle, { speed: 4, width: 40, height: 40 }
                        );
                    }
                    break;
                    
                case 'darklingboss2':
                    // Second boss: circular pattern
                    for (let angle = 0; angle < 360; angle += 45) {
                        this.game.projectileManager.createEnemyProjectile(
                            this.x, this.y, angle, { speed: 3.5, width: 40, height: 40 }
                        );
                    }
                    break;
                    
                case 'darklingboss3':
                    // Final boss: combines targeted and pattern shots
                    if (Math.random() < 0.5) {
                        // Targeted attack with additional spread
                        this.game.projectileManager.createTargetedEnemyProjectile(
                            this.x, this.y, { x: playerX, y: playerY }, 
                            { speed: 5, width: 45, height: 45 }
                        );
                        
                        // Offset shots around the targeted one
                        this.game.projectileManager.createEnemyProjectile(
                            this.x, this.y, 70, { speed: 4.5, width: 40, height: 40 }
                        );
                        this.game.projectileManager.createEnemyProjectile(
                            this.x, this.y, 110, { speed: 4.5, width: 40, height: 40 }
                        );
                    } else {
                        // Radial attack pattern (every 30 degrees)
                        for (let angle = 0; angle < 360; angle += 30) {
                            this.game.projectileManager.createEnemyProjectile(
                                this.x, this.y, angle, { speed: 3.5, width: 35, height: 35 }
                            );
                        }
                    }
                    break;
                    
                default:
                    // Default simple shot for any other enemy types
                    this.game.projectileManager.createEnemyProjectile(
                        this.x, this.y, 90, { speed: 3 }
                    );
            }
            
            return;
        }
        
        // Legacy fallback (should not be used once ProjectileManager is integrated)
        const createProjectile = (angle, speed = 5, size = 1) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            const proj = new EnemyProjectile(this.game, this.x, this.y, dx, dy);
            proj.width *= size;
            proj.height *= size;
            proj.sprite = 'shot1'; // Use player's shot sprite for enemy projectiles
            return proj;
        };
        
        // Play boss shooting sound for bosses
        if (this.type.includes('boss')) {
            const spellSounds = this.game.assets.sounds.spellfire;
            const randomSound = spellSounds[Math.floor(Math.random() * spellSounds.length)];
            randomSound.currentTime = 0;
            randomSound.play();
        }
    }
}

class EnemyProjectile extends Projectile {
    constructor(game, x, y, dx, dy) {
        super(game, x, y, x + dx * 100, y + dy * 100);
        // Explicitly set dx and dy for enemy projectiles
        this.dx = dx;
        this.dy = dy;
        this.width = 30;
        this.height = 30;
        this.sprite = 'shot1'; // Use player's shot sprite for enemy projectiles
    }
    
    // Override the update method to ensure projectiles move properly
    update() {
        this.x += this.dx;
        this.y += this.dy;
        return this.isOffscreen();
    }
}

class Particle {
    constructor(game, x,y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 1;
        this.scale = type === 'defeat' ? 2 : 1;
        this.fadeSpeed = type === 'defeat' ? 0.02 : 0.1;
    }

    update() {
        this.alpha -= this.fadeSpeed;
        return this.alpha <= 0;
    }

    draw() {
        // Get the correct impact sprite based on whether this is a hit or defeat particle
        // Also use character-specific impact sprites
        const character = this.game.selectedCharacter || 'dere';
        let spriteKey;
        
        if (this.type === 'hit') {
            // For hit particles, use character-specific impact sprites
            spriteKey = character === 'aliza' ? 'alizaShotImpact1' : 'alizaShotImpact2';
        } else if (this.type === 'defeat') {
            // For defeat particles, use character-specific larger impact sprites           
            spriteKey = character === 'aliza' ? 'alizaShotImpact2' : 'shotImpact2';
        }
        
        const sprite = this.game.assets.images[spriteKey];
        
        if (sprite) {
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.alpha;
            
            // Use a larger size for defeat particles
            const size = this.type === 'defeat' ? 80 * this.scale : 40 * this.scale;
            
            this.game.ctx.drawImage(
                sprite,
                this.x - size/2,
                this.y - size/2,
                size,
                size
            );
            
            this.game.ctx.restore();
        } else {
            // Fallback if sprite not found
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.alpha;
            this.game.ctx.fillStyle = this.type === 'defeat' ? 'orange' : 'yellow';
            const size = this.type === 'defeat' ? 40 : 20;
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x, this.y, size * this.scale / 2, 0, Math.PI * 2);
            this.game.ctx.fill();
            this.game.ctx.restore();
        }
    }
}

class Powerup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.type = type; // 'health', 'power', or 'shield'
        this.speed = 2;
        this.angle = Math.random() * Math.PI * 2; // Random drift angle
        this.driftAmount = 1.5;
        this.fallSpeed = 1.5;
        this.bobAmount = 5;
        this.bobSpeed = 0.05;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.startTime = Date.now();
        
        // Set sprite based on type
        this.sprite = this.type === 'health' ? 'healthPotion' : 
                      this.type === 'power' ? 'powerPotion' : 'shieldPotion';
    }

    update() {
        // Make the powerup fall downward with a slight bobbing motion
        this.y += this.fallSpeed;
        
        // Add a drifting motion (left/right)
        this.x += Math.cos(this.angle) * this.driftAmount * 
                Math.sin(Date.now() * 0.001 + this.bobOffset);
        
        // Add bobbing motion
        const bobY = Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * this.bobAmount;
        this.y += bobY * 0.1; // Scale the bob amount
        
        // Remove if offscreen
        if (this.y > this.game.canvas.height + 50) { 
            return true; // Remove this powerup
        }
        
        return false; // Keep this powerup
    }

    draw() {
        const sprite = this.game.assets.images[this.sprite];
        if (sprite) {
            // Create a nice glowing effect for the potion
            this.game.ctx.save();
            // Add glow based on potion type
            const glowColor = this.type === 'health' ? 'rgba(255, 50, 50, 0.3)' : 
                             this.type === 'power' ? 'rgba(50,255, 50, 0.3)' : 
                             'rgba(50, 50, 255, 0.3)';
            this.game.ctx.shadowColor = glowColor;
            this.game.ctx.shadowBlur = 10 + Math.sin(Date.now() * 0.005) * 5;
            // Draw the potion with a slight bobbing animation
            this.game.ctx.drawImage(
                sprite, 
                this.x - this.width/2, 
                this.y - this.height/2 + Math.sin(Date.now() * 0.005) * 3, 
                this.width, 
                this.height 
            );
            this.game.ctx.restore();
        }   
    }

    collect(player) {
        // Play a random potion sound
        this.playPotionSound();
        // Apply effect based on type
        switch(this.type) {
            case 'health':
                if (player.health < 3) {
                    player.health++;
                    console.log("Health potion collected! Health restored to:", player.health);
                    // Reset alpha for overlays that should be visible
                    for (let i = 0; i < player.healthOverlays.length; i++) {
                        if (i < player.health) {
                            player.healthOverlays[i].alpha = 1;
                        }
                    }
                }
                break;
            case 'power':
                player.powerShotActive = true;
                player.powerShotEndTime= Date.now() + 30000; // 30 seconds
                player.originalSpeed = player.speed;
                player.originalShotCooldown = player.shotCooldown;
                console.log("Power potion collected! Speed and firepower enhanced for 30 seconds");
                // Reset alpha for overlays that should be visible
                if (!this.game.powerUI) {
                    this.game.powerUI = {
                        startTime: Date.now(),
                        duration: 30000 // 30 seconds
                    };
                } else {
                    this.game.powerUI.startTime = Date.now();
                }
                break;
            case 'shield':
                player.shieldActive = true;
                player.shieldEndTime = Date.now() + 30000; // 30 seconds
                console.log("Shield potion collected! Player is invulnerable for 30 seconds");
                player.speed = player.originalSpeed * 1.1; // 10% movement speed increase
                // Create shield UI if it doesn't exist
                if (!this.game.shieldUI) {
                    this.game.shieldUI = {
                        startTime: Date.now(),
                        duration: 30000 // 30 seconds
                    };
                } else {
                    this.game.shieldUI.startTime = Date.now();
                }
                break;
        }
    }

    playPotionSound() {
        // Define potential potion sounds
        const potionSounds = [
            this.game.assets.sounds.potion1,
            this.game.assets.sounds.potion2,
            this.game.assets.sounds.potion3,
            this.game.assets.sounds.potion4
        ];
        // Check if any potion sound is currently playing
        const isSoundPlaying = potionSounds.some(sound => 
            !sound.paused && sound.currentTime > 0 && sound.currentTime < sound.duration
        );
        // If no potion sound is playing, play a random one
        if (!isSoundPlaying) {
            const randomIndex = Math.floor(Math.random() * potionSounds.length);
            const sound = potionSounds[randomIndex];
            sound.currentTime = 0;
            sound.play().catch(e => console.error("Error playing potion sound:", e));
        }
    }
}

// Add inputhandlers to AlchemyBlaster class
AlchemyBlaster.prototype.handleKeyDown = function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
    if (e.key === ' ' || e.key.toLowerCase() === 'q') this.togglePause();
};

AlchemyBlaster.prototype.handleKeyUp = function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
};

AlchemyBlaster.prototype.handleMouseMove = function(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.x = e.clientX - rect.left;
    this.mousePosition.y = e.clientY - rect.top;
};

AlchemyBlaster.prototype.handleMouseDown = function(e) {
    if (e.button === 0) { // Left click
        // In menu state, handle character selection
        if (this.gameState === 'menu') {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Character selection hitbox
            const charWidth = 200;
            const charHeight = 300;
            const spacing = 100;
            const startX = (this.canvas.width - (2 * charWidth + spacing)) / 2;
            const startY = 100;

            // Check if clicked on Dere
            if (mouseX >= startX && mouseX <= startX + charWidth &&
                mouseY >= startY && mouseY <= startY + charHeight) {
                this.selectedCharacter = 'dere';
                this.initializeSelectedCharacter();
                return;
            }
            
            // Check if clicked on Aliza
            if (mouseX >= startX + charWidth + spacing && mouseX <= startX + 2 * charWidth + spacing &&
                mouseY >= startY && mouseY <= startY + charHeight) {
                this.selectedCharacter = 'aliza';
                this.initializeSelectedCharacter();
                return;
            }
        }
        
        // If we're playing, handle shooting
        if (this.gameState === 'playing') {
            this.isShooting = true;
            
            // Handle right click burst fire for Aliza
            if (e.button === 2 && this.selectedCharacter === 'aliza' && 
                this.player.canBurstFire && !this.player.isBurstFiring) {
                this.player.triggerBurstFire();
            }
        }
    } else if (e.button === 1) { // Middle click
        e.preventDefault();
        this.togglePause();
    } else if (e.button === 2) { // Right click
        e.preventDefault(); // Prevent context menu
        
        // Trigger Aliza's burst fire if playing and character is Aliza
        if (this.gameState === 'playing' && this.selectedCharacter === 'aliza' && 
            this.player.canBurstFire && !this.player.isBurstFiring) {
            this.player.triggerBurstFire();
        }
    }
};

AlchemyBlaster.prototype.initializeSelectedCharacter = function() {
    // Ensure player exists first
    if (!this.player) {
        this.player = new Player(this);
    }

    // Configure character-specific properties
    if (this.selectedCharacter === 'aliza') {
        this.player.sprites = {
            left: 'alizaLeft',
            right: 'alizaRight'
        };
        this.player.projectileSprites = ['alizaShot1', 'alizaShot2', 'alizaShot3'];
        this.player.projectileSize = 2.5;
        this.player.projectileSpeed = 11.25;
        this.player.sounds = {
            hit: ['alizaHit1', 'alizaHit2'],
            victory: ['alizaVictory1', 'alizaVictory2'],
            gameOver: ['alizaGameOver1', 'alizaGameOver2']
        };
        this.player.ignoreVisualOverlays = true; // Flag to ignore HP overlays
        this.player.gameOverImage = 'alizagameover';
        
        // Aliza-specific mechanics per requirements
        this.player.speed = 7.5; // Enhanced movement speed
        this.player.maxShield = 100;
        this.player.shield = 100;
        this.player.shieldRegenRate = 0.05; // Shield regeneration rate per frame
        this.player.useShield = true; // Flag to use shield instead of health
        this.player.burstFireCooldown = 3000; // 3 seconds cooldown for burst fire
        this.player.lastBurstFire = 0;
        this.player.canBurstFire = true;
    } else {
        // Default Dere configuration 
        this.player.sprites = {
            left: 'playerLeft',
            right: 'playerRight'
        };
        this.player.gameOverImage = 'deregameover';
        this.player.projectileSprites = ['shot1', 'shot1a', 'shot1b'];
        this.player.projectileSize = 1;
        this.player.projectileSpeed = 15;
        this.player.sounds = {
            hit: ['hit1', 'hit2'],
            victory: ['victory', 'victory1', 'victory2'],
            gameOver: ['gameOver', 'gameOver1']
        };
        this.player.healthOverlays = [
            { sprite: 'playerHP3', alpha: 1 },
            { sprite: 'playerHP2', alpha: 1 },
            { sprite: 'playerHP1', alpha: 1 }
        ];
        this.player.useShield = false;
        this.player.speed = 5; // Regular movement speed
    }

    // Start the game
    this.gameState = 'playing';
    this.spawnWave();
};

/**
 * Load character-specific assets
 */
AlchemyBlaster.prototype.loadCharacterAssets = function(character) {
    if (character === 'aliza') {
        // Load Aliza's sprites
        this.loadImage('alizaleft', 'assets/images/darklings/alizaleft.png');
        this.loadImage('alizaright', 'assets/images/darklings/alizaright.png');
        this.loadImage('alizashot1', 'assets/images/darklings/alizashot1.png');
        this.loadImage('alizashot2', 'assets/images/darklings/alizashot2.png');
        this.loadImage('alizashot3', 'assets/images/darklings/alizashot3.png');
        this.loadImage('alizagameover', 'assets/images/darklings/alizagameover.png');
        this.loadImage('alizashotimpact1', 'assets/images/darklings/alizashotimpact1.png');
        this.loadImage('alizashotimpact2', 'assets/images/darklings/alizashotimpact2.png');
        
        // Load Aliza's sounds
        this.loadSound('alizavictory1', 'assets/sounds/alizavictory1.wav');
        this.loadSound('alizavictory2', 'assets/sounds/alizavictory2.wav');
        this.loadSound('alizagameover1', 'assets/sounds/alizagameover1.wav');
        this.loadSound('alizagameover2', 'assets/sounds/alizagameover2.wav');
        this.loadSound('alizahit1', 'assets/sounds/alizahit1.wav');
        this.loadSound('alizahit2', 'assets/sounds/alizahit2.wav');
    } else {
        // Load Dere's sprites
        this.loadImage('dereleft', 'assets/images/darklings/dereleft.png');
        this.loadImage('dereright', 'assets/images/darklings/dereright.png');
        this.loadImage('derehp1', 'assets/images/darklings/derehp1.png');
        this.loadImage('derehp2', 'assets/images/darklings/derehp2.png');
        this.loadImage('derehp3', 'assets/images/darklings/derehp3.png');
        this.loadImage('shot1', 'assets/images/darklings/shot1.png');
        this.loadImage('shot1a', 'assets/images/darklings/shot1a.png');
        this.loadImage('shot1b', 'assets/images/darklings/shot1b.png');
        this.loadImage('shotimpact1', 'assets/images/darklings/shotimpact1.png');
        this.loadImage('shotimpact2', 'assets/images/darklings/shotimpact2.png');
        this.loadImage('deregameover', 'assets/images/darklings/deregameover.png');
    }
    
    // Load common assets
    this.loadImage('power_potion', 'assets/images/darklings/power_potion.png');
    this.loadImage('shield_potion', 'assets/images/darklings/shield_potion.png');
    this.loadImage('health_potion', 'assets/images/darklings/health_potion.png');
};

/**
 * Draw the player character
 */
AlchemyBlaster.prototype.drawPlayer = function() {
    // Draw player sprite based on selected character
    const ctx = this.ctx;
    const player = this.player;
    
    // Draw the player sprite
    const sprite = this.assets.images[player.currentSprite];
    if (sprite && sprite.complete) {
        ctx.drawImage(sprite, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    }
    
    // Draw Dere's health layers if using Dere
    if (this.selectedCharacter === 'dere') {
        // Draw health layers on top of player sprite
        const hp1 = this.assets.images.derehp1;
        if (hp1 && hp1.complete) {
            ctx.globalAlpha = 0.8;
            ctx.drawImage(hp1, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
            ctx.globalAlpha = 1.0;
        }
        
        if (player.health >= 2) {
            const hp2 = this.assets.images.derehp2;
            if (hp2 && hp2.complete) {
                ctx.globalAlpha = 0.8;
                ctx.drawImage(hp2, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
                ctx.globalAlpha = 1.0;
            }
        }
        
        if (player.health >= 3) {
            const hp3 = this.assets.images.derehp3;
            if (hp3 && hp3.complete) {
                ctx.globalAlpha = 0.8;
                ctx.drawImage(hp3, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
                ctx.globalAlpha = 1.0;
            }
        }
    } else if (this.selectedCharacter === 'aliza' && player.shield > 0) {
        // Draw Aliza's shield if she has shield remaining
        const barX = 20;  // Define barX for the shield bar
        const barY = this.canvas.height - 50; // Define barY for the shield bar
        const barWidth = 150; // Define barWidth for the shield bar
        const barHeight = 15; // Define barHeight for the shield bar
        
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width / 1.5, 0, Math.PI * 2);
        
        // Make shield color and opacity based on shield percentage
        const shieldPercent = player.shield / player.maxShield;
        ctx.globalAlpha = Math.max(0.2, shieldPercent);
        
        // Create gradient for shield
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#3355ff');
        gradient.addColorStop(0.5, '#33ccff');
        gradient.addColorStop(1, '#33ffff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * shieldPercent, barHeight);
        
        // Shield bar border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Shield', barX - 10, barY + barHeight / 2 + 4);
        
        // Draw HP indicator
        ctx.fillStyle = '#ff5555';
        ctx.fillRect(this.canvas.width - 50, 45, 30, 15);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(this.canvas.width - 50, 45, 30, 15);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('HP', this.canvas.width - 60, 55);
    }
    
    // Draw special ability cooldown for both characters
    // This would typically be a burst attack or shield boost
    const cooldownBarWidth = 100;
    const cooldownBarHeight = 10;
    const cooldownBarX = 20;
    const cooldownBarY = this.canvas.height - 30;
    
    // Default cooldown time (5 seconds)
    const cooldownTime = this.selectedCharacter === 'aliza' ? 3000 : 5000;
    const cooldownRemaining = Math.max(0, cooldownTime - (Date.now() - (this.lastSpecialUseTime || 0)));
    const cooldownPercent = 1 - (cooldownRemaining / cooldownTime);
    
    // Cooldown bar background
    ctx.fillStyle = '#333333';
    ctx.fillRect(cooldownBarX, cooldownBarY, cooldownBarWidth, cooldownBarHeight);
    
    // Cooldown bar fill
    ctx.fillStyle = cooldownPercent >= 1 ? '#33ff33' : '#ff9933';
    ctx.fillRect(cooldownBarX, cooldownBarY, cooldownBarWidth * cooldownPercent, cooldownBarHeight);
    
    // Cooldown bar border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cooldownBarX, cooldownBarY, cooldownBarWidth, cooldownBarHeight);
    
    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Special', cooldownBarX, cooldownBarY - 5);
    
    // Display a "READY" indicator if special is available
    if (cooldownPercent >= 1) {
        ctx.fillStyle = '#33ff33';
        ctx.fillText('READY', cooldownBarX + cooldownBarWidth + 10, cooldownBarY + cooldownBarHeight / 2 + 4);
    }
};

/**
 * Handle player being hit
 */
AlchemyBlaster.prototype.playerHit = function() {
    const player = this.player;
    
    // Set last hit time for invulnerability and shield regen delay
    player.lastHitTime = Date.now();
    
    if (this.selectedCharacter === 'aliza' && player.useShield && player.shield > 0) {
        // Aliza's shield absorbs the hit
        player.shield = Math.max(0, player.shield - 25);
        
        // Play shield hit sound
        this.playRandomSound(['alizahit1', 'alizahit2']);
    } else {
        // Reduce health
        player.health--;
        
        // Check if game over
        if (player.health <= 0) {
            this.gameOver();
            return;
        }
        
        // Play hit sound based on character
        if (this.selectedCharacter === 'aliza') {
            this.playRandomSound(['alizahit1', 'alizahit2']);
        } else {
            // Assuming Dere has hit sounds
            this.playSound('playerhit');
        }
    }
};

/**
 * Play a random sound from a list
 */
AlchemyBlaster.prototype.playRandomSound = function(soundList) {
    if (!soundList || soundList.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * soundList.length);
    this.playSound(soundList[randomIndex]);
};

/**
 * Handle game over
 */
AlchemyBlaster.prototype.gameOver = function() {
    this.gameState = 'gameOver';
    
    // Play game over sound based on character
    if (this.selectedCharacter === 'aliza') {
        this.playRandomSound(['alizagameover1', 'alizagameover2']);
    } else {
        // Assuming Dere has a game over sound
        this.playSound('gameover');
    }
    
    // Show game over screen after a short delay
    setTimeout(() => {
        this.showGameOverScreen();
    }, 1000);
};

/**
 * Show game over screen
 */
AlchemyBlaster.prototype.showGameOverScreen = function() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game over background
    ctx.fillStyle = '#220000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game over text
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 100);
    
    // Draw score
    ctx.font = '30px Arial';
    ctx.fillText(`Your Score: ${this.score}`, canvas.width / 2, 160);
    
    // Draw character game over sprite
    const gameOverSprite = this.assets.images[this.selectedCharacter === 'aliza' ? 'alizagameover' : 'deregameover'];
    if (gameOverSprite && gameOverSprite.complete) {
        const spriteWidth = 200;
        const spriteHeight = 200;
        ctx.drawImage(gameOverSprite, canvas.width / 2 - spriteWidth / 2, 200, spriteWidth, spriteHeight);
    }
    
    // Draw retry prompt
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER to try again', canvas.width / 2, canvas.height - 100);
};

/**
 * Handle user input
 */
AlchemyBlaster.prototype.handleInput = function(key) {
    // Different input handling based on game state
    switch (this.gameState) {
        case 'characterSelection':
            this.handleCharacterSelectionInput(key);
            break;
        case 'playing':
            this.handleGamePlayInput(key);
            break;
        case 'paused':
            if (key === 'p' || key === 'Escape') {
                this.togglePause();
            }
            break;
        case 'gameOver':
            if (key === 'Enter') {
                this.showCharacterSelection();
            }
            break;
        case 'title':
            if (key === 'Enter' || key === ' ') {
                this.showCharacterSelection();
            }
            break;
    }
};

/**
 * Handle input during gameplay
 */
AlchemyBlaster.prototype.handleGamePlayInput = function(key) {
    switch (key) {
        case 'ArrowLeft':
            this.movePlayerLeft();
            break;
        case 'ArrowRight':
            this.movePlayerRight();
            break;
        case ' ':
            this.fireProjectile();
            break;
        case 'Shift':
            this.useSpecialAbility();
            break;
        case 'p':
        case 'Escape':
            this.togglePause();
            break;
    }
};

/**
 * Move player left
 */
AlchemyBlaster.prototype.movePlayerLeft = function() {
    // Update player direction for sprite
    this.player.currentSprite = this.selectedCharacter === 'aliza' ? 'alizaleft' : 'dereleft';
    
    // Move player based on their speed
    this.player.x = Math.max(this.player.width / 2, this.player.x - this.player.speed);
};

/**
 * Move player right
 */
AlchemyBlaster.prototype.movePlayerRight = function() {
    // Update player direction for sprite
    this.player.currentSprite = this.selectedCharacter === 'alizaright' ? 'alizaright' : 'dereright';
    
    // Move player based on their speed
    this.player.x = Math.min(this.canvas.width - this.player.width / 2, this.player.x + this.player.speed);
};

/**
 * Fire a projectile
 */
AlchemyBlaster.prototype.fireProjectile = function() {
    const player = this.player;
    const now = Date.now();
    
    // Check fire rate cooldown
    if (now - (this.lastFireTime || 0) < 200) {
        return;
    }
    
    this.lastFireTime = now;
    
    // Determine projectile sprite
    const shotIndex = Math.floor(Math.random() * player.shots.length);
    const shotSprite = player.shots[shotIndex];
    
    // Calculate projectile origin based on character
    let shotOriginX = player.x;
    let shotOriginY = player.y - player.height / 2;
    
    if (this.selectedCharacter === 'dere') {
        // Dere has directional offset based on facing direction
        if (player.currentSprite === 'dereleft') {
            shotOriginX += 5; // North-east when facing left
            shotOriginY -= 5; // North-east when facing left
        } else {
            shotOriginX -= 5; // North-west when facing right
            shotOriginY -= 5; // North-west when facing right
        }
    }
    
    // Create new projectile
    this.projectiles.push(new PlayerProjectile(
        this,
        shotOriginX,
        shotOriginY,
        shotSprite,
        this.player.projectileSpeed,
        this.player.projectileScale
    ));
    
    // Play shot sound
    this.playSound('playershot');
};

/**
 * Use character special ability
 */
AlchemyBlaster.prototype.useSpecialAbility = function() {
    const now = Date.now();
    const cooldownTime = this.selectedCharacter === 'aliza' ? 3000 : 5000;
    
    // Check if special ability is on cooldown
    if (now - (this.lastSpecialUseTime || 0) < cooldownTime) {
        return;
    }
    
    this.lastSpecialUseTime = now;
    
    if (this.selectedCharacter === 'aliza') {
        // Aliza's special: Burst fire (multiple projectiles)
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                // Alternate between largest shots
                const shotSprite = i % 2 === 0 ? 'alizashot1' : 'alizashot3';
                
                this.projectiles.push(new PlayerProjectile(
                    this,
                    this.player.x,
                    this.player.y - this.player.height / 2,
                    shotSprite,
                    this.player.projectileSpeed * 1.2,
                    this.player.projectileScale * 1.2
                ));
            }, i * 100); // Stagger shots over time
        }
    } else {
        // Dere's special: Triple shot in spread pattern
        for (let angle = -20; angle <= 20; angle += 20) {
            const rad = angle * Math.PI / 180;
            const dx = Math.sin(rad) * 5;
            
            this.projectiles.push(new PlayerProjectile(
                this,
                this.player.x + dx,
                this.player.y - this.player.height / 2,
                'shot1',
                this.player.projectileSpeed,
                this.player.projectileScale
            ));
        }
    }
    
    // Play special ability sound
    this.playSound('special');
};

AlchemyBlaster.prototype.fireSpecialAttack = function() {
    if (!this.player) return;
    
    // Don't fire if cooldown hasn't finished yet
    const now = Date.now();
    if (!this.player.canBurstFire) {
        return false;
    }
    
    // Use different special attacks based on character
    if (this.selectedCharacter === 'aliza') {
        // Aliza's special attack: seeking projectiles that pass through enemies
        
        // Play special attack sound
        const spellSound = this.assets.sounds.spellfire[Math.floor(Math.random() * this.assets.sounds.spellfire.length)];
        if (spellSound) {
            spellSound.currentTime = 0;
            spellSound.play().catch(e => console.error("Error playing spell sound:", e));
        }
        
        // Create seeking projectile through the ProjectileManager
        if (this.projectileManager) {
            // Player position
            const playerX = this.player.x + (this.player.width / 2);
            const playerY = this.player.y;
            
            // Create a seeking projectile with passthrough ability and larger hitbox
            this.projectileManager.createSeekingProjectile(playerX, playerY, {
                sprite: 'alizashotimpact1',
                damage: 10,
                width: 80,  // Double the width from 40 to 80
                height: 80, // Double the height from 40 to 80
                passThrough: true, // Explicitly enable passthrough
                maxTargets: 10,     // Allow hitting up to 10 enemies before disappearing
                seekSpeed: 4.5     // Slightly slower to make it more visible as it seeks targets
            });
            
            // Add secondary orbital projectiles that circle around the main one
            for (let i = 0; i < 3; i++) {
                const angle = (i * 120) * Math.PI / 180; // Evenly space 3 orbitals
                const offsetX = Math.cos(angle) * 40;
                const offsetY = Math.sin(angle) * 40;
                
                this.projectileManager.createOrbitalProjectile(
                    playerX + offsetX,
                    playerY + offsetY,
                    {
                        sprite: 'alizaShot2',
                        damage: 10,
                        width: 80,
                        height: 80,
                        orbitRadius: 40,
                        orbitSpeed: 0.1,
                        passThrough: true,
                        maxTargets: 10, // Allow hitting up to 10 enemies before disappearing
                        lifespan: 5000 // 4 seconds lifespan
                    }
                );
            }
            
            // Create visual effect for special attack launch
            this.particleSystem.createExplosion(playerX, playerY - 30, 'special');
            
            // Set cooldown
            this.player.canBurstFire = false;
            this.player.lastBurstFire = now;
            
            // Reset cooldown after delay
            setTimeout(() => {
                this.player.canBurstFire = true;
            }, this.player.burstFireCooldown);
            
            return true;
        }
    } else if (this.selectedCharacter === 'dere') {
        // Dere's special attack (original)
        // (code for Dere's special attack would go here)
    } else if (this.selectedCharacter === 'shinshi') {
        // Shinshi's special attack (beam-based)
        // (code for Shinshi's special attack would go here)
    }
    
    return false;
};

Player.prototype.triggerBurstFire = function() {
    if (!this.canBurstFire) return false;
    
    const now = Date.now();
    this.isBurstFiring = true;
    this.lastBurstFire = now;
    
    // Trigger the special attack in the game controller
    if (this.game && this.game.fireSpecialAttack) {
        this.game.fireSpecialAttack();
    }
    
    // Set cooldown status
    this.canBurstFire = false;
    
    // Reset cooldown after delay
    setTimeout(() => {
        this.canBurstFire = true;
        this.isBurstFiring = false;
    }, this.burstFireCooldown);
    
    return true;
};

class Enemy {
    constructor(x, y, type, game, pattern) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.game = game;
        this.pattern = pattern;
        this.width = 50;
        this.height = 50;
        this.spawnTime = Date.now();
        this.lastShot = 0;
        this.shotCooldown = 2000; // Default shot cooldown
        this.isInvulnerable = false;
        this.fadeAlpha = 1;
        this.shieldActive = false;
        this.shieldCooldown = 0;
        this.position = { x: this.x, y: this.y };
        
        // Set isFlyby flag for specific enemy types that should be excluded from wave completion
        // Ensuring mid-bosses are NEVER flyby enemies
        this.isFlyby = (this.type === 'darkling1' || this.type === 'darkling9') && 
                      !this.type.startsWith('darkmidboss') && 
                      !this.type.includes('boss');
        
        // For flyby enemies, set their initial vertical position to be near the top of the screen
        if (this.isFlyby) {
            // Position flyby enemies in the top 25% of the screen (between y = 50 and y = canvas.height * 0.25)
            this.y = Math.min(this.y, 50 + Math.random() * (game.canvas.height * 0.25 - 50));
        }
    }

    update(time) {
        // Check if darkling1 or darkling9 should flee
        if ((this.type === 'darkling1' && time - this.spawnTime > 20000) ||
            (this.type === 'darkling9' && time - this.spawnTime > 15000)) {
            // Increase fade duration for flyby enemies (slower fade)
            this.fadeAlpha -= 0.03;
            if (this.fadeAlpha <= 0) {
                return true; // Remove the enemy
            }
        }

        // Get position update
        let pos;
        if (this.isFlyby) {
            // Custom pattern handling for flyby enemies to keep them near the top
            // and slow down their movement
            const elapsed = (time - this.spawnTime) / 1000;
            
            // Create horizontal oscillation pattern with vertical constraint
            const xAmplitude = this.game.canvas.width * 0.4; // 40% of canvas width
            const period = 10; // seconds for a complete oscillation
            const horizontalSpeed = 0.5; // Slow horizontal movement
            const xOffset = Math.sin(elapsed * horizontalSpeed) * xAmplitude;
            
            // Keep vertical position constrained to top 25% of screen
            const maxY = this.game.canvas.height * 0.25;
            const minY = 50;
            const verticalPosition = minY + (Math.sin(elapsed * 0.3) + 1) * 0.5 * (maxY - minY);
            
            pos = { x: xOffset, y: verticalPosition };
        } else {
            // Use original pattern for non-flyby enemies
            pos = this.pattern(time);
        }
        
        // Allow enemies to appear in full vertical range (except flyby enemies)
        this.x = Math.max(this.width/2, Math.min(this.game.canvas.width - this.width/2,
                    this.game.canvas.width/2 + pos.x));
        this.y = pos.y; // Position Y using pattern result
        
        // Update position object to match coordinates
        this.position.x = this.x;
        this.position.y = this.y;

        // Handle shield cooldown for darkling4
        if (this.type === 'darkling4' && this.shieldCooldown > 0) {
            this.shieldCooldown--;
            if (this.shieldCooldown === 0) {
                this.shieldActive = false;
            }
        }

        // Handle shooting - Skip shooting for flyby enemies
        if (time - this.lastShot >= this.shotCooldown && !this.isInvulnerable && !this.isFlyby) {
            this.shoot();
            this.lastShot = time;
        }
        return false;
    }

    draw() {
        const sprite = this.game.assets.images[this.type];
        if (sprite) {
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.fadeAlpha;
            this.game.ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            this.game.ctx.restore();
        }
    }

    shoot() {
        this.game.player.shoot();
    }
}