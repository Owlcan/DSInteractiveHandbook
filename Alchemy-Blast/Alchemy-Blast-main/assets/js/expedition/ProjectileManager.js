/**
 * Projectile Manager for Alchemy Blaster
 */
class ProjectileManager {
    constructor(game) {
        this.game = game;
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.seekingProjectiles = []; // For Aliza's seeking projectiles
        
        // Special projectile effects
        this.beams = [];        // For Shinshi's beam attacks
        this.specialBeams = []; // For Shinshi's special beam attacks
        this.dereSpecialShot = null; // For Dere's special attack animation
        
        // Store reference to audio manager
        this.audioManager = game.audioManager || null;
    }
    
    /**
     * Update all projectiles
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        this.updatePlayerProjectiles(deltaTime);
        this.updateEnemyProjectiles(deltaTime);
        this.updateSeekingProjectiles(deltaTime);
        this.updateBeams(deltaTime);
        this.updateSpecialBeams(deltaTime);
        this.updateDereSpecialShot(deltaTime);
        
        this.checkCollisions();
    }
    
    /**
     * Update player projectiles
     * @param {number} deltaTime - Time elapsed since last update
     */
    updatePlayerProjectiles(deltaTime) {
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            
            // Update position
            projectile.x += projectile.vx * (deltaTime / 16);
            projectile.y += projectile.vy * (deltaTime / 16);
            
            // FIXED: Using much more generous boundaries to ensure projectiles
            // from all parts of the screen (especially top half) are visible
            // By using canvas dimensions we ensure all projectiles within view are kept
            const canvas = this.game.canvas || { width: 800, height: 960 };
            if (projectile.y < -canvas.height || projectile.y > canvas.height * 2 || 
                projectile.x < -canvas.width || projectile.x > canvas.width * 2) {
                this.playerProjectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Update enemy projectiles
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateEnemyProjectiles(deltaTime) {
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            
            // Update position
            projectile.x += projectile.vx * (deltaTime / 16);
            projectile.y += projectile.vy * (deltaTime / 16);
            
            // Update rotation for rotating projectiles
            if (projectile.rotate && projectile.rotationSpeed) {
                projectile.rotation = (projectile.rotation || 0) + projectile.rotationSpeed * (deltaTime / 16);
            }
            
            // FIXED: Much more generous boundary conditions to ensure projectiles from all parts of screen
            // are visible. This especially helps with projectiles starting above the center-Y which often
            // have negative Y coordinates in game space.
            const canvas = this.game.canvas || { width: 800, height: 960 };
            if (projectile.y < -canvas.height * 2 || projectile.y > canvas.height * 2 || 
                projectile.x < -canvas.width * 2 || projectile.x > canvas.width * 2) {
                this.enemyProjectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Update seeking projectiles (Aliza's special attack)
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateSeekingProjectiles(deltaTime) {
        const gameController = this.game.gameController;
        
        for (let i = this.seekingProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.seekingProjectiles[i];
            
            // Check if the projectile lifetime has expired
            if (projectile.lifespan && Date.now() - projectile.createdAt > projectile.lifespan) {
                // Create a fade-out effect before removing
                this.game.particleSystem.createHitEffect(projectile.x, projectile.y, 'fade');
                this.seekingProjectiles.splice(i, 1);
                continue;
            }
            
            // Check if projectile has orbit properties (orbital projectile)
            if (projectile.orbit) {
                // Update orbit position
                projectile.orbit.angle += projectile.orbit.speed;
                
                // Update orbital projectile position
                projectile.x = projectile.orbit.center.x + Math.cos(projectile.orbit.angle) * projectile.orbit.radius;
                projectile.y = projectile.orbit.center.y + Math.sin(projectile.orbit.angle) * projectile.orbit.radius;
                
                // Update orbital center to follow player
                projectile.orbit.center.x = gameController.player.position.x;
                projectile.orbit.center.y = gameController.player.position.y;
                
                // Create trail particle effect
                if (Math.random() < 0.2) {
                    this.game.particleSystem.createTrailEffect(projectile.x, projectile.y, 'orbital');
                }
            } else {
                // Standard seeking projectile behavior
                // Find the closest enemy to target
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                for (const enemy of gameController.enemies) {
                    if (!enemy.destroyed) {
                        const dx = enemy.position.x - projectile.x;
                        const dy = enemy.position.y - projectile.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEnemy = enemy;
                        }
                    }
                }
                
                // If there's a target, adjust trajectory to seek it
                if (closestEnemy) {
                    const dx = closestEnemy.position.x - projectile.x;
                    const dy = closestEnemy.position.y - projectile.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Normalize direction vector
                    const dirX = dx / distance;
                    const dirY = dy / distance;
                    
                    // Gradually adjust velocity towards target
                    const seekingStrength = projectile.seekSpeed || 0.15;
                    projectile.vx += dirX * seekingStrength;
                    projectile.vy += dirY * seekingStrength;
                    
                    // Limit maximum speed
                    const speed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                    if (speed > (projectile.maxSpeed || 3)) {
                        projectile.vx = (projectile.vx / speed) * (projectile.maxSpeed || 3);
                        projectile.vy = (projectile.vy / speed) * (projectile.maxSpeed || 3);
                    }
                }
                
                // Update position for non-orbital projectiles
                projectile.x += projectile.vx * (deltaTime / 16);
                projectile.y += projectile.vy * (deltaTime / 16);
                
                // Create trail particle effect
                if (Math.random() < 0.3) {
                    this.game.particleSystem.createTrailEffect(projectile.x, projectile.y, 'seeking');
                }
            }
            
            // Handle rotation for all seeking projectiles
            if (projectile.rotationSpeed) {
                projectile.rotation = (projectile.rotation || 0) + projectile.rotationSpeed * (deltaTime / 16);
            }
            
            // Check if non-orbital projectile is off-screen
            if (!projectile.orbit) {
                const canvas = this.game.canvas || { width: 800, height: 960 };
                if (projectile.y < -canvas.height || projectile.y > canvas.height * 2 || 
                    projectile.x < -canvas.width || projectile.x > canvas.width * 2) {
                    this.seekingProjectiles.splice(i, 1);
                }
            }
        }
    }
    
    /**
     * Update beam attacks (for Shinshi character)
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateBeams(deltaTime) {
        // Remove beams if no longer active
        if (this.game.gameController.selectedCharacter === 'shinshi' && 
            !this.game.gameController.player.isBeamActive) {
            this.beams = [];
        }
        
        // Otherwise, beams stay active as long as fire button is held
    }
    
    /**
     * Update special beam attacks (for Shinshi character)
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateSpecialBeams(deltaTime) {
        for (let i = this.specialBeams.length - 1; i >= 0; i--) {
            const beam = this.specialBeams[i];
            
            // Check if beam has expired
            if (Date.now() - beam.createdAt > 800) { // 800ms duration for special beams
                this.specialBeams.splice(i, 1);
            }
        }
    }
    
    /**
     * Update Dere's special shot animation
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateDereSpecialShot(deltaTime) {
        if (this.dereSpecialShot) {
            // Move the shot upward
            this.dereSpecialShot.y -= this.dereSpecialShot.speed * (deltaTime / 16);
            
            // Check if animation is complete (shot has left the screen)
            if (this.dereSpecialShot.y + this.dereSpecialShot.height < -this.game.canvas.height) {
                this.dereSpecialShot = null;
            }
        }
    }
    
    /**
     * Create a player projectile
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createPlayerProjectile(x, y, vx, vy, options = {}) {
        const projectile = {
            x,
            y,
            vx,
            vy,
            sprite: options.sprite || 0,
            damage: options.damage || 1,
            width: options.width || 20,
            height: options.height || 20,
            hit: false
        };
        
        this.playerProjectiles.push(projectile);
        
        // Play sound effect if audio manager is available
        if (this.audioManager && !options.silent) {
            this.audioManager.playSfx('playerShot');
        }
        
        return projectile;
    }
    
    /**
     * Create a seeking projectile (Aliza's special attack)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createSeekingProjectile(x, y, options = {}) {
        // Initial velocity (can be random or targeted)
        const angle = options.angle || (Math.random() * Math.PI * 0.5) - (Math.PI * 0.25);
        const speed = options.initialSpeed || 1.5; // Start slow
        
        const projectile = {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            width: options.width || 30,
            height: options.height || 30,
            damage: options.damage || 2, // Higher damage
            sprite: options.sprite || 'alizaShot3', // Use Aliza's special projectile sprite
            maxSpeed: options.maxSpeed || 3, // Maximum speed cap
            passthrough: true, // Enables pass-through behavior
            createdAt: Date.now(),
            rotation: 0,
            rotationSpeed: 0.2 // Gives the projectile a spinning effect
        };
        
        this.seekingProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create an orbital projectile that circles around the player (Aliza's special attack)
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created orbital projectile
     */
    createOrbitalProjectile(x, y, options = {}) {
        const orbitCenter = {
            x: this.game.gameController.player.position.x,
            y: this.game.gameController.player.position.y
        };
        
        // Calculate initial angle based on position relative to center
        const dx = x - orbitCenter.x;
        const dy = y - orbitCenter.y;
        const initialAngle = Math.atan2(dy, dx);
        
        const projectile = {
            x, // Current position
            y,
            width: options.width || 40,
            height: options.height || 40,
            damage: options.damage || 5,
            sprite: options.sprite || 'alizaShot2',
            orbit: {
                center: orbitCenter,
                radius: options.orbitRadius || 40,
                angle: initialAngle,
                speed: options.orbitSpeed || 0.05
            },
            passthrough: options.passThrough || false,
            maxTargets: options.maxTargets || 3,
            targetsHit: 0,
            createdAt: Date.now(),
            lifespan: options.lifespan || 3000, // Default 3s lifespan
            rotation: 0,
            rotationSpeed: 0.1
        };
        
        // Add to seeking projectiles - they share similar behavior
        this.seekingProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create an enemy projectile
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createEnemyProjectile(x, y, options = {}) {
        // Adjust the player's position for targeting
        const playerX = this.game.gameController.player.position.x;
        // Use the player's actual Y position - no offset adjustment needed anymore
        const playerY = this.game.gameController.player.position.y;
        
        // Calculate direction to player
        const dx = playerX - x;
        const dy = playerY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const speed = options.speed || 3;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        
        // Play sound effect if audio manager is available
        if (this.audioManager && !options.silent) {
            this.audioManager.playSfx('enemyShot');
        }
        
        return this.createEnemyProjectileWithVelocity(x, y, vx, vy, options);
    }
    
    /**
     * Create an enemy projectile with specific velocity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createEnemyProjectileWithVelocity(x, y, vx, vy, options = {}) {
        const projectile = {
            x,
            y,
            vx,
            vy,
            width: options.width || 30,
            height: options.height || 30,
            damage: options.damage || 1,
            hit: false,
            sprite: options.sprite || 'darklingshot1',
            rotate: options.rotate || false,
            rotationSpeed: options.rotationSpeed || 0,
            rotation: 0
        };
        
        this.enemyProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create a targeted enemy projectile that aims directly at the player
     * @param {number} x - X position of the enemy
     * @param {number} y - Y position of the enemy
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createTargetedEnemyProjectile(x, y, options = {}) {
        // Get player's position
        const playerX = this.game.gameController.player.position.x;
        // Use the player's actual Y position - no offset adjustment needed anymore
        const playerY = this.game.gameController.player.position.y;
        
        // Calculate angle to player
        const dx = playerX - x;
        const dy = playerY - y;
        const angle = Math.atan2(dy, dx);
        
        // Create projectile with calculated velocity
        const speed = options.speed || 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        return this.createEnemyProjectileWithVelocity(x, y, vx, vy, options);
    }
    
    /**
     * Create a beam attack for Shinshi character
     * @param {number} x - X position of beam origin
     * @param {number} y - Y position of beam origin
     * @param {number} level - Beam power level (1-3)
     * @returns {Object} The created beam
     */
    createBeam(x, y, level) {
        // Just use the current position for the beam, no offset adjustment needed anymore
        const beam = {
            x,
            y,
            width: level === 1 ? 15 : level === 2 ? 30 : 45,
            damage: level === 3 ? 2 : 1,
            level: level,
            createdAt: Date.now()
        };
        
        this.beams.push(beam);
        return beam;
    }
    
    /**
     * Create a special beam attack for Shinshi character (horizontal screen-wide beams)
     * @param {number} count - Number of beams to create
     * @returns {Array} The created beams
     */
    createSpecialBeams(count) {
        const beams = [];
        const screenHeight = this.game.canvas.height;
        const beamHeight = 40;
        
        this.specialBeams = []; // Clear existing special beams
        
        for (let i = 0; i < count; i++) {
            // Position beams evenly across the screen, using game coordinates
            const verticalSpacing = screenHeight / (count + 1);
            const yPosition = -screenHeight/2 + (i + 1) * verticalSpacing;
            
            const beam = {
                y: yPosition,
                width: this.game.canvas.width,
                height: beamHeight,
                damage: 10,
                direction: i % 2 === 0 ? 'right' : 'left', // Alternating directions
                createdAt: Date.now()
            };
            
            this.specialBeams.push(beam);
            beams.push(beam);
        }
        
        return beams;
    }
    
    /**
     * Create Dere's special attack animation
     * This creates a visual effect alongside the actual game mechanic
     * @returns {Object} The created special shot object
     */
    createDereSpecialShot() {
        // Get canvas dimensions
        const canvas = this.game.canvas || { width: 800, height: 960 };
        
        // Create special shot object
        this.dereSpecialShot = {
            x: this.game.gameController.player.position.x,
            y: canvas.height, // Start from bottom of screen
            width: 100, // Width of the special shot
            height: canvas.height, // Height spans the full screen
            speed: 20, // Animation speed
            sprite: 'derespecialshot', // Sprite name
            createdAt: Date.now(),
            duration: 1500 // Duration in milliseconds
        };
        
        return this.dereSpecialShot;
    }
    
    /**
     * Check for collisions between projectiles and targets
     */
    checkCollisions() {
        const gameController = this.game.gameController;
        if (!gameController || !gameController.player) return;
        
        // Check player projectiles vs enemies
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            if (projectile.hit) continue; // Skip already hit projectiles
            
            for (const enemy of gameController.enemies) {
                // Calculate distance
                const dx = enemy.position.x - projectile.x;
                const dy = enemy.position.y - projectile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Adjust hitbox based on enemy type
                const enemyHitboxSize = 
                    enemy.type === 'darklingboss3' ? 90 : // Much larger hitbox for final boss
                    enemy.type === 'darkling11' || enemy.type === 'darkling12' ? 60 : // Larger hitbox for vanguard minions
                    enemy.type === 'darkling13' ? 50 : // Slightly smaller than other vanguard minions
                    enemy.type.includes('boss') ? 40 : 25; // Standard sizes for other enemies
                
                const projectileHitboxSize = 15;
                
                if (distance < enemyHitboxSize + projectileHitboxSize) {
                    // Mark projectile as hit
                    projectile.hit = true;
                    
                    // Deal damage to enemy
                    enemy.health -= projectile.damage || 1;
                    
                    // Create hit particle effect
                    this.game.particleSystem.createHitEffect(projectile.x, projectile.y);
                    
                    // Play hit sound
                    if (this.audioManager) {
                        this.audioManager.playSfx('hit');
                    }
                    
                    // Check if enemy was defeated
                    if (enemy.health <= 0) {
                        // Create defeat effect
                        this.game.particleSystem.createExplosion(
                            enemy.position.x, 
                            enemy.position.y
                        );
                        
                        // Play explosion sound
                        if (this.audioManager) {
                            this.audioManager.playSfx('explosion');
                        }
                        
                        // Check for potion drop
                        const potionDrop = gameController.monsterLogic.getPotionDrop(enemy.type);
                        if (potionDrop) {
                            gameController.addPowerup(
                                enemy.position.x,
                                enemy.position.y,
                                potionDrop.type
                            );
                        }
                        
                        // Add score and mark enemy for removal
                        gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                        enemy.destroyed = true;
                    }
                    
                    break;
                }
            }
            
            // Remove hit projectiles
            if (this.playerProjectiles[i].hit) {
                this.playerProjectiles.splice(i, 1);
            }
        }
        
        // Check seeking projectiles vs enemies (special passthrough behavior)
        for (let i = this.seekingProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.seekingProjectiles[i];
            
            for (const enemy of gameController.enemies) {
                if (enemy.destroyed) continue;
                
                // Calculate distance
                const dx = enemy.position.x - projectile.x;
                const dy = enemy.position.y - projectile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Adjust hitbox based on enemy type
                const enemyHitboxSize = enemy.type.includes('boss') ? 40 : 25;
                const projectileHitboxSize = 20;
                
                if (distance < enemyHitboxSize + projectileHitboxSize) {
                    // Deal damage to enemy (don't remove projectile due to passthrough)
                    enemy.health -= projectile.damage;
                    
                    // Create hit particle effect
                    this.game.particleSystem.createHitEffect(
                        enemy.position.x, 
                        enemy.position.y, 
                        'seeking'
                    );
                    
                    // Prevent multiple hits to the same enemy in rapid succession
                    if (!enemy.lastSeekingHitTime || Date.now() - enemy.lastSeekingHitTime > 500) {
                        enemy.lastSeekingHitTime = Date.now();
                        
                        // Check if enemy was defeated
                        if (enemy.health <= 0) {
                            // Create defeat effect
                            this.game.particleSystem.createExplosion(
                                enemy.position.x, 
                                enemy.position.y
                            );
                            
                            // Play explosion sound
                            if (this.audioManager) {
                                this.audioManager.playSfx('explosion');
                            }
                            
                            // Check for potion drop
                            const potionDrop = gameController.monsterLogic.getPotionDrop(enemy.type);
                            if (potionDrop) {
                                gameController.addPowerup(
                                    enemy.position.x,
                                    enemy.position.y,
                                    potionDrop.type
                                );
                            }
                            
                            // Add score and mark enemy for removal
                            gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                            enemy.destroyed = true;
                        }
                    }
                }
            }
        }
        
        // Check enemy projectiles vs player
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            if (projectile.hit) continue;
            
            const player = gameController.player;
            // Player hitbox size
            const playerHitboxSize = 20;
            
            // Calculate distance for collision
            const dx = player.position.x - projectile.x;
            const dy = player.position.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < playerHitboxSize + (projectile.width / 2)) {
                projectile.hit = true;
                
                // Deal damage to player
                if (!player.isInvulnerable) {
                    gameController.handlePlayerHit(projectile.damage || 1);
                    
                    // Create hit effect
                    this.game.particleSystem.createPlayerHitEffect(
                        player.position.x,
                        player.position.y
                    );
                    
                    // Play hit sound if not handled by game controller
                    if (this.audioManager && !player.isInvulnerable) {
                        // Let game controller handle the specific character hit sounds
                    }
                }
                
                // Remove hit projectile
                this.enemyProjectiles.splice(i, 1);
            }
        }
        
        // Check beams vs enemies
        if (this.beams.length > 0) {
            for (const beam of this.beams) {
                for (const enemy of gameController.enemies) {
                    // For beam collision, check if enemy is within the beam's width
                    const dx = Math.abs(enemy.position.x - beam.x);
                    
                    // Only check enemies above the beam origin
                    if (dx < beam.width / 2 && enemy.position.y < beam.y) {
                        // Apply damage (with reduced rate for continuous beams)
                        if (!enemy.lastBeamHitTime || Date.now() - enemy.lastBeamHitTime > 100) {
                            enemy.health -= beam.damage;
                            enemy.lastBeamHitTime = Date.now();
                            
                            // Create small hit effect
                            this.game.particleSystem.createHitEffect(
                                enemy.position.x,
                                enemy.position.y,
                                'small'
                            );
                            
                            // Check if enemy was defeated
                            if (enemy.health <= 0) {
                                // Create defeat effect
                                this.game.particleSystem.createExplosion(
                                    enemy.position.x, 
                                    enemy.position.y
                                );
                                
                                // Play explosion sound
                                if (this.audioManager) {
                                    this.audioManager.playSfx('explosion');
                                }
                                
                                // Add score and mark enemy for removal
                                gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                                enemy.destroyed = true;
                            }
                        }
                    }
                }
            }
        }
        
        // Check special beams vs enemies
        if (this.specialBeams.length > 0) {
            for (const beam of this.specialBeams) {
                for (const enemy of gameController.enemies) {
                    // Special beams are horizontal, so check if enemy is within the beam's height
                    const dy = Math.abs(enemy.position.y - beam.y);
                    
                    if (dy < beam.height / 2) {
                        // Apply damage (with reduced rate for special beams)
                        if (!enemy.lastSpecialBeamHitTime || Date.now() - enemy.lastSpecialBeamHitTime > 100) {
                            enemy.health -= beam.damage;
                            enemy.lastSpecialBeamHitTime = Date.now();
                            
                            // Create hit effect
                            this.game.particleSystem.createHitEffect(
                                enemy.position.x,
                                enemy.position.y,
                                'beam'
                            );
                            
                            // Check if enemy was defeated
                            if (enemy.health <= 0) {
                                // Create defeat effect
                                this.game.particleSystem.createExplosion(
                                    enemy.position.x, 
                                    enemy.position.y
                                );
                                
                                // Play explosion sound
                                if (this.audioManager) {
                                    this.audioManager.playSfx('explosion');
                                }
                                
                                // Add score and mark enemy for removal
                                gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                                enemy.destroyed = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Get all active projectiles for rendering
     * @returns {Object} Object containing all projectile arrays
     */
    getProjectiles() {
        return {
            player: this.playerProjectiles,
            enemy: this.enemyProjectiles,
            seeking: this.seekingProjectiles,
            beams: this.beams,
            specialBeams: this.specialBeams
        };
    }
}

// Export the ProjectileManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProjectileManager };
}