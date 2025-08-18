/**
 * EnemySystem.js
 * Updated Enemy class with improved integration with the game systems
 */

class Enemy {
    /**
     * Create a new enemy
     * @param {Object} game - The game instance
     * @param {string} type - Enemy type
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(game, type, x, y) {
        this.game = game;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.speed = this.getMovementSpeed();
        this.health = this.getMaxHealth();
        this.maxHealth = this.health;
        this.lastShot = 0;
        this.shootCooldown = this.getShootCooldown();
        this.points = this.getPoints();
        this.fadeAlpha = 1;
        this.isDying = false;
        this.isInvulnerable = false;
        this.isBoss = this.type.includes('boss');
        this.hasShield = this.type === 'darkling4';
        this.shieldActive = false;
        this.shieldCooldown = 0;
        this.isCharging = false;
        
        // Movement pattern
        this.reversePattern = Math.random() < 0.5;
        this.amplitude = 50 + Math.floor(Math.random() * 50);
        this.frequency = 0.001 + (Math.random() * 0.003);
        this.verticalSpeed = this.type.includes('boss') ? 0.5 : 1.2;
        this.homeY = this.getHomeY();
        this.hasReachedHome = false;
        this.originalX = x; // Store original X position for patterns
    }
    
    /**
     * Get the movement speed for this enemy type
     * @returns {number} - Movement speed
     */
    getMovementSpeed() {
        if (this.type.includes('boss')) {
            return 1.5;
        }
        
        // Slower movement for mid-bosses
        if (this.isMidBoss()) {
            return 1.0 + Math.random() * 0.5; // Range of 1.0-1.5 (slower than regular enemies)
        }
        
        return 2 + Math.random();
    }
    
    /**
     * Get the max health for this enemy type
     * @returns {number} - Max health
     */
    getMaxHealth() {
        switch(this.type) {
            case 'darkling1':
            case 'darkling2':
            case 'darkling3':
                return 1;
            case 'darkling4':
            case 'darkling5':
            case 'darkling6':
                return 2;
            case 'darkling7':
            case 'darkling8':
            case 'darkling9':
                return 3;
            case 'darkling10':
                return 4;
            case 'darkmidboss1':
            case 'darkmidboss2':
                return 50; // Round 1 Wave 1-2 mid-bosses
            case 'darkmidboss3':
            case 'darkmidboss4':
                return 75; // Round 1 Wave 3-4 mid-bosses
            case 'darkmidboss5':
            case 'darkmidboss6':
            case 'darkmidboss7':
            case 'darkmidboss8':
                return 100; // Round 2 mid-bosses
            case 'darkmidboss9':
            case 'darkmidboss10':
                return 150; // Round 3 mid-bosses
            case 'darkmidboss11':
                return 150; // Round 3 Wave 7 special mid-boss
            case 'darklingboss1':
                return 500;
            case 'darklingboss2':
                return 1000;
            case 'darklingboss3':
                return 2222; // Final boss
            default:
                return 1;
        }
    }

    /**
     * Get the shooting cooldown time for this enemy type
     * @returns {number} - Cooldown time in milliseconds
     */
    getShootCooldown() {
        if (this.type.includes('boss')) {
            return 1500;
        }
        
        switch(this.type) {
            case 'darkling1':
            case 'darkling9':
                return 0; // Doesn't shoot
            case 'darkling2':
            case 'darkling3':
                return 2500;
            case 'darkling4':
                return 2500;
            case 'darkling5':
                return 2000;
            case 'darkling6':
                return 2000;
            case 'darkling7':
                return 2000;
            case 'darkling8':
                return 1500;
            case 'darkling10':
                return 1500;
            // Mid-boss cooldowns
            case 'darkmidboss1':
                return 1800; // Aggressive 2-shot attack pattern
            case 'darkmidboss2':
                return 2200; // Defensive flight pattern
            case 'darkmidboss3':
            case 'darkmidboss4':
                return 1900; // Balanced aggressive/defensive
            case 'darkmidboss5':
            case 'darkmidboss6':
            case 'darkmidboss7':
            case 'darkmidboss8':
                return 1700; // More powerful 3-shot attack pattern
            case 'darkmidboss9':
            case 'darkmidboss10':
                return 1600; // Aggressive attack pattern
            case 'darkmidboss11':
                return 1300; // Special mid-boss with changing projectile patterns
            default:
                return 2000;
        }
    }
    
    /**
     * Get point value for defeating this enemy
     * @returns {number} - Point value
     */
    getPoints() {
        if (this.type.includes('boss')) {
            return 1000;
        }
        
        switch(this.type) {
            case 'darkling1':
            case 'darkling2':
            case 'darkling3':
                return 100;
            case 'darkling4':
            case 'darkling5':
            case 'darkling6':
                return 200;
            case 'darkling7':
            case 'darkling8':
            case 'darkling9':
                return 300;
            case 'darkling10':
                return 500;
            case 'darkmidboss1':
            case 'darkmidboss2':
                return 100; // Round 1 Wave 1-2 mid-bosses (50 HP)
            case 'darkmidboss3':
            case 'darkmidboss4':
                return 150; // Round 1 Wave 3-4 mid-bosses (75 HP)
            case 'darkmidboss5':
            case 'darkmidboss6':
            case 'darkmidboss7':
            case 'darkmidboss8':
                return 200; // Round 2 mid-bosses (100 HP)
            case 'darkmidboss9':
            case 'darkmidboss10':
                return 300; // Round 3 mid-bosses (150 HP)
            case 'darkmidboss11':
                return 350; // Round 3 Wave 7 special mid-boss (150 HP)
            default:
                return 100;
        }
    }
    
    /**
     * Get the vertical position where this enemy should stop
     * @returns {number} - Target Y position
     */
    getHomeY() {
        if (this.type.includes('boss')) {
            return 150;
        }
        
        // Allow mid-bosses to go higher up on the screen
        if (this.isMidBoss()) {
            return 50 + Math.random() * 150; // Range of 50-200px from top (higher positions)
        }
        
        // Regular enemies
        return 100 + Math.random() * 200;
    }
    
    /**
     * Calculate movement pattern
     * @returns {Object} - Movement vector { x, y }
     */
    getMovementPattern() {
        const reverseDirection = this.reversePattern ? -1 : 1;
        const phaseOffset = Math.random() * 1000;
        
        if (!this.hasReachedHome) {
            // Move to home position
            const distToHome = this.homeY - this.y;
            if (distToHome <= this.verticalSpeed) {
                this.hasReachedHome = true;
                this.y = this.homeY;
                return { x: 0, y: 0 };
            }
            return { x: 0, y: this.verticalSpeed };
        }
        
        // Different patterns based on enemy type
        switch(this.type) {
            case 'darklingboss1':
            case 'darklingboss2':
            case 'darklingboss3':
                // Boss zigzag pattern
                if (this.isCharging) {
                    return { x: 0, y: 0 }; // Don't move while charging
                }
                
                return {
                    x: Math.sin(Date.now() * 0.001) * 1.5,
                    y: Math.sin(Date.now() * 0.0005) * 0.5
                };
                
            // Mid-boss unique movement patterns
            case 'darkmidboss1':
                // Figure-8 pattern - horizontal infinity symbol movement
                const t1 = Date.now() * 0.001;
                return {
                    x: Math.sin(t1) * 1.2,
                    y: Math.sin(t1 * 2) * 0.4 // Vertical movement at twice the frequency
                };
                
            case 'darkmidboss2':
                // Erratic side-to-side with pause
                const t2 = Date.now() * 0.001;
                // Create pauses in movement
                const pauseFactor = Math.sin(t2 * 0.2) > 0.7 ? 0.2 : 1;
                return {
                    x: Math.sin(t2) * 1.5 * pauseFactor,
                    y: Math.cos(t2 * 0.5) * 0.3 * pauseFactor
                };
                
            case 'darkmidboss3':
                // Circle pattern - rotational movement
                const t3 = Date.now() * 0.0008;
                const radius = 1.0;
                return {
                    x: Math.cos(t3) * radius,
                    y: Math.sin(t3) * radius * 0.4 // Flatten the circle to an oval
                };
                
            case 'darkmidboss4':
                // Zigzag approach - varying speeds
                const t4 = Date.now() * 0.001;
                const zigzagSpeed = (Math.sin(t4 * 5) + 1) * 0.6; // Oscillates between 0 and 1.2
                return {
                    x: Math.sin(t4 * 2) * zigzagSpeed,
                    y: Math.cos(t4) * 0.3
                };
                
            case 'darkmidboss5':
                // Pendulum motion - swings from side to side with gravity effect
                const t5 = Date.now() * 0.0008;
                return {
                    x: Math.sin(t5) * 1.8, // Wide horizontal swing
                    y: Math.abs(Math.sin(t5)) * 0.4 // Small bounces at the ends
                };
                
            case 'darkmidboss6':
                // Stalking motion - slow horizontal tracking with small vertical adjustments
                const t6 = Date.now() * 0.0006; // Slower movement
                return {
                    x: Math.sin(t6) * 1.2,
                    y: (Math.sin(t6 * 3) * 0.3) + (Math.sin(t6 * 7) * 0.1) // Complex vertical movement
                };
                
            case 'darkmidboss7':
                // Spiral pattern - constantly changing direction
                const t7 = Date.now() * 0.001;
                const spiralRadius = 1.0 + Math.sin(t7 * 0.5) * 0.5; // Radius oscillates
                return {
                    x: Math.cos(t7) * spiralRadius,
                    y: Math.sin(t7 * 1.2) * 0.5 // Slightly faster vertical oscillation
                };
                
            case 'darkmidboss8':
                // Square pattern - moves in straight lines with sharp turns
                const t8 = Date.now() * 0.0005;
                const angle8 = (t8 % (Math.PI * 2)); // 0 to 2π
                // Create a square-like movement by using absolute cosine and sine
                const squareX = Math.sign(Math.cos(angle8)) * Math.pow(Math.abs(Math.cos(angle8)), 0.5);
                const squareY = Math.sign(Math.sin(angle8)) * Math.pow(Math.abs(Math.sin(angle8)), 0.5);
                return {
                    x: squareX * 1.2,
                    y: squareY * 0.4
                };
                
            case 'darkmidboss9':
                // Aggressive hunting - fast, jerky movements that target the player
                const t9 = Date.now() * 0.002; // Faster movement
                // More aggressive, abrupt changes in direction
                return {
                    x: Math.sin(t9) * Math.cos(t9 * 4) * 1.5,
                    y: Math.sin(t9 * 3) * 0.5
                };
                
            case 'darkmidboss10':
                // Chaotic movement - unpredictable pattern
                const t10 = Date.now() * 0.001;
                // Combine multiple sine waves for chaos
                return {
                    x: (Math.sin(t10) + Math.sin(t10 * 2.7) * 0.4) * 1.0,
                    y: (Math.sin(t10 * 1.3) + Math.sin(t10 * 3.1) * 0.3) * 0.4
                };
                
            case 'darkmidboss11':
                // Special movement that changes based on health
                const t11 = Date.now() * 0.001;
                const healthPercent = this.health / this.maxHealth;
                
                if (healthPercent > 0.5) {
                    // Full health: slow, deliberate movement
                    return {
                        x: Math.sin(t11 * 0.5) * 1.3,
                        y: Math.sin(t11 * 0.2) * 0.4
                    };
                } else {
                    // Low health: erratic, desperate movement
                    const speed = (1.0 - healthPercent) * 2; // Speed increases as health decreases
                    return {
                        x: Math.sin(t11 * speed) * Math.cos(t11) * 2.0,
                        y: Math.sin(t11 * 1.5) * 0.7
                    };
                }
                
            case 'darkling4':
                // Stays in place if shield is active
                if (this.shieldActive) {
                    return { x: 0, y: 0 };
                }
                // Slow side-to-side movement
                return {
                    x: Math.sin(Date.now() * 0.001) * 1,
                    y: 0
                };
                
            case 'darkling7':
            case 'darkling8':
                // Faster side-to-side movement
                return {
                    x: Math.sin(Date.now() * 0.002) * 2 * reverseDirection,
                    y: 0
                };
                
            default:
                // Standard sine wave pattern for regular enemies
                return {
                    x: Math.sin(Date.now() * this.frequency) * this.amplitude / 100 * reverseDirection,
                    y: 0
                };
        }
    }
    
    /**
     * Update enemy state
     * @param {number} time - Current time
     * @returns {boolean} - True if the enemy should be removed
     */
    update(time) {
        // Handle shield cooldown
        if (this.shieldCooldown > 0) {
            this.shieldCooldown -= 16.67; // Approximation for 60fps
            if (this.shieldCooldown < 0) this.shieldCooldown = 0;
        }
        
        // Handle death animation
        if (this.isDying) {
            this.fadeAlpha -= 0.05;
            if (this.fadeAlpha <= 0) {
                return true; // Remove this enemy
            }
            return false;
        }
        
        // Apply movement pattern
        const movement = this.getMovementPattern();
        this.x += movement.x;
        this.y += movement.y;
        
        // Keep within screen bounds
        const boundsPadding = 40;
        if (this.x < boundsPadding) this.x = boundsPadding;
        if (this.x > this.game.canvas.width - boundsPadding) this.x = this.game.canvas.width - boundsPadding;
        
        // Handle shooting
        if (this.shootCooldown > 0 && time - this.lastShot >= this.shootCooldown) {
            this.shoot();
            this.lastShot = time;
        }
        
        return false;
    }
    
    /**
     * Draw the enemy
     */
    draw() {
        const sprite = this.game.assets.images[this.type];
        
        this.game.ctx.save();
        
        // Apply fade effect if dying
        if (this.isDying) {
            this.game.ctx.globalAlpha = this.fadeAlpha;
        }
        
        // Apply charging effect
        if (this.isCharging) {
            this.game.ctx.shadowBlur = 20;
            this.game.ctx.shadowColor = '#ff0000';
        }
        
        // Apply shield effect
        if (this.shieldActive) {
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                         this.width * 0.75, 0, Math.PI * 2);
            this.game.ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
            this.game.ctx.fill();
            
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                         this.width * 0.75, 0, Math.PI * 2);
            this.game.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            this.game.ctx.lineWidth = 3;
            this.game.ctx.stroke();
        }
        
        if (sprite) {
            this.game.ctx.drawImage(
                sprite,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            // Fallback if sprite not found
            this.game.ctx.fillStyle = this.type.includes('boss') ? '#ff5555' : '#77aadd';
            this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw health bar for bosses and stronger enemies
        if ((this.type.includes('boss') || this.maxHealth > 1) && !this.isDying) {
            const barWidth = this.width;
            const barHeight = 5;
            const healthPercent = this.health / this.maxHealth;
            
            // Health bar background
            this.game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.game.ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
            
            // Health bar fill
            this.game.ctx.fillStyle = this.type.includes('boss') ? '#ff3333' : '#33ff33';
            this.game.ctx.fillRect(
                this.x, 
                this.y - 10, 
                barWidth * healthPercent, 
                barHeight
            );
        }
        
        this.game.ctx.restore();
    }
    
    /**
     * Handle enemy shooting based on type
     */
    shoot() {
        // Skip if the enemy doesn't shoot
        if (this.type === 'darkling1' || this.type === 'darkling9') return;
        
        // Special handling for mid-bosses - use their unique projectile patterns
        if (this.isMidBoss()) {
            const projectiles = this.createMidBossProjectiles(this.x + this.width/2, this.y + this.height/2);
            
            // Create all projectiles in the pattern
            if (projectiles && projectiles.length > 0 && this.game.gameController && this.game.gameController.projectileManager) {
                projectiles.forEach(projectile => {
                    this.game.gameController.projectileManager.createEnemyProjectileWithVelocity(
                        projectile.x,
                        projectile.y,
                        projectile.dx,
                        projectile.dy,
                        {
                            width: projectile.width || 30,
                            height: projectile.height || 30,
                            sprite: projectile.sprite || 'darklingshot7',
                            rotate: projectile.rotate || true,
                            rotationSpeed: projectile.rotationSpeed || 0.1
                        }
                    );
                });
                
                // Play shot sound effect for mid-bosses
                if (this.game.audioManager) {
                    this.game.audioManager.playSfx('enemyShot');
                }
            }
            return;
        }
        
        // For regular enemies, use the standard shooting mechanism
        if (this.game.gameController && typeof this.game.enemyShoot === 'function') {
            this.game.enemyShoot(this);
        }
    }
    
    /**
     * Handle enemy taking damage
     * @param {number} amount - Amount of damage taken
     * @returns {boolean} - True if the enemy was defeated
     */
    takeDamage(amount = 1) {
        // Skip if invulnerable
        if (this.isInvulnerable) return false;
        
        // Reduce health
        this.health -= amount;
        
        // Play hit sound
        const hitSound = this.game.assets.sounds.hit;
        if (hitSound) {
            hitSound.currentTime = 0;
            hitSound.play();
        }
        
        // Check if defeated
        if (this.health <= 0) {
            this.defeat();
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle enemy defeat
     */
    defeat() {
        // Skip if already dying
        if (this.isDying) return;
        
        this.isDying = true;
        
        // Play defeat sound
        const defeatSound = this.type.includes('boss') ? 
                          this.game.assets.sounds.bossDefeat : 
                          this.game.assets.sounds.enemyDefeat;
        if (defeatSound) {
            defeatSound.currentTime = 0;
            defeatSound.play();
        }
        
        // Create defeat particles
        if (this.game.particleSystem) {
            // Create a larger explosion for bosses
            const particleCount = this.type.includes('boss') ? 15 : 5;
            for (let i = 0; i < particleCount; i++) {
                setTimeout(() => {
                    const offsetX = (Math.random() - 0.5) * this.width;
                    const offsetY = (Math.random() - 0.5) * this.height;
                    
                    this.game.particleSystem.createParticle(
                        this.x + this.width/2 + offsetX,
                        this.y + this.height/2 + offsetY,
                        {
                            type: 'defeat',
                            scale: this.type.includes('boss') ? 2 + Math.random() : 1 + Math.random() * 0.5
                        }
                    );
                }, i * 50);
            }
        }
        
        // Spawn a powerup on some defeats (more likely from bosses)
        if (this.game.spawnPowerup && 
            (this.type.includes('boss') || Math.random() < 0.1)) {
            this.game.spawnPowerup(this.x + this.width/2, this.y + this.height/2);
        }
    }

    /**
     * Create projectile patterns for mid-bosses
     * @param {number} x - X position to spawn projectiles
     * @param {number} y - Y position to spawn projectiles
     * @returns {Array} - Array of projectile objects
     */
    createMidBossProjectiles(x, y) {
        const projectiles = [];
        const playerPosition = this.game.player ? this.getPlayerCollisionPosition() : null;
        const baseSpeed = 3.5;
        
        // Helper function to create a projectile with an angle
        const createProjectile = (angle, speed = baseSpeed, size = 1.2) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            
            // Select appropriate sprite based on mid-boss type
            let sprite = 'darklingshot7'; // Default sprite
            let shouldRotate = true;
            
            // Customize projectile appearance based on mid-boss type
            if (this.type.includes('darkmidboss1') || this.type.includes('darkmidboss2')) {
                sprite = 'darklingshot1'; // Early mid-bosses: basic projectile
            } else if (this.type.includes('darkmidboss3') || this.type.includes('darkmidboss4')) {
                sprite = 'darklingshot2'; // Mid-tier: slightly more advanced
            } else if (this.type.includes('darkmidboss5') || this.type.includes('darkmidboss6')) {
                sprite = 'darklingshot3'; // Higher tier: more menacing
            } else if (this.type.includes('darkmidboss7') || this.type.includes('darkmidboss8')) {
                sprite = 'darklingshot4'; // Higher tier: energy projectile
            } else if (this.type.includes('darkmidboss9') || this.type.includes('darkmidboss10')) {
                sprite = 'darklingshot5'; // Late-game: powerful appearance
            } else if (this.type.includes('darkmidboss11')) {
                sprite = 'darklingshot6'; // Special mid-boss: unique projectile
            }
            
            return {
                x: x,
                y: y,
                dx: dx,
                dy: dy,
                width: 30 * size,
                height: 30 * size,
                sprite: sprite,
                rotate: shouldRotate,
                rotationSpeed: shouldRotate ? (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1) : 0,
                rotation: 0
            };
        };
        
        // Helper for creating a targeted projectile
        const createTargetedProjectile = (speed = baseSpeed, size = 1.2) => {
            if (!playerPosition) return null;
            
            const dx = playerPosition.x - x;
            const dy = playerPosition.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize and scale by speed
            const ndx = (dx / dist) * speed;
            const ndy = (dy / dist) * speed;
            
            // Select appropriate sprite based on mid-boss type
            let sprite = 'darklingshot7'; // Default sprite
            
            // Same sprite customization as above
            if (this.type.includes('darkmidboss1') || this.type.includes('darkmidboss2')) {
                sprite = 'darklingshot1';
            } else if (this.type.includes('darkmidboss3') || this.type.includes('darkmidboss4')) {
                sprite = 'darklingshot2';
            } else if (this.type.includes('darkmidboss5') || this.type.includes('darkmidboss6')) {
                sprite = 'darklingshot3';
            } else if (this.type.includes('darkmidboss7') || this.type.includes('darkmidboss8')) {
                sprite = 'darklingshot4';
            } else if (this.type.includes('darkmidboss9') || this.type.includes('darkmidboss10')) {
                sprite = 'darklingshot5';
            } else if (this.type.includes('darkmidboss11')) {
                sprite = 'darklingshot6';
            }
            
            return {
                x: x,
                y: y,
                dx: ndx,
                dy: ndy,
                width: 30 * size,
                height: 30 * size,
                sprite: sprite,
                rotate: true,
                rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                rotation: 0
            };
        };

        switch(this.type) {
            case 'darkmidboss1':
                // Aggressive 2-shot attack pattern
                projectiles.push(createProjectile(85, baseSpeed * 1.1));
                projectiles.push(createProjectile(95, baseSpeed * 1.1));
                break;
                
            case 'darkmidboss2':
                // Defensive flight pattern - 3-way spread
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, baseSpeed));
                }
                break;
                
            case 'darkmidboss3':
            case 'darkmidboss4':
                // Balanced aggressive/defensive - targeted shot plus side shots
                const targeted = createTargetedProjectile(baseSpeed * 1.2);
                if (targeted) projectiles.push(targeted);
                projectiles.push(createProjectile(70, baseSpeed));
                projectiles.push(createProjectile(110, baseSpeed));
                break;
                
            case 'darkmidboss5':
            case 'darkmidboss6':
            case 'darkmidboss7':
            case 'darkmidboss8':
                // More powerful 3-shot attack pattern with faster projectiles
                projectiles.push(createProjectile(80, baseSpeed * 1.3));
                projectiles.push(createProjectile(90, baseSpeed * 1.3));
                projectiles.push(createProjectile(100, baseSpeed * 1.3));
                break;
                
            case 'darkmidboss9':
            case 'darkmidboss10':
                // Aggressive attack pattern - 5-way spread + targeted
                for (let angle = 70; angle <= 110; angle += 10) {
                    projectiles.push(createProjectile(angle, baseSpeed * 1.2));
                }
                const targetedShot = createTargetedProjectile(baseSpeed * 1.4);
                if (targetedShot) projectiles.push(targetedShot);
                break;
                
            case 'darkmidboss11':
                // Special mid-boss with changing projectile patterns based on health
                if (this.health > this.maxHealth / 2) {
                    // First pattern at full health - burst pattern
                    for (let angle = 0; angle < 360; angle += 22.5) {
                        projectiles.push(createProjectile(angle, baseSpeed * 1.1, 1.3));
                    }
                } else {
                    // Second pattern at half health - radial pattern
                    for (let angle = 0; angle < 360; angle += 15) {
                        projectiles.push(createProjectile(angle, baseSpeed * 1.3, 1.1));
                    }
                }
                break;
        }
        
        return projectiles;
    }
    
    /**
     * Get player collision position for targeting
     * @returns {Object|null} - Player position for targeting or null if player not available
     */
    getPlayerCollisionPosition() {
        if (!this.game.gameController || !this.game.gameController.player) return null;
        
        return {
            x: this.game.gameController.player.position.x,
            y: this.game.gameController.player.position.y
        };
    }

    /**
     * Determine if this enemy is a mid-boss
     * @returns {boolean} - True if this is a mid-boss enemy
     */
    isMidBoss() {
        return this.type.startsWith('darkmidboss');
    }

    /**
     * Get the scale for this enemy type
     * @returns {number} - Scale factor for the enemy's size
     */
    getScale() {
        if (this.type.includes('boss')) {
            return 1.5;
        }
        
        if (this.isMidBoss()) {
            // Use 75% scale for mid-bosses except for mid-boss 11 (100%)
            return this.type === 'darkmidboss11' ? 1.0 : 0.75;
        }
        
        return 1.0; // Regular enemies at normal scale
    }
}