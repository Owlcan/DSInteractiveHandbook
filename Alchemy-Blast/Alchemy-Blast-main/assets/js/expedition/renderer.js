/**
 * Renderer class for Alchemy Blaster
 * Handles all rendering operations for the game
 */
class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLCanvasElement} canvas - The canvas element to render on
     * @param {Object} assets - Game assets including images and sounds
     */
    constructor(canvas, assets) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assets = assets || { images: {} };
    }

    /**
     * Draw projectiles
     * @param {Object} state - Current game state
     */
    drawProjectiles(state) {
        if (!state.projectiles) return;
        
        const ctx = this.ctx;
        
        // Draw player projectiles
        for (const projectile of state.projectiles.player) {
            // Get projectile sprite
            const spriteKey = projectile.sprite || 'shot1';
            const sprite = this.assets.images[spriteKey];
            
            if (sprite) {
                // FIXED: Draw player projectiles directly at their coordinate
                // without applying the Y offset, so they match collision logic
                ctx.drawImage(
                    sprite,
                    this.canvas.width / 2 + projectile.x - sprite.width / 2,
                    projectile.y, // Remove the canvas.height / 2 offset
                    sprite.width,
                    sprite.height
                );
            } else {
                // Fallback if sprite not found
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                // Draw a backup circle at the correct coordinates
                ctx.arc(
                    this.canvas.width / 2 + projectile.x,
                    projectile.y, // Remove the canvas.height / 2 offset
                    5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw enemy projectiles
        for (const projectile of state.projectiles.enemy) {
            // Get enemy projectile sprite - using correct sprites now
            const spriteKey = projectile.sprite || 'darklingshot1';
            const sprite = this.assets.images[spriteKey];
            
            // Calculate projectile's adjusted Y for rendering
            projectile.adjustedY = projectile.y - 0; // Apply the same offset as enemies
            
            if (sprite) {
                // Draw with proper sizing
                const width = projectile.width || sprite.width || 30;
                const height = projectile.height || sprite.height || 30;
                
                ctx.drawImage(
                    sprite,
                    this.canvas.width / 2 + projectile.x - width / 2,
                    this.canvas.height / 2 + projectile.adjustedY - height / 2,
                    width,
                    height
                );
            } else {
                // Fallback if sprite not found
                ctx.fillStyle = '#ff5555';
                ctx.beginPath();
                ctx.arc(
                    this.canvas.width / 2 + projectile.x,
                    this.canvas.height / 2 + projectile.adjustedY,
                    projectile.width ? projectile.width / 3 : 8,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    /**
     * Draw special effects
     * @param {Object} state - Current game state
     */
    drawEffects(state) {
        if (!state.effects || state.effects.length === 0) return;
        
        const ctx = this.ctx;
        const currentTime = Date.now();
        
        // Filter out expired effects
        const activeEffects = state.effects.filter(effect => 
            currentTime - effect.startTime < effect.duration);
        
        // Draw active effects
        for (const effect of activeEffects) {
            // Calculate effect progress (0-1)
            const progress = (currentTime - effect.startTime) / effect.duration;
            const alpha = 1 - progress; // Fade out as effect progresses
            
            // Handle specific effect types
            if (effect.type === 'screenFlash') {
                // Screen-clearing flash
                this.drawScreenFlash(ctx, alpha);
            } else if (effect.type === 'flash') {
                // Enemy hit flash
                this.drawEnemyFlash(ctx, effect.position, alpha);
            }
        }
        
        // Update effects array
        state.effects = activeEffects;
    }
    
    /**
     * Draw a full-screen flash effect (for Dere's special ability)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} alpha - Effect opacity
     */
    drawScreenFlash(ctx, alpha) {
        // Save context state
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        
        // Draw full-screen gradient
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        
        gradient.addColorStop(0, 'rgba(81, 191, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(81, 171, 235, 0.8)');
        gradient.addColorStop(1, 'rgba(18, 56, 128, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Restore context state
        ctx.restore();
    }
    
    /**
     * Draw a flash effect on an enemy (for Dere's special ability)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} position - Position of the flash
     * @param {number} alpha - Effect opacity
     */
    drawEnemyFlash(ctx, position, alpha) {
        // Apply Y offset to enemy position for rendering
        const enemyY = position.y - 350;
        
        // Save context state
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw halo effect
        ctx.fillStyle = 'rgba(81, 190, 240, 0.8)';
        ctx.beginPath();
        ctx.arc(
            this.canvas.width / 2 + position.x,
            this.canvas.height / 2 + enemyY,
            30,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(81, 150, 200, 0.9)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(
            this.canvas.width / 2 + position.x,
            this.canvas.height / 2 + enemyY,
            20,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Restore context state
        ctx.restore();
    }
    
    /**
     * Render particles
     * @param {Array} particles - Array of particle objects
     */
    renderParticles(particles) {
        if (!particles || particles.length === 0) return;
        
        const ctx = this.ctx;
        
        for (const particle of particles) {
            if (!particle.active) continue;
            
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            
            // Use sprite if available
            if (particle.sprite && this.assets.images[particle.sprite]) {
                const sprite = this.assets.images[particle.sprite];
                const scale = particle.scale || 1;
                
                ctx.drawImage(
                    sprite,
                    this.canvas.width / 2 + particle.x - (sprite.width * scale) / 2,
                    this.canvas.height / 2 + particle.y - (sprite.height * scale) / 2,
                    sprite.width * scale,
                    sprite.height * scale
                );
            } else {
                // Draw basic particle
                ctx.fillStyle = particle.color || '#ffffff';
                ctx.beginPath();
                ctx.arc(
                    this.canvas.width / 2 + particle.x,
                    this.canvas.height / 2 + particle.y,
                    particle.size || 3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Add glow effect for certain particle types
                if (particle.type === 'shield' || particle.type === 'powerup') {
                    ctx.shadowColor = particle.color || '#ffffff';
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(
                        this.canvas.width / 2 + particle.x,
                        this.canvas.height / 2 + particle.y,
                        (particle.size || 3) * 0.7,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }
    }
    
    /**
     * Draw player shield effect
     * @param {Object} player - Player object with shield properties
     */
    drawPlayerShield(player) {
        if (!player.shield || player.shield <= 0) return;
        
        const ctx = this.ctx;
        const shieldMaxRadius = player.width * 1.2;
        const shieldThickness = 3;
        const shieldAlpha = 0.2 + (player.shield / player.maxShield) * 0.4;
        
        // Create pulsing effect
        const pulseAmount = Math.sin(Date.now() * 0.005) * 5;
        const radius = shieldMaxRadius + pulseAmount;
        
        ctx.save();
        
        // Draw outer glow
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2 + player.position.x,
            this.canvas.height / 2 + player.position.y,
            radius - 10,
            this.canvas.width / 2 + player.position.x,
            this.canvas.height / 2 + player.position.y,
            radius + 10
        );
        
        gradient.addColorStop(0, `rgba(100, 200, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(100, 200, 255, ${shieldAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.canvas.width / 2 + player.position.x,
            this.canvas.height / 2 + player.position.y,
            radius + 10,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw shield border
        ctx.strokeStyle = `rgba(150, 220, 255, ${shieldAlpha + 0.1})`;
        ctx.lineWidth = shieldThickness;
        ctx.beginPath();
        ctx.arc(
            this.canvas.width / 2 + player.position.x,
            this.canvas.height / 2 + player.position.y,
            radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        ctx.restore();
    }
}