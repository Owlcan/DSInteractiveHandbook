/**
 * Monster Logic - Alchemy Blaster
 * 
 * This file contains all the monster logic for the Alchemy Blaster mini-game.
 * It centralizes the behavior for all 9 regular monsters and 4 boss monsters.
 */

class MonsterLogic {
    constructor(game) {
        this.game = game;
         this.characterSprites = {
            dere: {
                select: 'assets/images/darklings/dereharacterselect.webp',
                left: 'assets/images/darklings/dereleft.webp',
                right: 'assets/images/darklings/dereright.webp',
                shots: [
                    'assets/images/darklings/shot1.webp',
                    'assets/images/darklings/shot1a.webp',
                    'assets/images/darklings/shot1b.webp'
                ],
                gameover: 'assets/images/darklings/deregameover.webp'  // Add this line
            },
            aliza: {
                select: 'assets/images/darklings/alizacharacterselect.webp',
                left: 'assets/images/darklings/alizaleft.webp',
                right: 'assets/images/darklings/alizaright.webp',
                shots: [
                    'assets/images/darklings/alizashot1.webp', // Largest shot
                    'assets/images/darklings/alizashot2.webp', // Alternates between extra large/large
                    'assets/images/darklings/alizashot3.webp'  // Between shot2 and shot1 in size 
                ],
                gameover: 'assets/images/darklings/alizagameover.webp'
            }
        };
    }

    /**
     * Get initial health for an enemy based on its type
     * @param {string} type - The type of enemy
     * @returns {number} - Initial health value
     */
    getInitialHealth(type) {
        const healthMap = {
            'darklingboss1': 25,
            'darklingboss2': 30,
            'darklingboss3': 40,
            'darklingboss4': 50, // Reserved for future boss
            'darkling1': 1,
            'darkling2': 1,
            'darkling3': 1,
            'darkling4': 20,
            'darkling5': 1,
            'darkling6': 2,
            'darkling7': 10,
            'darkling8': 2,
            'darkling9': 1,
            'darkling10': 1
        };
        
        return healthMap[type] || 1; // Default to 1 if type not found
    }

    /**
     * Get shot cooldown for an enemy based on its type
     * @param {string} type - The type of enemy
     * @param {number} health - Current health of the enemy
     * @returns {number} - Cooldown time in milliseconds
     */
    getShotCooldown(type, health) {
        // Special case for darklingBoss2
        if (type === 'darklingboss2' && health > 25) {
            return Infinity; // Boss doesn't shoot in first phase
        }
        
        const cooldownMap = {
            'darklingboss1': 5000,
            'darklingboss2': 4000,
            'darklingboss3': 5000,
            'darklingboss4': 4000, // Reserved for future boss
            'darklingmob1': Infinity, // These enemies don't shoot
            'darklingmob2': 6000,
            'darklingmob3': 5000,
            'darklingmob4': 3000,
            'darklingmob5': 5000,
            'darklingmob6': 4000,
            'darklingmob7': 6000,
            'darklingmob8': 6000,
            'darklingmob9': Infinity, // These enemies don't shoot
            'darklingmob10': 6000
        };
        
        return cooldownMap[type] || 6000; // Default to 6000 if type not found
    }

    /**
     * Get movement speed for an enemy based on its type and health
     * @param {string} type - The type of enemy
     * @param {number} health - Current health of the enemy
     * @returns {number} - Movement speed value
     */
    getSpeed(type, health) {
        // Special case for darklingBoss3 - speeds up at low health
        if (type === 'darklingboss3' && health <= 20) {
            return 4;
        }
        
        if (type.includes('boss')) {
            return 2; // All bosses are slower
        }
        
        if (['darkling5', 'darkling9'].includes(type)) {
            return 4; // Fast enemies
        }
        
        return 3; // Default speed
    }

    /**
     * Get point value for defeating an enemy
     * @param {string} type - The type of enemy
     * @returns {number} - Point value
     */
    getPoints(type) {
        return type.includes('boss') ? 100 : 10;
    }

    /**
     * Determine if an enemy can drop a potion and which type
     * @param {string} type - The type of enemy
     * @returns {Object|null} - Potion data or null if no drop
     */
    getPotionDrop(type) {
        // Determine drop chance based on enemy type
        let dropChance = 0.05; // 5% base chance
        
        // Bosses have higher drop chance
        if (type.includes('boss')) {
            dropChance = 0.25; // 25% chance
        } else if (type === 'darkling6' || type === 'darkling8') {
            dropChance = 0.15; // 15% chance for these special enemies
        }
        
        // Determine if a potion drops
        if (Math.random() < dropChance) {
            // Determine which type of potion to drop
            const potionRoll = Math.random();
            
            let potionType;
            if (potionRoll < 0.5) {
                // 50% chance for health potion
                potionType = 'health';
            } else if (potionRoll < 0.75) {
                // 25% chance for power potion
                potionType = 'power';
            } else {
                // 25% chance for shield potion
                potionType = 'shield';
            }
            
            return { type: potionType };
        }
        
        return null; // No potion drop
    }

    /**
     * Get a movement pattern function for an enemy
     * @param {string} type - The type of enemy
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {boolean} reversePattern - Whether to reverse the movement pattern
     * @param {number} patternOffset - Offset for the movement pattern
     * @returns {Function} - Function that returns x,y position based on time
     */
    getMovementPattern(type, x, y, reversePattern, patternOffset) {
        const randomOffset = patternOffset || Math.random() * Math.PI * 2;
        const reverseDirection = reversePattern ? -1 : 1;
        const verticalOffset = Math.random() * 50 - 25;
        
        switch(type) {
            case 'darkling1':
                const gridSize = 120;
                const moveSpeed = 0.006;
                let initialX = x;
                let initialY = y;
                
                return t => {
                    // Check for random direction change (50% chance every 3 seconds)
                    if (!this.lastChangeTime) this.lastChangeTime = t;
                    if (!this.isRandomMove && t - this.lastChangeTime > 3000 && Math.random() < 0.5) {
                        this.isRandomMove = true;
                        this.randomAngle = Math.random() * Math.PI * 2;
                        this.randomDuration = 500; // Duration of random movement in ms
                        this.lastChangeTime = t;
                        this.initialX = x;
                        this.initialY = y;
                    }
                    
                    // Handle random movement
                    if (this.isRandomMove) {
                        if (t - this.lastChangeTime < this.randomDuration) {
                            // Quick burst in random direction
                            return {
                                x: this.initialX + Math.cos(this.randomAngle) * ((t - this.lastChangeTime) / 100) * gridSize * 0.5,
                                y: this.initialY + Math.sin(this.randomAngle) * ((t - this.lastChangeTime) / 100) * gridSize * 0.5
                            };
                        } else {
                            // Reset after random movement
                            this.isRandomMove = false;
                            this.initialX = x;
                            this.initialY = y;
                        }
                    }

                    // Normal movement pattern
                    const normalizedTime = t * moveSpeed;
                    const pattern = Math.floor(normalizedTime / 4) % 8;
                    const progress = (normalizedTime % 4) - 2;
                    
                    let patternX, patternY;
                    switch(pattern) {
                        case 0: // Move right
                            patternX = initialX + progress * gridSize;
                            patternY = initialY;
                            break;
                        case 1: // Move diagonal down-right
                            patternX = initialX + progress * gridSize;
                            patternY = initialY + progress * gridSize;
                            break;
                        case 2: // Move down
                            patternX = initialX + gridSize;
                            patternY = initialY + progress * gridSize;
                            break;
                        case 3: // Move diagonal down-left
                            patternX = initialX + (2 - progress) * gridSize;
                            patternY = initialY + progress * gridSize;
                            break;
                        case 4: // Move left
                            patternX = initialX + (2 - progress) * gridSize;
                            patternY = initialY + gridSize;
                            break;
                        case 5: // Move diagonal up-left
                            patternX = initialX + (2 - progress) * gridSize;
                            patternY = initialY + (2 - progress) * gridSize;
                            break;
                        case 6: // Move up
                            patternX = initialX;
                            patternY = initialY + (2 - progress) * gridSize;
                            break;
                        case 7: // Move diagonal up-right
                            patternX = initialX + progress * gridSize;
                            patternY = initialY + (2 - progress) * gridSize;
                            break;
                    }
                    
                    return {
                        x: patternX * reverseDirection,
                        y: patternY + 50 + (Math.sin(t * 0.001 + randomOffset) * 20)
                    };
                };
            
            case 'darkling2':
                return t => {
                    // Add random direction change similar to darkling1
                    if (!this.lastChangeTime) this.lastChangeTime = t;
                    if (!this.isRandomMove && t - this.lastChangeTime > 3000 && Math.random() < 0.5) {
                        this.isRandomMove = true;
                        this.randomAngle = Math.random() * Math.PI * 2;
                        this.randomDuration = 500;
                        this.lastChangeTime = t;
                        this.initialX = x;
                        this.initialY = y;
                    }
                    
                    if (this.isRandomMove) {
                        if (t - this.lastChangeTime < this.randomDuration) {
                            return {
                                x: this.initialX + Math.cos(this.randomAngle) * ((t - this.lastChangeTime) / 100) * 80,
                                y: this.initialY + Math.sin(this.randomAngle) * ((t - this.lastChangeTime) / 100) * 80
                            };
                        } else {
                            this.isRandomMove = false;
                            this.initialX = x;
                            this.initialY = y;
                        }
                    }

                    // Normal snake-like pattern
                    const rowHeight = 80;
                    const width = this.game.canvas.width * 0.45;
                    const normalizedTime = t * 0.01;
                    const row = Math.floor(normalizedTime / width) % 4;
                    const xProgress = (normalizedTime % width);
                    
                    let patternX = (row % 2 === 0) ? xProgress : (width - xProgress);
                    let patternY = row * rowHeight + 80 + Math.sin(t * 0.01 + randomOffset) * 40;
                    
                    return {
                        x: (patternX - width/2) * reverseDirection,
                        y: patternY + verticalOffset + (Math.sin(t * 0.002 + randomOffset) * 15)
                    };
                };
                
            case 'darkling3':
                // More dynamic figure-8 with inward movements
                return t => {
                    const cycleLength = 4000;
                    const timeInCycle = t % cycleLength;
                    const halfCycle = cycleLength / 2;
                    
                    // Use multiple sine waves for more complex movement
                    const baseX = Math.sin(t * 0.002) * (this.game.canvas.width * 0.3);
                    const baseY = Math.sin(t * 0.001) * (this.game.canvas.height * 0.2) + 120;
                    
                    // Add inward spiral movement
                    const spiralX = Math.cos(t * 0.003) * (Math.sin(t * 0.001) * 50);
                    const spiralY = Math.sin(t * 0.003) * (Math.cos(t * 0.001) * 50);
                    
                    return {
                        x: (baseX + spiralX) * reverseDirection,
                        y: baseY + spiralY + verticalOffset + (Math.sin(t * 0.004 + randomOffset) * 20)
                    };
                };
                
            case 'darklingboss1':
                return t => ({
                    x: Math.sin(t * 0.015) * (this.game.canvas.width * 0.45),
                    y: Math.sin(t * 0.005) * (this.game.canvas.height * 0.3)
                });
                
            case 'darklingboss2':
                return t => ({
                    x: Math.sin(t * 0.005) * (this.game.canvas.width * 0.45),
                    y: Math.cos(t * 0.003) * (this.game.canvas.height * 0.25)
                });
                
            case 'darklingboss3':
                return t => {
                    if (!this.lastTeleport || Date.now() - this.lastTeleport > 10000) {
                        // Teleport to random position every 10 seconds
                        this.teleportX = Math.random() * (this.game.canvas.width - 100);
                        this.lastTeleport = Date.now();
                    }
                    
                    return {
                        x: this.teleportX + Math.sin(t * 0.01) * (this.game.canvas.width * 0.3),
                        y: Math.sin(t * 0.005) * (this.game.canvas.height * 0.25)
                    };
                };
                
            default:
                // Default pattern based on enemy type
                if (['darkling2', 'darkling5', 'darkling6'].includes(type)) {
                    return t => ({ 
                        x: Math.sin(t * 0.015) * (this.game.canvas.width * 0.4), 
                        y: Math.cos(t * 0.01) * (this.game.canvas.height * 0.2) 
                    });
                } else {
                    return t => ({ 
                        x: Math.sin(t * 0.01) * (this.game.canvas.width * 0.35), 
                        y: Math.sin(t * 0.008) * (this.game.canvas.height * 0.15) 
                    });
                }
        }
    }

    /**
     * Create projectiles for an enemy based on its type
     * @param {string} type - The type of enemy
     * @param {number} x - X position of the enemy
     * @param {number} y - Y position of the enemy
     * @returns {Array} - Array of projectile objects
     */
    createProjectiles(type, x, y) {
        const projectiles = [];
        
        // Helper function to create a projectile with an angle
        const createProjectile = (angle, speed = 5, size = 1) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            
            return {
                x: x,
                y: y,
                dx: dx,
                dy: dy,
                width: 38 * size,
                height: 38 * size,
                sprite: 'shot1'
            };
        };
        
        // Don't create projectiles for certain enemy types
        if (type === 'darkling1' || type === 'darkling9') {
            return projectiles;
        }
        
        switch(type) {
            case 'darkling4':
                // Shield activation logic is handled elsewhere
                break;
                
            case 'darkling5':
            case 'darkling6':
                projectiles.push(createProjectile(45));
                projectiles.push(createProjectile(135));
                break;
                
            case 'darkling7':
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle));
                }
                if (Math.random() < 0.5) {
                    projectiles.push(createProjectile(90, 6.25));
                }
                break;
                
            case 'darkling8':
                if (Math.random() < 0.5) {
                    projectiles.push(createProjectile(90));
                    projectiles.push(createProjectile(85));
                }
                break;
                
            case 'darkling10':
                const patterns = [
                    // Pattern 1: Single straight shot
                    () => projectiles.push(createProjectile(90)),
                    
                    // Pattern 2: Diagonal shots
                    () => {
                        projectiles.push(createProjectile(45));
                        projectiles.push(createProjectile(135));
                    },
                    
                    // Pattern 3: Spread shots
                    () => {
                        for (let angle = 75; angle <= 105; angle += 15) {
                            projectiles.push(createProjectile(angle));
                        }
                    }
                ];
                
                // Choose a random pattern
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
                
            case 'darklingboss1':
                // Boss shoots a larger, faster projectile
                projectiles.push(createProjectile(90, 7.5, 1.2));
                break;
                
            case 'darklingboss2':
                // Only shoots in second phase (health <= 25)
                // Multi-directional attack
                for (let angle = 0; angle < 360; angle += 45) {
                    projectiles.push(createProjectile(angle, 6));
                }
                break;
                
            case 'darklingboss3':
                // Final boss has two attack patterns
                if (Math.random() < 0.5) {
                    // Pattern 1: Spiral attack
                    for (let angle = 0; angle < 360; angle += 30) {
                        projectiles.push(createProjectile(angle, 5));
                    }
                } else {
                    // Pattern 2: Targeted attack towards player
                    // This requires player position which will be handled in the Enemy class
                    projectiles.push(createProjectile(90, 8, 1.5));
                }
                break;
                
            default:
                // Default - simple straight shot
                projectiles.push(createProjectile(90));
        }
        
        return projectiles;
    }

    /**
     * Get enemy types available for a specific round and wave
     * @param {number} round - Current round number
     * @param {number} wave - Current wave number
     * @returns {Array} - Array of available enemy types
     */
    getEnemyTypesForWave(round, wave) {
        if (round === 1) {
            return ['darkling1', 'darkling2', 'darkling3'];
        } else if (round === 2) {
            return ['darkling2', 'darkling3', 'darkling4', 'darkling5', 'darkling6'];
        } else {
            return ['darkling3', 'darkling4', 'darkling5', 'darkling6', 'darkling7', 'darkling8', 'darkling10'];
        }
    }

    /**
     * Get the number of waves in a specific round
     * @param {number} round - Round number
     * @returns {number} - Number of waves in the round
     */
    getWavesInRound(round) {
        return round === 1 ? 5 : 
               round === 2 ? 7 : 8;
    }
}

// Export the MonsterLogic class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MonsterLogic };
}