/**
 * Player Aliza Logic for Alchemy Blaster
 * Handles Aliza-specific shot patterns and special attacks
 */
class PlayerAlizaLogic {
    constructor() {
        this.lastHitSoundIndex = 0;
        this.hitSounds = ['alizahit1', 'alizahit2'];
        this.burstCooldown = 3000; // 3 seconds cooldown for burst attack
        this.homingCooldown = 5000; // 5 seconds cooldown for homing shots
        
        // Direct sprite references to bypass renderer
        this.sprites = {
            left: null,
            right: null,
            shots: [],
            impacts: []
        };
        
        // Load sprites directly
        this.loadSprites();
        
        // Flag to indicate renderer bypass is active
        this.bypassRenderer = true;
    }

    /**
     * Load sprites directly to bypass renderer's sprite management
     */
    loadSprites() {
        // Directly load Aliza's sprites
        this.sprites.left = this.loadSprite('assets/images/darklings/alizaleft.png');
        this.sprites.right = this.loadSprite('assets/images/darklings/alizaright.png');
        this.sprites.select = this.loadSprite('assets/images/darklings/alizacharacterselect.png');
        this.sprites.gameover = this.loadSprite('assets/images/darklings/alizagameover.png');
        
        // Load shot sprites
        this.sprites.shots[1] = this.loadSprite('assets/images/darklings/alizashot1.png');
        this.sprites.shots[2] = this.loadSprite('assets/images/darklings/alizashot2.png');
        this.sprites.shots[3] = this.loadSprite('assets/images/darklings/alizashot3.png');
        
        // Load impact sprites
        this.sprites.impacts[1] = this.loadSprite('assets/images/darklings/alizashotimpact1.png');
        this.sprites.impacts[2] = this.loadSprite('assets/images/darklings/alizashotimpact2.png');
    }

    /**
     * Load a single sprite directly
     * @param {string} path - Path to sprite image
     * @returns {HTMLImageElement} - The image element
     */
    loadSprite(path) {
        const img = new Image();
        img.src = path;
        
        // Add error handling
        img.onerror = () => {
            console.error(`Failed to load Aliza sprite from path: ${path}`);
        };
        
        return img;
    }

    /**
     * Directly render Aliza and all her projectiles, bypassing the game renderer
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player state
     * @param {Object} projectiles - All projectiles
     */
    renderBypass(ctx, player, projectiles) {
        // Only proceed if bypass is active and we have sprites loaded
        if (!this.bypassRenderer || !this.sprites.left || !this.sprites.right) {
            return false; // Return false to indicate we didn't handle rendering
        }
        
        // Save context state
        ctx.save();
        
        try {
            // Render Aliza character
            this.renderCharacter(ctx, player);
            
            // Render Aliza's projectiles
            if (projectiles && projectiles.player) {
                this.renderProjectiles(ctx, projectiles.player);
            }
        } catch (e) {
            console.error('Error in Aliza renderer bypass:', e);
        }
        
        // Restore context
        ctx.restore();
        
        return true; // Return true to indicate we handled rendering
    }

    /**
     * Render Aliza character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player state
     */
    renderCharacter(ctx, player) {
        // Select sprite based on direction
        const sprite = player.direction === 'left' ? this.sprites.left : this.sprites.right;
        
        if (!sprite || !sprite.complete) {
            console.warn('Aliza sprite not loaded yet');
            return;
        }
        
        // Calculate flicker for invulnerability frames
        const isInvulnerable = Date.now() - player.lastDamageTime < 600;
        const shouldDraw = !isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0;
        
        if (shouldDraw) {
            // Calculate sprite dimensions - maintain aspect ratio
            const aspectRatio = sprite.height / sprite.width;
            const width = 60;
            const height = width * aspectRatio;
            
            // Draw centered at player position
            ctx.drawImage(
                sprite,
                player.position.x - width / 2,
                player.position.y - height / 2,
                width,
                height
            );
        }
        
        // Draw shield if present
        if (player.shield > 0) {
            this.renderShield(ctx, player);
        }
    }

    /**
     * Render shield effect for Aliza
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player state
     */
    renderShield(ctx, player) {
        // Draw a shield circle
        ctx.save();
        const radius = 40 + Math.sin(Date.now() * 0.005) * 5;
        ctx.globalAlpha = 0.3 + (player.shield / player.maxShield) * 0.3;
        
        // Blue shield for Aliza
        const gradient = ctx.createRadialGradient(
            player.position.x, player.position.y, radius * 0.3,
            player.position.x, player.position.y, radius
        );
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield border
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Render all of Aliza's projectiles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} projectiles - Array of projectiles to render
     */
    renderProjectiles(ctx, projectiles) {
        for (const projectile of projectiles) {
            // Skip if not Aliza's projectile
            if (!projectile.sprite || !projectile.sprite.includes('aliza')) {
                continue;
            }
            
            // Get sprite number from name (alizashot1 -> 1)
            let spriteNum = 1;
            if (projectile.sprite === 'alizashot1') spriteNum = 1;
            else if (projectile.sprite === 'alizashot2') spriteNum = 2;
            else if (projectile.sprite === 'alizashot3') spriteNum = 3;
            
            const sprite = this.sprites.shots[spriteNum];
            
            if (sprite && sprite.complete) {
                // Calculate dimensions
                const aspectRatio = sprite.height / sprite.width;
                const width = projectile.width || 20;
                const height = width * aspectRatio;
                
                // Draw centered at projectile position
                ctx.drawImage(
                    sprite,
                    projectile.x - width / 2,
                    projectile.y - height / 2,
                    width,
                    height
                );
                
                // If this is a homing projectile, add special effects
                if (projectile.isHoming) {
                    // Add glow effect
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#55AAFF';
                    ctx.beginPath();
                    ctx.arc(projectile.x, projectile.y, width * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Reset alpha
                    ctx.globalAlpha = 1.0;
                }
            }
        }
    }
    
    /**
     * Render impact effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} effects - Array of impact effects
     */
    renderImpactEffects(ctx, effects) {
        const now = Date.now();
        
        for (const effect of effects) {
            // Skip if not Aliza's impact
            if (!effect.sprite || !effect.sprite.includes('aliza')) {
                continue;
            }
            
            // Get sprite number from name
            let spriteNum = 1;
            if (effect.sprite === 'alizashotimpact1') spriteNum = 1;
            else if (effect.sprite === 'alizashotimpact2') spriteNum = 2;
            
            const sprite = this.sprites.impacts[spriteNum];
            
            const elapsed = now - effect.createdAt;
            if (elapsed < effect.duration && sprite && sprite.complete) {
                // Calculate alpha for fade-out
                const alpha = 1 - (elapsed / effect.duration);
                ctx.globalAlpha = alpha;
                
                // Draw impact centered at position
                ctx.drawImage(
                    sprite,
                    effect.x - sprite.width / 2,
                    effect.y - sprite.height / 2
                );
                
                // Reset alpha
                ctx.globalAlpha = 1.0;
            }
        }
    }
    
    /**
     * Render game over screen for Aliza
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} gameState - Game state
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    renderGameOver(ctx, gameState, canvasWidth, canvasHeight) {
        // Only proceed if bypass is active
        if (!this.bypassRenderer) return false;
        
        // Get game over sprite
        const sprite = this.sprites.gameover;
        
        if (sprite && sprite.complete) {
            // Calculate dimensions to fit width while maintaining aspect ratio
            const aspectRatio = sprite.height / sprite.width;
            const width = Math.min(canvasWidth * 0.8, 500);
            const height = width * aspectRatio;
            
            // Draw centered on screen
            ctx.drawImage(
                sprite,
                (canvasWidth - width) / 2,
                (canvasHeight - height) / 3,
                width,
                height
            );
            
            return true; // We handled the rendering
        }
        
        return false; // We couldn't handle the rendering
    }

    /**
     * Create a regular attack for Aliza
     * @param {Object} position - Player position
     * @param {number} powerLevel - Current power level 
     * @param {Object} projectileManager - Reference to projectile manager
     * @param {Object} gameState - Current game state
     * @param {Object} audioManager - Reference to audio manager
     */
    createRegularAttack(position, powerLevel, projectileManager, gameState, audioManager) {
        // Define base properties based on power level
        const shotProperties = this.getShotProperties(powerLevel);
        
        // FIX: Handle undefined projectileManager by creating a fallback method
        // This ensures Aliza's shots still work even without the projectile manager
        if (!projectileManager) {
            console.warn("ProjectileManager is undefined. Using fallback method for Aliza's shots.");
            this.createFallbackShot(position, powerLevel, gameState);
            
            // Play shot sound if audio manager exists
            if (audioManager) {
                audioManager.playSfx('playerShot');
            }
            return;
        }
        
        // Determine shot pattern based on power level
        switch(powerLevel) {
            case 1:
                // Power level 1: Single shot
                this.createSingleShot(position, projectileManager, shotProperties);
                break;
                
            case 2:
                // Power level 2: Triple shot
                this.createTripleShot(position, projectileManager, shotProperties);
                break;
                
            case 3:
            default:
                // Power level 3: Five-way spread
                this.createFiveWayShot(position, projectileManager, shotProperties);
                break;
        }
        
        // Play shot sound
        if (audioManager) {
            audioManager.playSfx('playerShot');
        }
    }

    /**
     * Create a fallback shot when projectileManager is not available
     * @param {Object} position - Player position
     * @param {number} powerLevel - Current power level
     * @param {Object} gameState - Current game state
     */
    createFallbackShot(position, powerLevel, gameState) {
        // Check if gameState has projectiles.player array
        if (!gameState || !gameState.projectiles || !Array.isArray(gameState.projectiles.player)) {
            console.error("Cannot create fallback shot: gameState.projectiles.player is not available");
            return;
        }
        
        // Basic properties
        const damage = Math.min(powerLevel, 3);
        const sprite = `alizashot${powerLevel}`;
        const speed = 8 + powerLevel;
        
        // Create projectile(s) based on power level
        switch(powerLevel) {
            case 1:
                // Single shot
                gameState.projectiles.player.push({
                    x: position.x,
                    y: position.y - 20,
                    vx: 0,
                    vy: -speed,
                    damage: damage,
                    sprite: sprite,
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                break;
                
            case 2:
                // Triple shot
                // Center
                gameState.projectiles.player.push({
                    x: position.x,
                    y: position.y - 20,
                    vx: 0,
                    vy: -speed,
                    damage: damage,
                    sprite: sprite,
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                
                // Left
                gameState.projectiles.player.push({
                    x: position.x - 15,
                    y: position.y - 15,
                    vx: -1,
                    vy: -speed,
                    damage: damage - 1,
                    sprite: 'alizashot1',
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                
                // Right
                gameState.projectiles.player.push({
                    x: position.x + 15,
                    y: position.y - 15,
                    vx: 1,
                    vy: -speed,
                    damage: damage - 1,
                    sprite: 'alizashot1',
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                break;
                
            case 3:
            default:
                // Five-way
                // Center
                gameState.projectiles.player.push({
                    x: position.x,
                    y: position.y - 20,
                    vx: 0,
                    vy: -speed,
                    damage: damage,
                    sprite: sprite,
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                
                // Near left
                gameState.projectiles.player.push({
                    x: position.x - 12,
                    y: position.y - 15,
                    vx: -0.8,
                    vy: -speed,
                    damage: damage - 1,
                    sprite: 'alizashot2',
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                
                // Near right
                gameState.projectiles.player.push({
                    x: position.x + 12,
                    y: position.y - 15,
                    vx: 0.8,
                    vy: -speed,
                    damage: damage - 1,
                    sprite: 'alizashot2',
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                
                // Far left
                gameState.projectiles.player.push({
                    x: position.x - 25,
                    y: position.y - 10,
                    vx: -1.5,
                    vy: -speed + 1,
                    damage: damage - 1,
                    sprite: 'alizashot1',
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                
                // Far right
                gameState.projectiles.player.push({
                    x: position.x + 25,
                    y: position.y - 10,
                    vx: 1.5,
                    vy: -speed + 1,
                    damage: damage - 1,
                    sprite: 'alizashot1',
                    hasImpact: true,
                    impactSprite: 'alizashotimpact1'
                });
                break;
        }
    }

    /**
     * Create Aliza's special attack (homing shots)
     * @param {Object} position - Player position
     * @param {Object} gameState - Current game state
     * @param {Object} audioManager - Reference to audio manager
     * @param {Object} projectileManager - Reference to projectile manager
     */
    createSpecialAttack(position, gameState, audioManager, projectileManager) {
        // Play special attack sound
        if (audioManager) {
            audioManager.playSfx('alizaspecialattack');
        }
        
        // Check if projectileManager is available
        if (!projectileManager) {
            console.warn("ProjectileManager is undefined. Using fallback method for Aliza's special attack.");
            this.createFallbackSpecialAttack(position, gameState);
            return;
        }
        
        // Create burst of homing projectiles
        const burstCount = 12; // Number of homing projectiles in burst
        const angleStep = (Math.PI * 2) / burstCount;
        
        for (let i = 0; i < burstCount; i++) {
            const angle = i * angleStep;
            const speed = 7 + Math.random() * 3; // Random speed between 5-8
            
            // Calculate initial velocity based on angle
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Create homing projectile
            projectileManager.createPlayerProjectile(
                position.x, 
                position.y - 20, 
                vx, 
                vy,
                {
                    damage: 50,
                    sprite: 'alizashot3',
                    isSpecialAttack: true,
                    isHoming: true,
                    homingStrength: 0.3,
                    homingDelay: i * 100, // Stagger homing activation
                    initialDelay: i * 100, // Stagger initial launch
                    impactSprite: 'alizashotimpact2'
                }
            );
        }
    }

    /**
     * Create fallback special attack when projectileManager is unavailable
     * @param {Object} position - Player position
     * @param {Object} gameState - Current game state
     */
    createFallbackSpecialAttack(position, gameState) {
        // Check if gameState has projectiles.player array
        if (!gameState || !gameState.projectiles || !Array.isArray(gameState.projectiles.player)) {
            console.error("Cannot create fallback special attack: gameState.projectiles.player is not available");
            return;
        }
        
        // Create burst of homing projectiles
        const burstCount = 12;
        const angleStep = (Math.PI * 2) / burstCount;
        
        for (let i = 0; i < burstCount; i++) {
            const angle = i * angleStep;
            const speed = 5 + Math.random() * 3;
            
            // Calculate initial velocity based on angle
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Add projectile directly to the gameState
            gameState.projectiles.player.push({
                x: position.x,
                y: position.y - 20,
                vx: vx,
                vy: vy,
                damage: 50,
                sprite: 'alizashot3',
                isSpecialAttack: true,
                isHoming: true,
                homingStrength: 0.3,
                homingDelay: i * 200,
                initialDelay: i * 100,
                createdAt: Date.now(),
                impactSprite: 'alizashotimpact2'
            });
        }
    }

    /**
     * Update Aliza's projectiles for homing behavior
     * @param {Array} projectiles - Array of projectiles to update
     * @param {Array} enemies - Array of enemies to target
     * @param {number} deltaTime - Time since last update
     */
    updateProjectiles(projectiles, enemies, deltaTime) {
        const now = Date.now();
        
        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i];
            
            // Skip non-homing projectiles
            if (!projectile.isHoming) continue;
            
            // Check if homing delay has elapsed
            if (projectile.homingDelay && now - (projectile.createdAt || now) < projectile.homingDelay) {
                continue;
            }
            
            // Find closest enemy for homing
            if (enemies && enemies.length > 0) {
                let closestDistance = Infinity;
                let closestEnemy = null;
                
                for (const enemy of enemies) {
                    const dx = enemy.position.x - projectile.x;
                    const dy = enemy.position.y - projectile.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
                
                // Adjust velocity to home in on target
                if (closestEnemy) {
                    const dx = closestEnemy.position.x - projectile.x;
                    const dy = closestEnemy.position.y - projectile.y;
                    const angle = Math.atan2(dy, dx);
                    
                    // Use homingStrength to determine how aggressively projectile turns
                    const homingStrength = projectile.homingStrength || 0.1;
                    
                    // Gradually adjust velocity (homing effect)
                    projectile.vx += Math.cos(angle) * homingStrength * (deltaTime / 16);
                    projectile.vy += Math.sin(angle) * homingStrength * (deltaTime / 16);
                    
                    // Normalize velocity to maintain consistent speed
                    const currentSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                    const targetSpeed = projectile.isSpecialAttack ? 12 : 8; // Faster for special attacks
                    
                    projectile.vx = (projectile.vx / currentSpeed) * targetSpeed;
                    projectile.vy = (projectile.vy / currentSpeed) * targetSpeed;
                    
                    // Store timestamp when projectile was first created
                    if (!projectile.createdAt) {
                        projectile.createdAt = now;
                    }
                }
            }
        }
    }

    /**
     * Get shot properties based on power level
     * @param {number} powerLevel - Current power level
     * @returns {Object} - Shot properties
     */
    getShotProperties(powerLevel) {
        return {
            damage: Math.min(powerLevel, 3),
            sprite: `alizashot${powerLevel}`,
            hasImpact: true,
            impactSprite: 'alizashotimpact1',
            speed: 8 + powerLevel
        };
    }

    /**
     * Create a single shot
     * @param {Object} position - Player position
     * @param {Object} projectileManager - Reference to projectile manager
     * @param {Object} properties - Shot properties
     */
    createSingleShot(position, projectileManager, properties) {
        projectileManager.createPlayerProjectile(
            position.x,
            position.y - 20,
            0,
            -properties.speed,
            {
                damage: properties.damage,
                sprite: properties.sprite,
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
    }

    /**
     * Create a triple shot
     * @param {Object} position - Player position
     * @param {Object} projectileManager - Reference to projectile manager
     * @param {Object} properties - Shot properties
     */
    createTripleShot(position, projectileManager, properties) {
        // Center shot
        projectileManager.createPlayerProjectile(
            position.x,
            position.y - 20,
            0,
            -properties.speed,
            {
                damage: properties.damage,
                sprite: properties.sprite,
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
        
        // Left shot
        projectileManager.createPlayerProjectile(
            position.x - 15,
            position.y - 15,
            -1,
            -properties.speed,
            {
                damage: properties.damage - 1, // Slightly less damage for side shots
                sprite: 'alizashot1', // Use smaller projectile for side shots
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
        
        // Right shot
        projectileManager.createPlayerProjectile(
            position.x + 15,
            position.y - 15,
            1,
            -properties.speed,
            {
                damage: properties.damage - 1, // Slightly less damage for side shots
                sprite: 'alizashot1', // Use smaller projectile for side shots
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
    }

    /**
     * Create a five-way shot
     * @param {Object} position - Player position
     * @param {Object} projectileManager - Reference to projectile manager
     * @param {Object} properties - Shot properties
     */
    createFiveWayShot(position, projectileManager, properties) {
        // Center shot
        projectileManager.createPlayerProjectile(
            position.x,
            position.y - 20,
            0,
            -properties.speed,
            {
                damage: properties.damage,
                sprite: properties.sprite,
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
        
        // Near left shot
        projectileManager.createPlayerProjectile(
            position.x - 12,
            position.y - 15,
            -0.8,
            -properties.speed,
            {
                damage: properties.damage - 1,
                sprite: 'alizashot2',
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
        
        // Near right shot
        projectileManager.createPlayerProjectile(
            position.x + 12,
            position.y - 15,
            0.8,
            -properties.speed,
            {
                damage: properties.damage - 1,
                sprite: 'alizashot2',
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
        
        // Far left shot
        projectileManager.createPlayerProjectile(
            position.x - 25,
            position.y - 10,
            -1.5,
            -properties.speed + 1,
            {
                damage: properties.damage - 1,
                sprite: 'alizashot1',
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
        
        // Far right shot
        projectileManager.createPlayerProjectile(
            position.x + 25,
            position.y - 10,
            1.5,
            -properties.speed + 1,
            {
                damage: properties.damage - 1,
                sprite: 'alizashot1',
                hasImpact: properties.hasImpact,
                impactSprite: properties.impactSprite
            }
        );
    }

    /**
     * Get a random hit sound for Aliza
     * @returns {string} - Sound effect name
     */
    getRandomHitSound() {
        this.lastHitSoundIndex = (this.lastHitSoundIndex + 1) % this.hitSounds.length;
        return this.hitSounds[this.lastHitSoundIndex];
    }

    /**
     * Get Aliza's victory sound
     * @returns {string} - Victory sound effect name
     */
    getVictorySound() {
        return 'alizavictory1';
    }

    /**
     * Get Aliza's game over sound
     * @returns {string} - Game over sound effect name
     */
    getGameOverSound() {
        return 'alizagameover1';
    }
}
