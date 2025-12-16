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
        // Track visual facing for left/right orientation
        this.facingLeft = false;
        
        // Movement pattern
        this.reversePattern = Math.random() < 0.5;
        this.amplitude = 50 + Math.floor(Math.random() * 50);
        this.frequency = 0.001 + (Math.random() * 0.003);
        this.verticalSpeed = this.type.includes('boss') ? 0.5 : 1.2;
        this.homeY = this.getHomeY();
        this.hasReachedHome = false;
        this.originalX = x; // Store original X position for patterns

        // Boss teleport state (only used for bosses)
        if (this.isBoss) {
            // Per-type base profiles
            let baseCooldown = 2000;
            let distancePx = 240;
            const pauseFrames = 10;
            switch (this.type) {
                case 'darklingboss1':
                    baseCooldown = 2500;
                    distancePx = 180;
                    break;
                case 'darklingboss2':
                    baseCooldown = 2000;
                    distancePx = 240;
                    break;
                case 'darklingboss3':
                    baseCooldown = 1600;
                    distancePx = 300;
                    break;
            }
            this.teleportBaseCooldownMs = baseCooldown;
            this.teleportMinCooldownMs = 1000; // hard floor
            this.teleportDistancePx = distancePx;
            this.teleportPauseFrames = pauseFrames;
            this.teleportPauseLeft = 0;
            this.teleportStartTimeMs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            // Stagger first teleport slightly so it doesn't happen immediately on spawn
            const initialJitter = 300 + Math.random() * 400;
            this.teleportNextAt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + baseCooldown + initialJitter;
        }

        // Mid-boss spawn de-stack and formation escape
        if (this.isMidBoss()) {
            // Ensure controller won't keep them in formation
            this.isInFormation = false;
            // Apply a small random horizontal jitter once to reduce initial stacking
            this._spawnJitterApplied = false;
            const jitter = (Math.random() - 0.5) * 120; // ±60px
            this.x += jitter;
            // Keep within safe horizontal band immediately
            const canvasW = (this.game && this.game.canvas && Number.isFinite(this.game.canvas.width)) ? this.game.canvas.width : 800;
            const safeMargin = 140;
            const minX = safeMargin;
            const maxX = canvasW - safeMargin - this.width;
            if (this.x < minX) this.x = minX;
            if (this.x > maxX) this.x = maxX;
        }

        // Debug: construction log
        try {
            if (typeof console !== 'undefined') {
                console.log(`[EnemySystem] Constructed ${this.type} at (${Math.round(this.x)}, ${Math.round(this.y)})`);
            }
        } catch (_) {}
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
                return Math.floor(2500 * 1.1); // Early-game: 10% less frequent
            case 'darkling4':
                return Math.floor(2500 * 1.1); // Early-game: 10% less frequent
            case 'darkling5':
                return Math.floor(2000 * 1.1); // Early-game: 10% less frequent
            case 'darkling6':
                return Math.floor(2000 * 1.1); // Early-game: 10% less frequent
            case 'darkling7':
                return 2000; // mid-tier unchanged
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
                // Boss movement: center-focused oscillation with edge-aware steering
                if (this.isCharging) {
                    return { x: 0, y: 0 }; // Don't move while charging
                }

                const tBoss = Date.now() * 0.001;
                // Target around center with gentle drift
                const centerX = (this.game.canvas.width - this.width) / 2;
                const dxToCenter = centerX - this.x;
                const centerPull = Math.max(-1.2, Math.min(1.2, dxToCenter * 0.002));
                // Base oscillation
                const oscX = Math.sin(tBoss) * 1.4;
                const oscY = Math.sin(tBoss * 0.5) * 0.4;
                // Edge-aware correction
                const safeMargin = 120;
                let edgeCorr = 0;
                if (this.x <= safeMargin) edgeCorr = 1.8;
                else if (this.x >= (this.game.canvas.width - safeMargin - this.width)) edgeCorr = -1.8;

                return {
                    x: oscX + centerPull + edgeCorr,
                    y: oscY
                };
                
            // Mid-boss unique movement patterns
            case 'darkmidboss1':
                // Center-focused figure-8 with edge-aware corrections
                const t1 = Date.now() * 0.001;
                {
                    const centerX = (this.game.canvas.width - this.width) / 2;
                    const dxToCenter = centerX - this.x;
                    const centerPull = Math.max(-1.2, Math.min(1.2, dxToCenter * 0.002));
                    const safeMargin = 110;
                    let edgeCorr = 0;
                    if (this.x <= safeMargin) edgeCorr = 1.6;
                    else if (this.x >= (this.game.canvas.width - safeMargin - this.width)) edgeCorr = -1.6;
                    return {
                        x: Math.sin(t1) * 1.2 + centerPull + edgeCorr,
                        y: Math.sin(t1 * 2) * 0.4
                    };
                }
                
            case 'darkmidboss2':
                // Erratic side-to-side with pause, but keep centered and off edges
                const t2 = Date.now() * 0.001;
                const pauseFactor = Math.sin(t2 * 0.2) > 0.7 ? 0.2 : 1;
                {
                    const centerX = (this.game.canvas.width - this.width) / 2;
                    const dxToCenter = centerX - this.x;
                    const centerPull = Math.max(-1.0, Math.min(1.0, dxToCenter * 0.002));
                    const safeMargin = 110;
                    let edgeCorr = 0;
                    if (this.x <= safeMargin) edgeCorr = 1.5;
                    else if (this.x >= (this.game.canvas.width - safeMargin - this.width)) edgeCorr = -1.5;
                    return {
                        x: Math.sin(t2) * 1.5 * pauseFactor + centerPull + edgeCorr,
                        y: Math.cos(t2 * 0.5) * 0.3 * pauseFactor
                    };
                }
                
            case 'darkmidboss3':
                // Circle pattern biased toward center with edge-aware correction
                const t3 = Date.now() * 0.0008;
                const radius = 1.0;
                {
                    const centerX = (this.game.canvas.width - this.width) / 2;
                    const dxToCenter = centerX - this.x;
                    const centerPull = Math.max(-1.2, Math.min(1.2, dxToCenter * 0.002));
                    const safeMargin = 120;
                    let edgeCorr = 0;
                    if (this.x <= safeMargin) edgeCorr = 1.8;
                    else if (this.x >= (this.game.canvas.width - safeMargin - this.width)) edgeCorr = -1.8;
                    return {
                        x: Math.cos(t3) * radius + centerPull + edgeCorr,
                        y: Math.sin(t3) * radius * 0.4
                    };
                }
                
            case 'darkmidboss4':
                // Zigzag kept away from edges with center bias
                const t4 = Date.now() * 0.001;
                const zigzagSpeed = (Math.sin(t4 * 5) + 1) * 0.6;
                {
                    const centerX = (this.game.canvas.width - this.width) / 2;
                    const dxToCenter = centerX - this.x;
                    const centerPull = Math.max(-1.1, Math.min(1.1, dxToCenter * 0.002));
                    const safeMargin = 120;
                    let edgeCorr = 0;
                    if (this.x <= safeMargin) edgeCorr = 1.7;
                    else if (this.x >= (this.game.canvas.width - safeMargin - this.width)) edgeCorr = -1.7;
                    return {
                        x: Math.sin(t4 * 2) * zigzagSpeed + centerPull + edgeCorr,
                        y: Math.cos(t4) * 0.3
                    };
                }
                
            case 'darkmidboss5':
                // Pendulum motion centered and edge-aware
                const t5 = Date.now() * 0.0008;
                {
                    const centerX = (this.game.canvas.width - this.width) / 2;
                    const dxToCenter = centerX - this.x;
                    const centerPull = Math.max(-1.3, Math.min(1.3, dxToCenter * 0.002));
                    const safeMargin = 130;
                    let edgeCorr = 0;
                    if (this.x <= safeMargin) edgeCorr = 2.0;
                    else if (this.x >= (this.game.canvas.width - safeMargin - this.width)) edgeCorr = -2.0;
                    return {
                        x: Math.sin(t5) * 1.8 + centerPull + edgeCorr,
                        y: Math.abs(Math.sin(t5)) * 0.4
                    };
                }
                
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
        // Debug tick counter to throttle logs
        if (!this._dbgTick) this._dbgTick = 0;
        this._dbgTick++;
        const wasX = this.x;
        const wasY = this.y;
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
        
            // Boss-only teleport check before movement deltas
            if (this.isBoss) {
                const nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
                const currentTimeMs = Number.isFinite(time) ? time : nowMs;
                if (currentTimeMs >= (this.teleportNextAt || 0)) {
                    const canvasW = (this.game && this.game.canvas && Number.isFinite(this.game.canvas.width)) ? this.game.canvas.width : 800;
                    const canvasH = (this.game && this.game.canvas && Number.isFinite(this.game.canvas.height)) ? this.game.canvas.height : 600;
                    const boundsPadding = 60; // boss padding used below as well

                    // Uniform random angle and magnitude
                    const angle = Math.random() * Math.PI * 2;
                    const minMag = 60;
                    const maxMag = Math.max(minMag, this.teleportDistancePx || 240);
                    const mag = minMag + Math.random() * (maxMag - minMag);
                    let targetX = this.x + Math.cos(angle) * mag;
                    let targetY = this.y + Math.sin(angle) * mag;

                    // Clamp to screen horizontally
                    if (targetX < boundsPadding) targetX = boundsPadding;
                    if (targetX > canvasW - boundsPadding) targetX = canvasW - boundsPadding;

                    // Player Y lane avoidance ±100px
                    const playerPos = this.getPlayerCollisionPosition();
                    const laneHalf = 100;
                    const bossBottomCap = canvasH - 320; // keep bosses higher than player lane
                    if (playerPos && Number.isFinite(playerPos.y)) {
                        const laneMin = playerPos.y - laneHalf;
                        const laneMax = playerPos.y + laneHalf;
                        if (targetY >= laneMin && targetY <= laneMax) {
                            // Push to nearest side outside the lane
                            const distToMin = Math.abs(targetY - laneMin);
                            const distToMax = Math.abs(laneMax - targetY);
                            if (distToMin < distToMax) targetY = laneMin - 1; else targetY = laneMax + 1;
                        }
                    } else {
                        // Fallback: bias near homeY/top half, avoid dropping too low
                        const homeBias = Number.isFinite(this.homeY) ? this.homeY : 150;
                        targetY = Math.min(targetY, homeBias + 60);
                    }

                    // Vertical safety: never below bossBottomCap
                    if (targetY > bossBottomCap) targetY = bossBottomCap;
                    if (targetY < 0) targetY = 0;

                    // Corner avoidance: if target is near bottom corners, bias up and inward
                    const nearLeftCorner = (targetX <= boundsPadding + 10) && (targetY >= bossBottomCap - 10);
                    const nearRightCorner = (targetX >= canvasW - boundsPadding - 10) && (targetY >= bossBottomCap - 10);
                    if (nearLeftCorner) { targetX = boundsPadding + 80; targetY = bossBottomCap - 60; }
                    if (nearRightCorner) { targetX = canvasW - boundsPadding - 80; targetY = bossBottomCap - 60; }

                    // Apply snap and pause
                    this.x = targetX;
                    this.y = targetY;
                    this.teleportPauseLeft = this.teleportPauseFrames || 10;

                    // Schedule next teleport with time-based decay (−40ms/sec)
                    const elapsed = currentTimeMs - (this.teleportStartTimeMs || currentTimeMs);
                    const decayMs = 40 * (elapsed / 1000);
                    const baseCd = this.teleportBaseCooldownMs || 2000;
                    const nextCd = Math.max(this.teleportMinCooldownMs || 1000, baseCd - decayMs);
                    this.teleportNextAt = currentTimeMs + nextCd;

                    // Debug teleport event
                    try {
                        if (typeof console !== 'undefined') {
                            console.log(`[EnemySystem] ${this.type} teleported to (${Math.round(this.x)}, ${Math.round(this.y)}) nextCd=${Math.round(nextCd)}ms`);
                        }
                    } catch (_) {}
                }
            }

            // Apply movement: bosses and mid-bosses use EnemySystem helpers with centered coords
            let movement = { x: 0, y: 0 };
            const canvasW = (this.game && this.game.canvas && Number.isFinite(this.game.canvas.width)) ? this.game.canvas.width : 800;
            const canvasH = (this.game && this.game.canvas && Number.isFinite(this.game.canvas.height)) ? this.game.canvas.height : 600;
            const cx = this.x - canvasW / 2;
            const cy = this.y - canvasH / 2;

            if (typeof window !== 'undefined' && this.isBoss && window.EnemySystemBossHelpers && typeof window.EnemySystemBossHelpers.getBossDelta === 'function') {
                movement = window.EnemySystemBossHelpers.getBossDelta(this.type, cx, cy, canvasW, canvasH, time);
            } else if (typeof window !== 'undefined' && this.isMidBoss() && window.EnemySystemHelpers && typeof window.EnemySystemHelpers.getMidBossDelta === 'function') {
                movement = window.EnemySystemHelpers.getMidBossDelta(this.type, cx, cy, canvasW, canvasH, time);
            } else {
                // Fallback to internal pattern for regular enemies
                movement = this.getMovementPattern();
            }

            // Suppress movement while in teleport pause
            if (this.isBoss && (this.teleportPauseLeft || 0) > 0) {
                this.teleportPauseLeft -= 1;
                movement = { x: 0, y: 0 };
            }

            // Debug movement every 30 ticks
            if (this._dbgTick % 30 === 0) {
                try { if (typeof console !== 'undefined') {
                    console.log(`[EnemySystem] ${this.type} move dx=${movement.x.toFixed(2)} dy=${movement.y.toFixed(2)} pos=(${Math.round(this.x)}, ${Math.round(this.y)}) pauseLeft=${this.teleportPauseLeft||0}`);
                }} catch (_) {}
            }

            // Apply additive deltas
            this.x += movement.x;
            this.y += movement.y;

        // Extra debug for bosses/mid-bosses every ~200ms
        if ((this.type.includes('boss') || this.isMidBoss()) && this._dbgTick % 12 === 0) {
            try { if (typeof console !== 'undefined') {
                const dx = this.x - wasX;
                const dy = this.y - wasY;
                const tpCd = this.teleportNextAt ? Math.max(0, (this.teleportNextAt - (typeof performance !== 'undefined' ? performance.now() : Date.now()))) : -1;
                console.debug(`[EnemySystem][dbg] ${this.type} pos=(${this.x.toFixed(1)},${this.y.toFixed(1)}) d=(${dx.toFixed(2)},${dy.toFixed(2)}) tpIn=${Math.round(tpCd)}ms pauseLeft=${this.teleportPauseLeft||0}`);
            }} catch (_) {}
        }

        // Update facing based on horizontal movement (small deadzone to avoid jitter)
        if (movement.x < -0.05) this.facingLeft = true;
        else if (movement.x > 0.05) this.facingLeft = false;
        
        // Keep within screen bounds (bosses get a larger padding)
        const basePadding = 40;
        const bossPadding = 60;
        const boundsPadding = this.isBoss ? bossPadding : basePadding;
        // canvasW/canvasH were computed earlier in update(); reuse them via local variables declared once.
        if (this.x < boundsPadding) this.x = boundsPadding;
        if (this.x > canvasW - boundsPadding) this.x = canvasW - boundsPadding;

        // Boss pathing corrections: stronger edge repel + vertical guardrails
        if (this.isBoss) {
            // Horizontal safety band and steering
            const safeMargin = 120; // wider unsafe bands on left/right
            const leftUnsafe = this.x <= safeMargin;
            const rightUnsafe = this.x >= (canvasW - safeMargin - this.width);
            const centerX = (canvasW - this.width) / 2;

            if (leftUnsafe) {
                this.x += 2.8; // stronger nudge right
            } else if (rightUnsafe) {
                this.x -= 2.8; // stronger nudge left
            } else {
                // gentle centering bias to avoid lingering near edges
                const dx = centerX - this.x;
                this.x += Math.sign(dx) * 0.5;
            }

            // Vertical tether to home band regardless of initial state
            const homeBuffer = 40; // allow small oscillation around homeY
            if (!this.hasReachedHome && Math.abs((this.y || 0) - (this.homeY || 150)) < homeBuffer) {
                this.hasReachedHome = true;
            }
            if (Number.isFinite(this.homeY)) {
                if (this.y > this.homeY + homeBuffer) {
                    this.y -= 1.8; // nudge upward toward home
                } else if (this.y < this.homeY - homeBuffer) {
                    this.y += 1.2; // gentle nudge downward toward home if too high
                }
            }
            // Hard bottom cap for bosses to keep them hittable
            const bossBottomCap = canvasH - 320; // keep bosses well above player row
            if (this.y > bossBottomCap) {
                this.y = bossBottomCap;
            }

            // Corner escape: if hugging bottom corners, push up and inward more aggressively
            const nearLeftCorner = (this.x <= safeMargin + 5) && (this.y >= bossBottomCap - 5);
            const nearRightCorner = (this.x >= (canvasW - safeMargin - this.width - 5)) && (this.y >= bossBottomCap - 5);
            if (nearLeftCorner) { this.x += 3.4; this.y -= 2.2; }
            if (nearRightCorner) { this.x -= 3.4; this.y -= 2.2; }
            // Ensure y doesn't go negative or NaN
            if (!Number.isFinite(this.y)) this.y = Math.max(0, this.homeY || 150);
        }

        // Mid-boss edge guards: keep away from extreme edges and too-low bands
        if (!this.isBoss && this.isMidBoss()) {
            // Ensure mid-bosses never re-enter formation mid-update
            this.isInFormation = false;
            const safeMargin = 140; // slightly wider than bosses to keep mid-bosses centered more
            const centerX = (canvasW - this.width) / 2;
            const leftUnsafe = this.x <= safeMargin;
            const rightUnsafe = this.x >= (canvasW - safeMargin - this.width);

            // Stronger horizontal repel when entering unsafe bands
            if (leftUnsafe) {
                this.x += 3.2; // shove right
            } else if (rightUnsafe) {
                this.x -= 3.2; // shove left
            } else {
                // Gentle center bias so they don't loiter near margins
                const dx = centerX - this.x;
                this.x += Math.sign(dx) * 0.6;
            }

            // Hard horizontal clamp within margins
            const minX = safeMargin;
            const maxX = canvasW - safeMargin - this.width;
            if (this.x < minX) this.x = minX;
            if (this.x > maxX) this.x = maxX;

            // Vertical bottom cap higher than bosses so they stay hittable and not on player row
            const midBossBottomCap = canvasH - 300;
            if (this.y > midBossBottomCap) this.y = midBossBottomCap;

            // Ensure y finite
            if (!Number.isFinite(this.y)) this.y = Math.max(0, this.homeY || 120);
        }
        
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
            // Flip horizontally when facing left
            if (this.facingLeft) {
                this.game.ctx.translate(this.x + this.width, this.y);
                this.game.ctx.scale(-1, 1);
                this.game.ctx.drawImage(
                    sprite,
                    0,
                    0,
                    this.width,
                    this.height
                );
            } else {
                this.game.ctx.drawImage(
                    sprite,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            }
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
            // Use canvas-space center coordinates so visuals and collisions align
            const px = this.x + this.width / 2;
            const py = this.y + this.height / 2;
            const projectiles = this.createMidBossProjectiles(px, py);
            
            // Create all projectiles in the pattern
            if (projectiles && projectiles.length > 0) {
                const gc = this.game.gameController;
                const pm = gc && gc.projectileManager;
                if (pm && typeof pm.createEnemyProjectileWithVelocity === 'function') {
                    projectiles.forEach(p => {
                        pm.createEnemyProjectileWithVelocity(
                            p.x, p.y, p.dx, p.dy,
                            {
                                width: p.width || 30,
                                height: p.height || 30,
                                sprite: p.sprite || 'darklingshot7',
                                rotate: p.rotate !== undefined ? p.rotate : true,
                                rotationSpeed: p.rotationSpeed || 0.1
                            }
                        );
                    });
                } else if (gc && Array.isArray(gc.projectiles && gc.projectiles.enemy)) {
                    // Fallback: push into enemy projectiles array for renderer
                    projectiles.forEach(p => {
                        gc.projectiles.enemy.push({
                            x: p.x,
                            y: p.y,
                            vx: p.dx,
                            vy: p.dy,
                            width: p.width || 30,
                            height: p.height || 30,
                            sprite: p.sprite || 'darklingshot7',
                            rotate: p.rotate !== undefined ? p.rotate : true,
                            rotationSpeed: p.rotationSpeed || 0.1,
                            rotation: p.rotation || 0
                        });
                    });
                } else if (gc) {
                    // Ensure arrays exist then retry push
                    if (!gc.projectiles) gc.projectiles = { player: [], enemy: [] };
                    if (!Array.isArray(gc.projectiles.enemy)) gc.projectiles.enemy = [];
                    projectiles.forEach(p => {
                        gc.projectiles.enemy.push({
                            x: p.x,
                            y: p.y,
                            vx: p.dx,
                            vy: p.dy,
                            width: p.width || 30,
                            height: p.height || 30,
                            sprite: p.sprite || 'darklingshot7',
                            rotate: p.rotate !== undefined ? p.rotate : true,
                            rotationSpeed: p.rotationSpeed || 0.1,
                            rotation: p.rotation || 0
                        });
                    });
                }
                // Play shot sound effect for mid-bosses
                try { if (this.game.audioManager) { this.game.audioManager.playSfx('enemyShot'); } } catch (_) {}
                // Debug
                try { if (typeof console !== 'undefined') console.log(`[EnemySystem] ${this.type} fired ${projectiles.length} shots from canvas (${Math.round(px)},${Math.round(py)})`); } catch (_) {}
            } else {
                // Debug: no projectiles created
                try { if (typeof console !== 'undefined') console.warn(`[EnemySystem] ${this.type} attempted to shoot but no projectiles were generated`); } catch (_) {}
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
        // Do not play any sound on enemy hit. Player hit sounds are handled elsewhere.
        
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
        // Silence defeat sounds per request
        
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
        // Prefer the Alchemy Blaster's fixed collision lane if available
        if (this.game && typeof this.game.getPlayerCollisionPosition === 'function') {
            const playerX = (this.game.player && Number.isFinite(this.game.player.x))
                ? this.game.player.x + (this.game.player.width ? this.game.player.width / 2 : 0)
                : 0;
            const pos = this.game.getPlayerCollisionPosition(playerX);
            if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
                return pos;
            }
        }

        // Fallback to gameController player position if present
        if (this.game && this.game.gameController && this.game.gameController.player) {
            return {
                x: this.game.gameController.player.position.x,
                y: this.game.gameController.player.position.y
            };
        }

        return null;
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

/**
 * EnemySystemHelpers
 * Self-contained mid-boss logic (movement + projectiles) to avoid depending on game_controller or monster_logic
 * Exposed globally for the game controller to use when updating plain enemy objects.
 */
window.EnemySystemHelpers = (function() {
    // Movement deltas for mid-bosses (timestamp-based), with center bias and edge avoidance.
    function getMidBossDelta(type, x, y, canvasW = 800, canvasH = 600, timestamp = Date.now()) {
        // Stronger oscillations + center pull; controller uses centered coords (-W/2..W/2)
        const t = timestamp * 0.001;
        const cx = 0;
        const dxToCenter = cx - x;
        const centerPull = Math.max(-5.0, Math.min(5.0, dxToCenter * 0.007)); // stronger pull
        const safeMargin = 140;
        let edgeCorr = 0;
        const leftBound = -canvasW/2 + safeMargin;
        const rightBound = canvasW/2 - safeMargin - 80;
        if (x <= leftBound) edgeCorr = 3.5;
        else if (x >= rightBound) edgeCorr = -3.5;

        // Base vertical keep-up nudge to avoid sinking
        const bottomCap = (canvasH/2 - 220);
        let verticalNudge = (y > bottomCap) ? -3.2 : 0;
        // Home band bias toward upper band
        const homeBiasY = Math.max(-2.4, Math.min(2.4, ((-canvasH/2 + 120) - y) * 0.0035));

        // Type-specific oscillation
        // Desync phase per instance
        const phase = ((typeof performance !== 'undefined' ? performance.now() : timestamp) % 997) / 997;
        const p = t + phase * 4.73;
        switch(type) {
            case 'darkmidboss1':
                return { x: Math.sin(p) * 7.0 + centerPull + edgeCorr, y: Math.sin(p * 2) * 2.3 + verticalNudge + homeBiasY };
            case 'darkmidboss2':
                return { x: Math.sin(p) * 7.5 * (Math.sin(p * 0.2) > 0.7 ? 0.5 : 1) + centerPull + edgeCorr, y: Math.cos(p * 0.5) * 2.2 + verticalNudge + homeBiasY };
            case 'darkmidboss3':
                return { x: Math.cos(p * 0.8) * 6.0 + centerPull + edgeCorr, y: Math.sin(p * 0.8) * 2.2 + verticalNudge + homeBiasY };
            case 'darkmidboss4':
                return { x: Math.sin(p * 2) * ((Math.sin(p * 5) + 1) * 3.2) + centerPull + edgeCorr, y: Math.cos(p) * 2.2 + verticalNudge + homeBiasY };
            case 'darkmidboss5':
                return { x: Math.sin(p) * 9.5 + centerPull + edgeCorr, y: Math.abs(Math.sin(p)) * 2.2 + verticalNudge + homeBiasY };
            case 'darkmidboss6':
                return { x: Math.sin(p * 0.6) * 6.5 + centerPull + edgeCorr, y: (Math.sin(p * 1.8) * 1.6) + (Math.sin(p * 4.2) * 0.6) + verticalNudge + homeBiasY };
            case 'darkmidboss7':
                return { x: Math.cos(p) * (5.4 + Math.sin(p * 0.5) * 2.6) + centerPull + edgeCorr, y: Math.sin(p * 1.2) * 2.6 + verticalNudge + homeBiasY };
            case 'darkmidboss8':
                {
                    const angle8 = (p * 0.5) % (Math.PI * 2);
                    const squareX = Math.sign(Math.cos(angle8)) * Math.pow(Math.abs(Math.cos(angle8)), 0.5);
                    const squareY = Math.sign(Math.sin(angle8)) * Math.pow(Math.abs(Math.sin(angle8)), 0.5);
                    return { x: squareX * 6.4 + centerPull + edgeCorr, y: squareY * 2.2 + verticalNudge + homeBiasY };
                }
            case 'darkmidboss9':
                return { x: Math.sin(p * 2) * Math.cos(p * 8) * 8.0 + centerPull + edgeCorr, y: Math.sin(p * 3) * 2.7 + verticalNudge + homeBiasY };
            case 'darkmidboss10':
                return { x: (Math.sin(p) + Math.sin(p * 2.7) * 0.4) * 5.4 + centerPull + edgeCorr, y: (Math.sin(p * 1.3) + Math.sin(p * 3.1) * 0.3) * 2.2 + verticalNudge + homeBiasY };
            case 'darkmidboss11':
                return { x: Math.sin(p * 0.9) * 6.9 + centerPull + edgeCorr, y: Math.sin(p * 0.4) * 2.4 + verticalNudge + homeBiasY };
            default:
                return { x: centerPull + edgeCorr + Math.sin(p) * 2.0, y: verticalNudge + homeBiasY + Math.sin(p * 0.6) * 0.8 };
        }
        // Ensure non-zero movement: add tiny epsilon wiggle so motion is always visible
        const epsX = Math.sin(t * 12.57) * 0.5;
        const epsY = Math.cos(t * 9.23) * 0.3;
        return { x: (ox || 0) + centerPull + edgeCorr + epsX, y: (oy || 0) + verticalNudge + homeBiasY + epsY };
    }

    // Projectile patterns for mid-bosses (targeted + spreads); returns [{x,y,dx,dy,width,height,sprite,rotate,rotationSpeed}]
    function getMidBossProjectiles(type, x, y, playerX = 0, playerY = 0) {
        const projectiles = [];
        const baseSpeed = 3.5;

        const make = (angleDeg, speed = baseSpeed, size = 1.2, sprite = 'darklingshot7') => {
            const rad = angleDeg * Math.PI / 180;
            return {
                x, y,
                dx: Math.cos(rad) * speed,
                dy: Math.sin(rad) * speed,
                width: 30 * size,
                height: 30 * size,
                sprite,
                rotate: true,
                rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                rotation: 0
            };
        };

        const targeted = (speed = baseSpeed, size = 1.2, sprite = 'darklingshot7') => {
            const dx = playerX - x;
            const dy = playerY - y;
            const dist = Math.max(1e-3, Math.sqrt(dx*dx + dy*dy));
            return {
                x, y,
                dx: (dx / dist) * speed,
                dy: (dy / dist) * speed,
                width: 30 * size,
                height: 30 * size,
                sprite,
                rotate: true,
                rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                rotation: 0
            };
        };

        // Choose sprite family by tier
        const spriteFor = () => {
            if (/(darkmidboss1|darkmidboss2)/.test(type)) return 'darklingshot1';
            if (/(darkmidboss3|darkmidboss4)/.test(type)) return 'darklingshot2';
            if (/(darkmidboss5|darkmidboss6)/.test(type)) return 'darklingshot3';
            if (/(darkmidboss7|darkmidboss8)/.test(type)) return 'darklingshot4';
            if (/(darkmidboss9|darkmidboss10)/.test(type)) return 'darklingshot5';
            if (/darkmidboss11/.test(type)) return 'darklingshot6';
            return 'darklingshot7';
        };
        const spr = spriteFor();

        switch(type) {
            case 'darkmidboss1':
                projectiles.push(make(85, baseSpeed * 1.1, 1.2, spr));
                projectiles.push(make(95, baseSpeed * 1.1, 1.2, spr));
                break;
            case 'darkmidboss2':
                for (let a = 75; a <= 105; a += 15) projectiles.push(make(a, baseSpeed, 1.2, spr));
                break;
            case 'darkmidboss3':
            case 'darkmidboss4':
                projectiles.push(targeted(baseSpeed * 1.2, 1.2, spr));
                projectiles.push(make(70, baseSpeed, 1.2, spr));
                projectiles.push(make(110, baseSpeed, 1.2, spr));
                break;
            case 'darkmidboss5':
            case 'darkmidboss6':
            case 'darkmidboss7':
            case 'darkmidboss8':
                projectiles.push(make(80, baseSpeed * 1.3, 1.2, spr));
                projectiles.push(make(90, baseSpeed * 1.3, 1.2, spr));
                projectiles.push(make(100, baseSpeed * 1.3, 1.2, spr));
                break;
            case 'darkmidboss9':
            case 'darkmidboss10':
                for (let a = 70; a <= 110; a += 10) projectiles.push(make(a, baseSpeed * 1.2, 1.2, spr));
                projectiles.push(targeted(baseSpeed * 1.4, 1.2, spr));
                break;
            case 'darkmidboss11':
                // Health-dependent pattern is controller-dependent; use stronger radial here
                for (let a = 0; a < 360; a += 18) projectiles.push(make(a, baseSpeed * 1.2, 1.2, spr));
                break;
            default:
                projectiles.push(make(80, baseSpeed));
                projectiles.push(make(90, baseSpeed));
                projectiles.push(make(100, baseSpeed));
        }
        return projectiles;
    }

    return { getMidBossDelta, getMidBossProjectiles };
})();

// Boss helpers: safer movement deltas with strong center bias and guardrails
window.EnemySystemBossHelpers = (function() {
    function getBossDelta(type, x, y, canvasW = 800, canvasH = 600, timestamp = Date.now()) {
        const t = timestamp * 0.001;
        const cx = 0; // centered coords
        const dx = cx - x;
        const centerPull = Math.max(-3.2, Math.min(3.2, dx * 0.006));
        const safeMargin = 120;
        const leftBound = -canvasW/2 + safeMargin;
        const rightBound = canvasW/2 - safeMargin - 100; // boss wider
        let edgeCorr = 0;
        if (x <= leftBound) edgeCorr = 3.0; else if (x >= rightBound) edgeCorr = -3.0;
        const bottomCap = canvasH/2 - 240;
        const verticalNudge = (y > bottomCap) ? -2.8 : 0;
        const homeBiasY = Math.max(-2.0, Math.min(2.0, ((-canvasH/2 + 130) - y) * 0.0032));

        // Type-specific mild oscillations layered atop biases
        let ox = 0, oy = 0;
        const phase = ((typeof performance !== 'undefined' ? performance.now() : timestamp) % 991) / 991;
        const p = t + phase * 3.17;
        if (type === 'darklingboss1') {
            ox = Math.sin(p * 1.2) * 2.6; oy = Math.cos(p * 0.8) * 1.4;
        } else if (type === 'darklingboss2') {
            ox = Math.sin(p * 1.5) * 3.0; oy = Math.sin(p * 0.9) * 1.6;
        } else { // darklingboss3 or others
            ox = Math.cos(p * 1.0) * 2.4; oy = Math.sin(p * 0.7) * 1.5;
        }
        // Epsilon wiggle to guarantee visible motion
        ox += Math.sin(t * 11.31) * 0.4;
        oy += Math.cos(t * 8.77) * 0.25;

        return { x: ox + centerPull + edgeCorr, y: oy + verticalNudge + homeBiasY };
    }
    return { getBossDelta };
})();

// Expose Enemy globally so other modules (e.g., alchemyblaster.js) can instantiate it
if (typeof window !== 'undefined') {
    window.Enemy = Enemy;
    try { if (typeof console !== 'undefined') console.log('[EnemySystem] Loaded'); } catch (_) {}
}