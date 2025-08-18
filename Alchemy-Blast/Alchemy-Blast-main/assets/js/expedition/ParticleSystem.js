/**
 * Particle System for Alchemy Blaster
 * Handles all particle effects such as explosions, impacts, and visual feedback
 */

class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.maxParticles = 200;
    }
    
    /**
     * Gets the player's actual collision position (fixed Y coordinate)
     * @param {number} playerX - The player's visual X position
     * @returns {Object} - The player's collision position with fixed Y coordinate 
     */
    getPlayerCollisionPosition(playerX) {
        // Use canvas height if available, otherwise use default 800
        const screenHeight = this.game.canvas ? this.game.canvas.height : 800;
        return {
            x: playerX,
            // FIXED: Use 200 as the fixed Y coordinate for player, which corresponds to the position
            // defined in game_renderer.js. This ensures consistent collision detection.
            y: 200
        };
    }

    createParticle(x, y, type, options = {}) {
        // Don't create particles if we're at the limit
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle if we need to make room
            this.particles.shift();
        }

        const particle = new Particle(this.game, x, y, type, options);
        this.particles.push(particle);
        return particle;
    }

    update() {
        // Update all particles and remove any that are finished
        this.particles = this.particles.filter(particle => !particle.update());
    }

    draw() {
        // Draw all active particles
        this.particles.forEach(particle => particle.draw());
    }

    createExplosion(x, y, size = 1, count = 10) {
        // FIXED: Don't apply any Y offset - use the actual coordinates provided
        // This ensures explosions appear correctly in all parts of the screen
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, 'explosion', {
                size: size * (0.5 + Math.random() * 0.5),
                speed: 1 + Math.random() * 2,
                angle: Math.random() * Math.PI * 2,
                lifespan: 30 + Math.random() * 20
            });
        }
    }

    /**
     * Create hit effect for player or enemy
     * @param {number} x - X position of the hit
     * @param {number} y - Y position of the hit
     * @param {boolean} isEnemy - Whether this is an enemy hit (true) or player hit (false)
     */
    createHitEffect(x, y, isEnemy = false) {
        // FIXED: For player hits, use the collision position but don't manipulate Y coordinate
        // This ensures hit effects appear at the correct location
        if (!isEnemy && this.game.player) {
            const playerCollision = this.getPlayerCollisionPosition(x);
            x = playerCollision.x;
            y = playerCollision.y;
        }
        
        const type = isEnemy ? 'enemyHit' : 'playerHit';
        const count = isEnemy ? 5 : 3;
        
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, type, {
                size: 0.5 + Math.random() * 0.5,
                speed: 0.5 + Math.random() * 1.5,
                angle: Math.random() * Math.PI * 2,
                lifespan: 20 + Math.random() * 10
            });
        }
    }

    createPowerupEffect(x, y, type) {
        const color = type === 'health' ? '#ff5555' :
                     type === 'power' ? '#55ff55' : '#5555ff';
        
        for (let i = 0; i < 15; i++) {
            this.createParticle(x, y, 'powerup', {
                color: color,
                size: 0.3 + Math.random() * 0.7,
                speed: 0.5 + Math.random() * 2,
                angle: Math.random() * Math.PI * 2,
                lifespan: 30 + Math.random() * 30
            });
        }
    }
    
    /**
     * Create shield block effect when damage is prevented by shield
     * @param {number} x - X position of the hit
     * @param {number} y - Y position of the hit
     */
    createShieldEffect(x, y) {
        // If we have a player, ensure we're using the correct collision position
        if (this.game.player) {
            const playerCollision = this.getPlayerCollisionPosition(x);
            x = playerCollision.x;
            y = playerCollision.y;
        }
        
        // Create blue shield particles
        for (let i = 0; i < 12; i++) {
            this.createParticle(x, y, 'shield', {
                color: 'rgba(100, 200, 255, 0.8)',
                size: 0.5 + Math.random() * 1.0,
                speed: 1.5 + Math.random() * 2.5,
                angle: Math.random() * Math.PI * 2,
                lifespan: 20 + Math.random() * 15
            });
        }
        
        // Create expanding shield ring
        const ring = this.createParticle(x, y, 'shieldRing', {
            color: 'rgba(150, 220, 255, 0.7)',
            size: 1.5,
            lifespan: 15
        });
        
        // Override update to create expanding ring effect
        const originalUpdate = ring.update.bind(ring);
        ring.update = function() {
            this.size += 0.2; // Expand the ring
            return originalUpdate();
        };
    }

    createTeleportEffect(x, y, enemyType) {
        // Create a teleport effect with colors based on enemy type
        const colorIntensity = enemyType.includes('boss') ? 1.0 : 0.7;
        
        // Base color depends on enemy tier
        let baseColor;
        if (enemyType.includes('boss')) {
            baseColor = `rgba(255, 50, 255, ${colorIntensity})`; // Purple for bosses
        } else if (['darkling7', 'darkling8', 'darkling10'].includes(enemyType)) {
            baseColor = `rgba(50, 100, 255, ${colorIntensity})`; // Blue for powerful enemies
        } else {
            baseColor = `rgba(100, 255, 255, ${colorIntensity})`; // Cyan for regular enemies
        }
        
        // Create flash particles
        for (let i = 0; i < 15; i++) {
            this.createParticle(x, y, 'teleport', {
                color: baseColor,
                size: 0.5 + Math.random() * 1.5,
                speed: 1 + Math.random() * 3,
                angle: Math.random() * Math.PI * 2,
                lifespan: 15 + Math.random() * 10
            });
        }
        
        // Create expanding ring effect
        for (let i = 0; i < 2; i++) {
            const ring = this.createParticle(x, y, 'teleportRing', {
                color: baseColor,
                size: 1 + i * 0.5,
                lifespan: 20 + i * 5
            });
            
            // Override the update method to create expanding ring
            const originalUpdate = ring.update.bind(ring);
            ring.update = function() {
                this.size += 0.15; // Expand the ring
                return originalUpdate();
            };
        }
    }
    
    /**
     * Create enemy projectile hit effect
     * @param {number} x - X position of the hit
     * @param {number} y - Y position of the hit 
     * @param {string} spriteKey - Optional sprite key for the hit effect
     */
    createEnemyProjectileHit(x, y, spriteKey = null) {
        // FIXED: Don't adjust Y position for projectiles - use the actual coordinates
        // This ensures projectiles from the upper part of screen are properly handled
        
        // Create enemy projectile hit particles
        for (let i = 0; i < 8; i++) {
            this.createParticle(x, y, 'enemyProjectileHit', {
                color: 'rgba(200, 50, 50, 0.8)',
                size: 0.3 + Math.random() * 0.7,
                speed: 1 + Math.random() * 2,
                angle: Math.random() * Math.PI * 2,
                lifespan: 15 + Math.random() * 10
            });
        }
        
        // If a specific sprite is provided, create a sprite-based particle
        if (spriteKey && this.game.assets && this.game.assets.images[spriteKey]) {
            const spriteParticle = this.createParticle(x, y, 'sprite', {
                size: 1.0,
                lifespan: 10
            });
            spriteParticle.sprite = spriteKey;
        }
    }
    
    /**
     * Create a screen-clearing flash effect (Dere's special ability)
     */
    createScreenClearingFlash() {
        // Create a full-screen flash effect
        const ctx = this.game.ctx;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Create the main flash
        const flash = this.createParticle(width/2, height/2, 'screenFlash', {
            color: 'rgba(81, 191, 255, 0.8)',
            size: Math.max(width, height) / 40, // Scale to cover screen
            lifespan: 15
        });
        
        // Override draw method for full-screen effect
        flash.draw = function(ctx) {
            const alpha = this.alpha * 0.8;
            
            // Draw full-screen gradient
            const gradient = ctx.createRadialGradient(
                width/2, height/2, 0,
                width/2, height/2, Math.max(width, height)
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 220, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(18, 56, 128, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Add a bright center
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(width/2, height/2, 100, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = 'rgba(81, 191, 255, 0.8)';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(width/2, height/2, 80, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        };
        
        // Create radial particles emanating from center
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            const x = width/2 + Math.cos(angle) * distance;
            const y = height/2 + Math.sin(angle) * distance;
            
            const particle = this.createParticle(x, y, 'flashRay', {
                color: 'rgba(20, 169, 255, 0.8)',
                size: 0.8 + Math.random() * 1.2,
                angle: angle,
                speed: 5 + Math.random() * 10,
                lifespan: 10 + Math.random() * 10
            });
            
            // Enhance speed for faster expansion
            particle.vx *= 2;
            particle.vy *= 2;
        }
    }
}

class Particle {
    constructor(game, x, y, type, options = {}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Set default options
        this.size = options.size || 1;
        this.speed = options.speed || 1;
        this.angle = options.angle || 0;
        this.lifespan = options.lifespan || 30;
        this.age = 0;
        this.alpha = 1;
        this.color = options.color || this.getDefaultColor();
        
        // Calculate velocity based on angle and speed
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        
        // Set sprite if needed for this particle type
        if (['hit', 'defeat'].includes(this.type)) {
            // For hit particles, use character-specific impact sprites
            const character = this.game.selectedCharacter || 'dere';
            this.sprite = (this.type === 'hit') 
                ? (character === 'aliza' ? 'alizaShotImpact1' : 'shotImpact1')
                : (character === 'aliza' ? 'alizaShotImpact2' : 'shotImpact2');
        }
    }
    
    getDefaultColor() {
        switch(this.type) {
            case 'explosion': return '#ff7700';
            case 'playerHit': return '#ff0000';
            case 'enemyHit': return '#ffff00';
            case 'enemyProjectileHit': return '#ff3300';
            case 'powerup': return '#00ffff';
            case 'shield': return '#40a0ff';
            case 'shieldRing': return '#80c0ff';
            case 'screenFlash': return '#3A6BFF';
            case 'flashRay': return '#ffffc0';
            default: return '#ffffff';
        }
    }
    
    update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply drag/gravity as needed
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        // Add gravity for explosion particles
        if (this.type === 'explosion') {
            this.vy += 0.1;
        }
        
        // Age the particle
        this.age++;
        
        // Calculate alpha based on age and lifespan
        this.alpha = 1 - (this.age / this.lifespan);
        
        // Return true if particle is dead
        return this.age >= this.lifespan;
    }
    
    draw() {
        const ctx = this.game.ctx;
        
        // Save context state
        ctx.save();
        
        // Set global alpha for fading
        ctx.globalAlpha = this.alpha;
        
        // Draw based on particle type
        if (this.sprite) {
            // Draw sprite-based particle
            const sprite = this.game.assets.images[this.sprite];
            if (sprite && sprite.complete) {
                const size = this.type === 'defeat' ? 80 * this.size : 40 * this.size;
                ctx.drawImage(
                    sprite,
                    this.x - size/2,
                    this.y - size/2,
                    size,
                    size
                );
            }
        } else {
            // Draw generic particle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            if (this.type === 'powerup') {
                // Star shape for powerups
                this.drawStar(ctx, this.x, this.y, 5, 10 * this.size, 5 * this.size);
            } else if (this.type === 'shieldRing' || this.type === 'teleportRing') {
                // Ring particles
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 10 * this.size, 0, Math.PI * 2);
                ctx.stroke();
            } else if (this.type === 'enemyProjectileHit') {
                // Special hit effect for enemy projectiles
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4 * this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add "spikes" for projectile impact
                const spikes = 3 + Math.floor(Math.random() * 3);
                for (let i = 0; i < spikes; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = 5 + Math.random() * 5;
                    
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(
                        this.x + Math.cos(angle) * length * this.size,
                        this.y + Math.sin(angle) * length * this.size
                    );
                    ctx.lineWidth = 2 * this.size;
                    ctx.stroke();
                }
            } else {
                // Circle for other particles
                ctx.arc(this.x, this.y, 5 * this.size, 0, Math.PI * 2);
            }
            
            ctx.fill();
            
            // Add glow effect for certain particle types
            if (['explosion', 'powerup', 'screenFlash', 'flashRay'].includes(this.type)) {
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10 * this.size;
                ctx.fill();
            }
        }
        
        // Restore context state
        ctx.restore();
    }
    
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }
}