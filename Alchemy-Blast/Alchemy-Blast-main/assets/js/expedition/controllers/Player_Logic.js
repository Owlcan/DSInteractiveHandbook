/**
 * Player Logic for Alchemy Blaster
 * Handles character-specific shot patterns and special attacks
 */
class PlayerLogic {
    constructor() {
        this.characters = {
            dere: {
                shots: ['dereshot1', 'dereshot2', 'dereshot3'],
                special: 'derespecialshot',
                specialSound: 'derespecialattack',
                shotSound: 'playerShot',
                hitSounds: ['derehit1', 'derehit2', 'derehit3'],
                victorySounds: ['derevictory1'],
                gameOverSound: 'deregameover',
                specialAttackConfig: {
                    duration: 500,
                    damage: 50,
                    screenCoverage: 1.0, // Full screen coverage
                    flashIntensity: 0.8
                }
            },
            // Other characters can be added here but are handled by existing code
        };
    }
    
    /**
     * Get shot sprite for a character based on power level
     * @param {string} character - Character name
     * @param {number} powerLevel - Current power level
     * @returns {string} - Sprite name to use
     */
    getShotSprite(character, powerLevel) {
        if (character === 'dere') {
            const index = Math.min(powerLevel - 1, 2);
            return this.characters.dere.shots[index];
        }
        return null; // Let existing code handle it
    }
    
    /**
     * Get special attack sprite for a character
     * @param {string} character - Character name
     * @returns {string} - Special attack sprite name
     */
    getSpecialSprite(character) {
        if (character === 'dere') {
            return this.characters.dere.special;
        }
        return null;
    }
    
    /**
     * Get a random hit sound for a character
     * @param {string} character - Character name
     * @returns {string|null} - Sound ID to play or null
     */
    getRandomHitSound(character) {
        if (character === 'dere' && this.characters[character].hitSounds) {
            const sounds = this.characters[character].hitSounds;
            const randomIndex = Math.floor(Math.random() * sounds.length);
            return sounds[randomIndex];
        }
        return null;
    }
    
    /**
     * Get victory sound for a character
     * @param {string} character - Character name
     * @returns {string|null} - Sound ID to play or null
     */
    getVictorySound(character) {
        if (character === 'dere' && this.characters[character].victorySounds) {
            const sounds = this.characters[character].victorySounds;
            const randomIndex = Math.floor(Math.random() * sounds.length);
            return sounds[randomIndex];
        }
        return null;
    }
    
    /**
     * Get game over sound for a character
     * @param {string} character - Character name
     * @returns {string|null} - Sound ID to play or null
     */
    getGameOverSound(character) {
        if (character === 'dere') {
            return this.characters[character].gameOverSound;
        }
        return null;
    }
    
    /**
     * Play special attack sound for a character
     * @param {string} character - Character name
     * @param {Object} audioManager - Audio manager instance
     */
    playSpecialAttackSound(character, audioManager) {
        if (!audioManager) return;
        
        if (character === 'dere') {
            audioManager.playSfx(this.characters.dere.specialSound);
        }
    }
    
    /**
     * Create special attack for a character
     * @param {string} character - Character name
     * @param {Object} gameState - Game state object to modify
     * @param {Object} audioManager - Audio manager instance
     * @returns {boolean} - Whether special attack was created successfully
     */
    createSpecialAttack(character, gameState, audioManager) {
        if (character === 'dere') {
            const config = this.characters.dere.specialAttackConfig;
            
            // Create special attack animation
            gameState.specialAttack = {
                type: 'dere',
                createdAt: Date.now(),
                duration: config.duration,
                sprite: this.characters.dere.special,
                damage: config.damage,
                intensity: config.flashIntensity
            };
            
            // Play special attack sound
            this.playSpecialAttackSound(character, audioManager);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Apply special attack effects
     * @param {string} character - Character name
     * @param {Array} enemies - Enemies to affect
     * @returns {Object} - Effect results including damaged enemies
     */
    applySpecialAttackEffects(character, enemies) {
        if (character === 'dere') {
            const config = this.characters.dere.specialAttackConfig;
            const damage = config.damage;
            let enemiesHit = 0;
            
            // Apply damage to all enemies
            for (const enemy of enemies) {
                if (enemy && typeof enemy.health !== 'undefined') {
                    enemy.health -= damage;
                    enemiesHit++;
                }
            }
            
            return {
                enemiesHit,
                totalDamage: damage * enemiesHit,
                screenEffect: 'flash'
            };
        }
        
        return { enemiesHit: 0, totalDamage: 0 };
    }
    
    /**
     * Render special attack for a character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} specialAttack - Special attack data
     * @param {Object} sprites - Loaded sprites
     * @param {Object} canvas - Canvas element
     */
    renderSpecialAttack(ctx, specialAttack, sprites, canvas) {
        if (!specialAttack || specialAttack.type !== 'dere') return;
        
        // Get the special attack sprite
        const sprite = sprites[this.characters.dere.special];
        if (!sprite || !sprite.complete) return;
        
        const now = Date.now();
        const elapsed = now - specialAttack.createdAt;
        
        // Only show the flash during its duration
        if (elapsed < specialAttack.duration) {
            // Calculate alpha for fade-out effect
            const alpha = 1 - (elapsed / specialAttack.duration);
            
            // Save current context state
            ctx.save();
            
            // Reset transform to draw in screen coordinates
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Set transparency for fade effect
            ctx.globalAlpha = alpha * (specialAttack.intensity || 0.8);
            
            // Calculate dimensions to fill screen width without distortion
            const aspectRatio = sprite.height / sprite.width;
            const displayWidth = canvas.width;
            const displayHeight = displayWidth * aspectRatio;
            
            // Draw centered on screen
            ctx.drawImage(
                sprite,
                0,
                (canvas.height - displayHeight) / 2,
                displayWidth,
                displayHeight
            );
            
            // Reset transparency and restore context
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
    }
    
    /**
     * Initialize the bypass renderer capability
     */
    initBypassRenderer() {
        this.bypassRenderer = true;
        
        // Load sprites directly for bypass renderer
        this.sprites = {
            left: null,
            right: null,
            shots: [],
            special: null,
            gameover: null
        };
        
        // Load sprites directly
        this.sprites.left = this.loadSprite('assets/images/darklings/dereleft.png');
        this.sprites.right = this.loadSprite('assets/images/darklings/dereright.png');
        this.sprites.select = this.loadSprite('assets/images/darklings/derecharacterselect.png');
        this.sprites.gameover = this.loadSprite('assets/images/darklings/deregameover.png');
        
        // Load shot sprites
        this.sprites.shots[1] = this.loadSprite('assets/images/darklings/dereshot1.png');
        this.sprites.shots[2] = this.loadSprite('assets/images/darklings/dereshot2.png');
        this.sprites.shots[3] = this.loadSprite('assets/images/darklings/dereshot3.png');
        this.sprites.special = this.loadSprite('assets/images/darklings/derespecialshot.png');
    }
    
    /**
     * Load a sprite directly
     * @param {string} path - Path to the sprite
     * @returns {HTMLImageElement} - The loaded image
     */
    loadSprite(path) {
        const img = new Image();
        img.src = path;
        
        // Add error handling
        img.onerror = () => {
            console.error(`Failed to load Dere sprite from path: ${path}`);
        };
        
        return img;
    }
    
    /**
     * Directly render Dere character and projectiles, bypassing the game renderer
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player state
     * @param {Object} projectiles - All projectiles
     * @returns {boolean} - True if rendering was handled
     */
    renderBypass(ctx, player, projectiles) {
        // Ensure bypass renderer is initialized
        if (!this.sprites) {
            this.initBypassRenderer();
        }
        
        // Only proceed if bypass is active and sprites are loaded
        if (!this.bypassRenderer || !this.sprites.left || !this.sprites.right) {
            return false;
        }
        
        // Save context state
        ctx.save();
        
        try {
            // Render character
            this.renderCharacter(ctx, player);
            
            // Render projectiles
            if (projectiles && projectiles.player) {
                this.renderProjectiles(ctx, projectiles.player);
            }
            
            // Render special attack if active
            if (player.specialAttack) {
                this.renderSpecialAttackBypass(ctx, player.specialAttack);
            }
        } catch (e) {
            console.error('Error in Dere renderer bypass:', e);
        }
        
        // Restore context
        ctx.restore();
        
        return true; // We handled the rendering
    }
    
    /**
     * Render Dere character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player state
     */
    renderCharacter(ctx, player) {
        // Select sprite based on direction
        const sprite = player.direction === 'left' ? this.sprites.left : this.sprites.right;
        
        if (!sprite || !sprite.complete) {
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
     * Render shield effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player state
     */
    renderShield(ctx, player) {
        // Draw a shield circle
        ctx.save();
        const radius = 40 + Math.sin(Date.now() * 0.005) * 5;
        ctx.globalAlpha = 0.3 + (player.shield / player.maxShield) * 0.3;
        
        // Purple shield for Dere
        const gradient = ctx.createRadialGradient(
            player.position.x, player.position.y, radius * 0.3,
            player.position.x, player.position.y, radius
        );
        gradient.addColorStop(0, 'rgba(200, 100, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(100, 50, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield border
        ctx.strokeStyle = 'rgba(220, 150, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Render Dere's projectiles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} projectiles - Player projectiles
     */
    renderProjectiles(ctx, projectiles) {
        for (const projectile of projectiles) {
            // Skip if not Dere's projectile
            if (!projectile.sprite || !projectile.sprite.includes('dere')) {
                continue;
            }
            
            // Get sprite number from name
            let spriteNum = 1;
            if (projectile.sprite === 'dereshot1') spriteNum = 1;
            else if (projectile.sprite === 'dereshot2') spriteNum = 2;
            else if (projectile.sprite === 'dereshot3') spriteNum = 3;
            else if (projectile.sprite === 'derespecialshot') {
                this.renderSpecialShot(ctx, projectile);
                continue;
            }
            
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
            }
        }
    }
    
    /**
     * Render Dere's special shot
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} projectile - Special projectile
     */
    renderSpecialShot(ctx, projectile) {
        const sprite = this.sprites.special;
        
        if (sprite && sprite.complete) {
            // Calculate dimensions
            const aspectRatio = sprite.height / sprite.width;
            const width = projectile.width || 30;
            const height = width * aspectRatio;
            
            // Draw with glow effect
            ctx.save();
            
            // Glow effect
            ctx.globalAlpha = 0.4;
            ctx.shadowColor = '#CC44FF';
            ctx.shadowBlur = 15;
            
            ctx.drawImage(
                sprite,
                projectile.x - width / 2,
                projectile.y - height / 2,
                width,
                height
            );
            
            ctx.restore();
        }
    }
    
    /**
     * Render Dere's special attack effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} specialAttack - Special attack data
     */
    renderSpecialAttackBypass(ctx, specialAttack) {
        if (!specialAttack) return;
        
        // Create flash effect
        ctx.save();
        
        // Calculate flash opacity based on progress
        const progress = (Date.now() - specialAttack.startTime) / specialAttack.duration;
        if (progress >= 1) {
            ctx.restore();
            return;
        }
        
        // Flash effect that fades out
        const opacity = 1 - progress;
        ctx.globalAlpha = opacity * 0.7;
        ctx.fillStyle = '#FF44CC';
        ctx.fillRect(-1000, -1000, 2000, 2000); // Cover entire viewport
        
        // Draw radial flash
        const radius = Math.max(1000, 1000) * progress; // Grows over time
        const gradient = ctx.createRadialGradient(
            specialAttack.x, specialAttack.y, 0,
            specialAttack.x, specialAttack.y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 68, 204, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 68, 204, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 68, 204, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-1000, -1000, 2000, 2000); // Cover entire viewport
        
        ctx.restore();
    }
    
    /**
     * Render game over screen for Dere
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} gameState - Game state
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @returns {boolean} - True if rendering was handled
     */
    renderGameOver(ctx, gameState, canvasWidth, canvasHeight) {
        // Ensure bypass renderer is initialized
        if (!this.sprites) {
            this.initBypassRenderer();
        }
        
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
}
