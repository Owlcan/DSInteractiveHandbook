/**
 * Game Controller for Alchemy Blaster
 * 
 * Handles game mechanics including:
 * - Game state management
 * - Player and enemy movement
 * - Collision detection
 * - Projectile management
 * - Score tracking
 */

class GameController {
    constructor() {
        this.monsterLogic = new MonsterLogic(this);
        this.gameState = {
            isActive: false,
            isPaused: false,
            currentRound: 1,
            currentWave: 1,
            waveCompleted: false,
            enemiesRemaining: 0,
            score: 0,
            selectedCharacter: null,
            gameOver: false,
            victory: false,
            startTime: null,
            elapsedTime: 0
        };
        
        this.player = {
            position: { x: 0, y: 0 },
            health: 100,
            shield: 0,
            maxShield: 0,
            shieldRegenRate: 0.1, // Much slower regeneration (6 points per second)
            lastDamageTime: 0,
            speed: 5,
            direction: 'right',
            powerLevel: 1,
            burstMode: {
                active: false,
                cooldown: 5000,
                lastUsed: 0,
                isReady: true
            }
        };
        
        // Store canvas reference that will be set by the renderer
        this.canvas = null;
        
        // Enemy data
        this.enemies = [];
        this.projectiles = {
            player: [],
            enemy: [],
            pool: [], // Object pool for recycling projectiles
            activeCount: 0,
            maxPoolSize: 500 // Maximum size of projectile pool
        };
        
        // Projectile types and effects - will make power-ups easier to implement
        this.projectileTypes = {
            default: {
                width: 20,
                height: 20,
                speed: 10,
                damage: 1,
                color: '#ffffff'
            },
            explosive: {
                width: 30,
                height: 30,
                speed: 8,
                damage: 20,
                color: '#ff0000'
            },
            piercing: {
                width: 15,
                height: 15,
                speed: 12,
                damage: 15,
                color: '#00ff00'
            }
        };
        
        // Enemy types and their properties
        this.enemyTypes = {
            basic: {
                health: 50,
                speed: 2,
                damage: 5,
                scoreValue: 10
            },
            fast: {
                health: 30,
                speed: 4,
                damage: 8,
                scoreValue: 15
            },
            strong: {
                health: 100,
                speed: 1,
                damage: 10,
                scoreValue: 20
            }
        };
        
        // Initialize formation patterns
        this.formationPatterns = this.initializeFormationPatterns();
    }
    
    /**
     * Initialize patterns for different enemy formations
     * @returns {Object} Map of formation patterns
     */
    initializeFormationPatterns() {
        return {
            // Original formations
            'line': (enemies, spacing, startPosition) => {
                const positions = [];
                const enhancedSpacing = spacing * 1.2; // Increase spacing by 80% (was 50%)
                
                for (let i = 0; i < enemies.length; i++) {
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + i * enhancedSpacing,
                            y: startPosition.y
                        }
                    });
                }
                
                return positions;
            },
            
            'grid': (enemies, rows, cols, spacing, startPosition) => {
                const positions = [];
                const enhancedSpacingX = spacing.x * 1.2; // Increased from 1.5
                const enhancedSpacingY = spacing.y * 1.2; // Increased from 1.5
                
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const index = row * cols + col;
                        
                        if (index < enemies.length) {
                            positions.push({
                                type: enemies[index],
                                position: {
                                    x: startPosition.x + col * enhancedSpacingX,
                                    y: startPosition.y + row * enhancedSpacingY
                                }
                            });
                        }
                    }
                }
                
                return positions;
            },
            
            'v': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                const midPoint = Math.floor(totalEnemies / 2);
                
                for (let i = 0; i < totalEnemies; i++) {
                    const offset = (i < midPoint) ? -1 : 1;
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + (i * spacing) * offset,
                            y: startPosition.y + (i * spacing)
                        }
                    });
                }
                
                return positions;
            },
            
            'diamond': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                const midPoint = Math.floor(totalEnemies / 2);
                
                for (let i = 0; i < totalEnemies; i++) {
                    const offset = (i < midPoint) ? -1 : 1;
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + (i * spacing) * offset,
                            y: startPosition.y + (midPoint * spacing) - (i * spacing)
                        }
                    });
                }
                
                return positions;
            },
            
            'wall': (enemies, spacing, startPosition) => {
                const positions = [];
                
                for (let i = 0; i < enemies.length; i++) {
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x,
                            y: startPosition.y + i * spacing
                        }
                    });
                }
                
                return positions;
            },
            
            'dual-columns': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                const midPoint = Math.floor(totalEnemies / 2);
                
                for (let i = 0; i < totalEnemies; i++) {
                    const offset = (i < midPoint) ? -1 : 1;
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + (offset * spacing),
                            y: startPosition.y + (i * spacing)
                        }
                    });
                }
                
                return positions;
            },
            
            'pincer': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                const midPoint = Math.floor(totalEnemies / 2);
                
                for (let i = 0; i < totalEnemies; i++) {
                    const offset = (i < midPoint) ? -1 : 1;
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + (offset * spacing),
                            y: startPosition.y + (i * spacing)
                        }
                    });
                }
                
                return positions;
            },
            
            'moving-grid': (enemies, rows, cols, spacing, startPosition) => {
                const positions = [];
                
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const index = row * cols + col;
                        
                        if (index < enemies.length) {
                            positions.push({
                                type: enemies[index],
                                position: {
                                    x: startPosition.x + col * spacing + (Math.sin(Date.now() / 1000 + row) * 10),
                                    y: startPosition.y + row * spacing
                                }
                            });
                        }
                    }
                }
                
                return positions;
            },
            
            'custom': (customEnemies) => {
                return customEnemies.map((enemy, index) => ({
                    type: enemy.type,
                    position: enemy.position
                }));
            },
            
            // New formation types - Part 1
            'spiral': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                
                for (let i = 0; i < totalEnemies; i++) {
                    // Calculate angle and radius for spiral - increased spacing
                    const angle = i * (Math.PI * 2 / 8); // 8 points per full circle
                    const radius = 20 + (i * 10); // Increased from 30 + (i * 15)
                    
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + Math.cos(angle) * radius,
                            y: startPosition.y + Math.sin(angle) * radius
                        }
                    });
                }
                
                return positions;
            },
            
            'helix': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                
                for (let i = 0; i < totalEnemies; i++) {
                    // Calculate helix pattern - increased radius
                    const t = i / (totalEnemies - 1);
                    const angle = t * Math.PI * 4; // Two full rotations
                    const radius = 150; // Increased from 100
                    const strand = i % 2; // Alternating between two strands
                    
                    // Position offset for second strand
                    const strandOffset = strand === 0 ? 0 : Math.PI;
                    
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + Math.cos(angle + strandOffset) * radius,
                            y: startPosition.y + Math.sin(angle + strandOffset) * radius
                        }
                    });
                }
                
                return positions;
            },
            
            'orbital': (enemies, rings, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                let enemyIndex = 0;
                
                // Create concentric rings
                for (let ring = 0; ring < rings; ring++) {
                    const ringRadius = spacing.radius[ring] || (50 + ring * 50);
                    // More enemies in outer rings
                    const enemiesInRing = Math.min(Math.ceil(totalEnemies / rings) + ring, totalEnemies - enemyIndex);
                    
                    for (let i = 0; i < enemiesInRing && enemyIndex < totalEnemies; i++) {
                        const angle = (i / enemiesInRing) * Math.PI * 2;
                        
                        positions.push({
                            type: enemies[enemyIndex++],
                            position: {
                                x: startPosition.x + Math.cos(angle) * ringRadius,
                                y: startPosition.y + Math.sin(angle) * ringRadius
                            }
                        });
                    }
                }
                
                return positions;
            },
            
            'multi-formation': (formation) => {
                const positions = [];
                
                // Process each sub-formation
                for (const subFormation of formation.subFormations) {
                    // Get the pattern function for this sub-formation
                    const patternFunc = this.formationPatterns[subFormation.type];
                    
                    if (patternFunc) {
                        // Generate positions for this sub-formation
                        let subPositions;
                        
                        if (subFormation.type === 'arc') {
                            subPositions = this.formationPatterns.arc(
                                subFormation.enemies,
                                subFormation.spacing,
                                subFormation.position
                            );
                        } else {
                            subPositions = patternFunc(
                                subFormation.enemies,
                                subFormation.spacing,
                                subFormation.position
                            );
                        }
                        
                        // Add to overall positions
                        positions.push(...subPositions);
                    }
                }
                
                return positions;
            },
            
            // Add boss-with-satellites formation
            'boss-with-satellites': (formation) => {
                const positions = [];
                
                // Add boss
                positions.push({
                    type: formation.boss.type,
                    position: {
                        x: formation.boss.position.x,
                        y: formation.boss.position.y
                    },
                    isBoss: true
                });
                
                // Add minions with orbital data
                for (const minionGroup of formation.minions) {
                    for (let i = 0; i < minionGroup.count; i++) {
                        const angle = (i / minionGroup.count) * Math.PI * 2;
                        
                        positions.push({
                            type: minionGroup.type,
                            position: {
                                x: formation.boss.position.x + Math.cos(angle) * minionGroup.orbit.radius,
                                y: formation.boss.position.y + Math.sin(angle) * minionGroup.orbit.radius
                            },
                            orbit: {
                                center: { ...formation.boss.position },
                                radius: minionGroup.orbit.radius,
                                speed: minionGroup.orbit.speed,
                                angle: angle // Initial angle
                            }
                        });
                    }
                }
                
                return positions;
            },
            
            // Add arc formation
            'arc': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                
                // Convert arc angle to radians
                const arcAngle = (spacing.arc || 180) * (Math.PI / 180);
                const radius = spacing.radius || 100;
                
                for (let i = 0; i < totalEnemies; i++) {
                    // Calculate angle within the arc
                    const angle = -arcAngle/2 + (i / (totalEnemies - 1)) * arcAngle;
                    
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + Math.cos(angle) * radius,
                            y: startPosition.y + Math.sin(angle) * radius
                        }
                    });
                }
                
                return positions;
            },
            
            // Add pentagram formation
            'pentagram': (enemies, spacing, startPosition) => {
                const positions = [];
                const totalEnemies = enemies.length;
                const pointCount = 5; // Pentagram has 5 points
                const outerRadius = spacing.outer * 1.3; // Increased outer radius by 30%
                const innerRadius = spacing.inner * 1.3; // Increased inner radius by 30%
                
                for (let i = 0; i < totalEnemies; i++) {
                    // Determine if this is an inner or outer point
                    const isOuter = i % 2 === 0;
                    const radius = isOuter ? outerRadius : innerRadius;
                    
                    // Calculate position around pentagram
                    const angle = ((i % pointCount) / pointCount) * Math.PI * 2 + Math.PI / 2; // Starting from top
                    positions.push({
                        type: enemies[i],
                        position: {
                            x: startPosition.x + Math.cos(angle) * radius,
                            y: startPosition.y + Math.sin(angle) * radius
                        }
                    });
                }
                
                return positions;
            },
            
            // Add serpentine formation
            'serpentine': (formation) => {
                const positions = [];
                const totalEnemies = formation.enemies.length;
                const rows = formation.rows || 1;
                const enemiesPerRow = Math.ceil(totalEnemies / rows);
                
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < enemiesPerRow; col++) {
                        const index = row * enemiesPerRow + col;
                        if (index >= totalEnemies) continue;
                        
                        // Create a wavy pattern
                        const waveOffset = Math.sin(col * formation.waveFactor.frequency) * formation.waveFactor.amplitude;
                        
                        positions.push({
                            type: formation.enemies[index],
                            position: {
                                x: formation.startPosition.x + col * formation.spacing.x,
                                y: formation.startPosition.y + row * formation.spacing.y + waveOffset
                            },
                            waveFactor: { ...formation.waveFactor, initialPhase: col * formation.waveFactor.frequency }
                        });
                    }
                }
                
                return positions;
            },
            
            // Add nested-circles formation
            'nested-circles': (formation) => {
                const positions = [];
                
                // Process each ring
                for (const ring of formation.rings) {
                    const totalEnemies = ring.enemies.length;
                    
                    for (let i = 0; i < totalEnemies; i++) {
                        const angle = (i / totalEnemies) * Math.PI * 2;
                        
                        positions.push({
                            type: ring.enemies[i],
                            position: {
                                x: formation.startPosition.x + Math.cos(angle) * ring.radius,
                                y: formation.startPosition.y + Math.sin(angle) * ring.radius
                            },
                            orbit: {
                                center: { ...formation.startPosition },
                                radius: ring.radius,
                                speed: ring.rotationSpeed,
                                angle: angle // Initial angle
                            }
                        });
                    }
                }
                
                return positions;
            },
            
            // Add growing-spiral formation
            'growing-spiral': (formation) => {
                const positions = [];
                const totalEnemies = formation.enemies.length;
                
                for (let i = 0; i < totalEnemies; i++) {
                    // Calculate spiral parameters
                    const angle = i * (formation.spacing.angle * (Math.PI / 180));
                    const radius = formation.spacing.radiusStep * i;
                    
                    positions.push({
                        type: formation.enemies[i],
                        position: {
                            x: formation.startPosition.x + Math.cos(angle) * radius,
                            y: formation.startPosition.y + Math.sin(angle) * radius
                        },
                        spiralParams: {
                            initialAngle: angle,
                            initialRadius: radius,
                            growFactor: formation.growFactor
                        }
                    });
                }
                
                return positions;
            },
            
            // Add staggered-assault formation
            'staggered-assault': (formation) => {
                const positions = [];
                
                // Process each wave in the staggered assault
                for (const wave of formation.waves) {
                    // Get the pattern function for this wave's formation
                    const patternFunc = this.formationPatterns[wave.formation];
                    
                    if (patternFunc) {
                        let wavePositions;
                        
                        if (wave.formation === 'arc') {
                            wavePositions = this.formationPatterns.arc(
                                wave.enemies,
                                wave.spacing,
                                wave.startPosition
                            );
                        } else if (wave.formation === 'line') {
                            wavePositions = this.formationPatterns.line(
                                wave.enemies,
                                wave.spacing,
                                wave.startPosition
                            );
                        } else {
                            wavePositions = patternFunc(
                                wave.enemies,
                                wave.spacing,
                                wave.startPosition
                            );
                        }
                        
                        // Add delay info to each enemy in this wave
                        wavePositions.forEach(pos => {
                            pos.spawnDelay = wave.delay || 0;
                        });
                        
                        // Add to overall positions
                        positions.push(...wavePositions);
                    }
                }
                
                return positions;
            },
            
            'boss-complex': (formation) => {
                const positions = [];
                
                // Add boss
                positions.push({
                    type: formation.boss.type,
                    position: { ...formation.boss.position },
                    isBoss: true
                });
                
                // Add barrier formation
                if (formation.barrier) {
                    const barrierFormation = formation.barrier.formation;
                    
                    if (barrierFormation === 'arc') {
                        const barrierPositions = this.formationPatterns.arc(
                            formation.barrier.enemies,
                            formation.barrier.spacing,
                            formation.barrier.position
                        );
                        
                        // Mark as part of the barrier
                        barrierPositions.forEach(pos => {
                            pos.isBarrier = true;
                        });
                        
                        positions.push(...barrierPositions);
                    }
                }
                
                // Add attackers
                if (formation.attackers) {
                    for (const attacker of formation.attackers) {
                        if (attacker.formation === 'dual-orbit') {
                            // Create orbiting attackers
                            const count = attacker.enemies.length;
                            
                            for (let i = 0; i < count; i++) {
                                const angle = attacker.orbit.offset + (i / count) * Math.PI * 2;
                                
                                positions.push({
                                    type: attacker.enemies[i],
                                    position: {
                                        x: formation.boss.position.x + Math.cos(angle) * attacker.orbit.radius,
                                        y: formation.boss.position.y + Math.sin(angle) * attacker.orbit.radius
                                    },
                                    orbit: {
                                        center: { ...formation.boss.position },
                                        radius: attacker.orbit.radius,
                                        speed: attacker.orbit.speed,
                                        angle: angle // Initial angle
                                    }
                                });
                            }
                        }
                    }
                }
                
                return positions;
            },
            
            // Add fractal formation
            'fractal': (formation) => {
                const positions = [];
                
                // Add seed enemies
                const seedCount = formation.seed.enemies.length;
                for (let i = 0; i < seedCount; i++) {
                    positions.push({
                        type: formation.seed.enemies[i],
                        position: { ...formation.seed.positions[i] }
                    });
                    
                    // Add child enemies around each seed with increased spacing
                    if (formation.children && formation.children.enemies) {
                        const childCount = Math.min(
                            formation.children.enemies.length,
                            formation.children.offset.x.length,
                            formation.children.offset.y.length
                        );
                        
                        for (let j = 0; j < childCount; j++) {
                            positions.push({
                                type: formation.children.enemies[j],
                                position: {
                                    // Increase offset by 25%
                                    x: formation.seed.positions[i].x + formation.children.offset.x[j] * 1.25,
                                    y: formation.seed.positions[i].y + formation.children.offset.y[j] * 1.25
                                },
                                belongsToSeed: i // Mark which seed this belongs to
                            });
                        }
                    }
                }
                
                return positions;
            },
            
            // Add interlocking-rings formation
            'interlocking-rings': (formation) => {
                const positions = [];
                
                // Process each ring
                for (const ring of formation.rings) {
                    const enemyCount = ring.enemies.length;
                    
                    for (let i = 0; i < enemyCount; i++) {
                        const angle = (i / enemyCount) * Math.PI * 2;
                        
                        positions.push({
                            type: ring.enemies[i],
                            position: {
                                x: ring.center.x + Math.cos(angle) * ring.radius,
                                y: ring.center.y + Math.sin(angle) * ring.radius
                            },
                            orbit: {
                                center: { ...ring.center },
                                radius: ring.radius,
                                speed: ring.rotationSpeed,
                                angle: angle // Initial angle
                            }
                        });
                    }
                }
                
                return positions;
            },
            
            // Add fortress formation
            'fortress': (formation) => {
                const positions = [];
                
                // Add core positions
                if (formation.core && formation.core.enemies) {
                    for (let i = 0; i < formation.core.enemies.length; i++) {
                        positions.push({
                            type: formation.core.enemies[i],
                            position: { ...formation.core.positions[i] }
                        });
                    }
                }
                
                // Add turrets
                if (formation.turrets) {
                    for (const turret of formation.turrets) {
                        positions.push({
                            type: turret.type,
                            position: { ...turret.position },
                            isTurret: true
                        });
                    }
                }
                
                // Add defenders with patrol paths
                if (formation.defenders && formation.defenders.formation === 'patrol') {
                    const defenderCount = formation.defenders.enemies.length;
                    const pathCount = formation.defenders.paths.length;
                    
                    for (let i = 0; i < defenderCount; i++) {
                        const pathIndex = i % pathCount;
                        const path = formation.defenders.paths[pathIndex];
                        
                        positions.push({
                            type: formation.defenders.enemies[i],
                            position: { ...path.points[0] }, // Start at first point
                            patrol: {
                                path: path.points,
                                currentPoint: 0,
                                progress: 0,
                                speed: path.speed || 0.01,
                                direction: 1 // Forward direction
                            }
                        });
                    }
                }
                
                return positions;
            },
            
            // Add nebula formation
            'nebula': (formation) => {
                const positions = [];
                
                for (const cluster of formation.clusters) {
                    const center = cluster.center;
                    const count = cluster.enemies.length;
                    
                    // Create a nebulous cloud of enemies
                    for (let i = 0; i < count; i++) {
                        // Calculate random position within the cluster radius
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * cluster.radius * cluster.density;
                        
                        positions.push({
                            type: cluster.enemies[i],
                            position: {
                                x: center.x + Math.cos(angle) * distance,
                                y: center.y + Math.sin(angle) * distance
                            },
                            nebula: {
                                center: { ...center },
                                initialDistance: distance,
                                initialAngle: angle,
                                pulseRate: formation.pulseRate
                            }
                        });
                    }
                }
                
                return positions;
            },
            
            // Add crucible formation
            'crucible': (formation) => {
                const positions = [];
                
                // Start with the first phase
                const firstPhase = formation.phases[0];
                
                if (firstPhase.formation === 'pentagon') {
                    // Create a pentagon formation
                    const pointCount = 5;
                    const enemyCount = firstPhase.enemies.length;
                    const enemiesPerPoint = Math.ceil(enemyCount / pointCount);
                    
                    for (let i = 0; i < enemyCount; i++) {
                        const pointIndex = Math.floor(i / enemiesPerPoint);
                        const angle = (pointIndex / pointCount) * Math.PI * 2;
                        
                        positions.push({
                            type: firstPhase.enemies[i],
                            position: {
                                x: firstPhase.position.x + Math.cos(angle) * firstPhase.radius,
                                y: firstPhase.position.y + Math.sin(angle) * firstPhase.radius
                            },
                            phaseIndex: 0,
                            phases: formation.phases,
                            phaseChangeTime: Date.now() + firstPhase.duration
                        });
                    }
                } else if (firstPhase.formation === 'star') {
                    // Create a star formation (alternating inner/outer points)
                    const pointCount = 5;
                    const enemyCount = firstPhase.enemies.length;
                    
                    for (let i = 0; i < enemyCount; i++) {
                        const isOuter = i % 2 === 0;
                        const radius = isOuter ? firstPhase.radius.outer : firstPhase.radius.inner;
                        const angle = ((i % pointCount) / pointCount) * Math.PI * 2;
                        
                        positions.push({
                            type: firstPhase.enemies[i],
                            position: {
                                x: firstPhase.position.x + Math.cos(angle) * radius,
                                y: firstPhase.position.y + Math.sin(angle) * radius
                            },
                            phaseIndex: 0,
                            phases: formation.phases,
                            phaseChangeTime: Date.now() + firstPhase.duration
                        });
                    }
                } else if (firstPhase.formation === 'circle') {
                    // Create a circle formation
                    const enemyCount = firstPhase.enemies.length;
                    
                    for (let i = 0; i < enemyCount; i++) {
                        const angle = (i / enemyCount) * Math.PI * 2;
                        
                        positions.push({
                            type: firstPhase.enemies[i],
                            position: {
                                x: firstPhase.position.x + Math.cos(angle) * firstPhase.radius,
                                y: firstPhase.position.y + Math.sin(angle) * firstPhase.radius
                            },
                            phaseIndex: 0,
                            phases: formation.phases,
                            phaseChangeTime: Date.now() + firstPhase.duration
                        });
                    }
                }
                
                return positions;
            },
            
            // Add dual-vortex formation
            'dual-vortex': (formation) => {
                const positions = [];
                
                // Process each vortex
                if (formation.vortices) {
                    for (const vortex of formation.vortices) {
                        const enemyCount = vortex.enemies.length;
                        
                        // Create spiral effect in each vortex
                        for (let i = 0; i < enemyCount; i++) {
                            const progress = i / (enemyCount - 1); // 0 to 1
                            const radius = vortex.radius.start + progress * (vortex.radius.end - vortex.radius.start);
                            const angle = progress * vortex.spiral.turns * Math.PI * 2 * vortex.spiral.direction;
                            
                            positions.push({
                                type: vortex.enemies[i],
                                position: {
                                    x: vortex.center.x + Math.cos(angle) * radius,
                                    y: vortex.center.y + Math.sin(angle) * radius
                                },
                                vortex: {
                                    center: { ...vortex.center },
                                    initialRadius: radius,
                                    initialAngle: angle,
                                    direction: vortex.spiral.direction
                                }
                            });
                        }
                    }
                }
                
                // Add connector enemies
                if (formation.connectors && formation.vortices && formation.vortices.length >= 2) {
                    const spacing = formation.connectors.spacing;
                    const vortex1 = formation.vortices[0].center;
                    const vortex2 = formation.vortices[1].center;
                    
                    // Calculate direction vector between vortices
                    const dx = vortex2.x - vortex1.x;
                    const dy = vortex2.y - vortex1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const unitX = dx / distance;
                    const unitY = dy / distance;
                    
                    // Position connectors between vortices
                    const connectorCount = formation.connectors.enemies.length;
                    const step = distance / (connectorCount + 1);
                    
                    for (let i = 0; i < connectorCount; i++) {
                        const t = (i + 1) / (connectorCount + 1);
                        
                        positions.push({
                            type: formation.connectors.enemies[i],
                            position: {
                                x: vortex1.x + dx * t + spacing.x * (i % 2 === 0 ? 1 : -1),
                                y: vortex1.y + dy * t + spacing.y * (i % 2 === 0 ? 1 : -1)
                            },
                            isConnector: true
                        });
                    }
                }
                
                return positions;
            },
            
            // Add final-bastion formation
            'final-bastion': (formation) => {
                const positions = [];
                
                // Add the boss
                if (formation.boss) {
                    positions.push({
                        type: formation.boss.type,
                        position: { ...formation.boss.position },
                        isBoss: true
                    });
                }
                
                // Add guardian enemies that flank the boss
                if (formation.guardians && formation.guardians.length > 0) {
                    for (const guardian of formation.guardians) {
                        positions.push({
                            type: guardian.type,
                            position: { ...guardian.position }
                        });
                    }
                }
                
                // Add phase enemies if present
                if (formation.phases && formation.phases.length > 0) {
                    const firstPhase = formation.phases[0];
                    if (firstPhase.enemies && firstPhase.positions) {
                        for (let i = 0; i < Math.min(firstPhase.enemies.length, firstPhase.positions.length); i++) {
                            positions.push({
                                type: firstPhase.enemies[i],
                                position: { ...firstPhase.positions[i] },
                                phaseIndex: 0,
                                belongsToPhase: true
                            });
                        }
                    }
                }
                
                return positions;
            }
        };
    }
    
    /**
     * Start a new game with the selected character
     * @param {string} character - Selected character ('dere', 'aliza', or 'shinshi')
     */
    startGame(character) {
        // Reset game state
        this.gameState = {
            isActive: true,
            isPaused: false,
            currentRound: 1,
            currentWave: 1,
            waveCompleted: false,
            enemiesRemaining: 0,
            score: 0,
            selectedCharacter: character,
            gameOver: false,
            victory: false,
            startTime: Date.now(),
            elapsedTime: 0,
            debug: false  // Set to true to enable debug info display
        };
        
        // Initialize player based on character selection
        this.initializePlayer(character);
        
        // Reset game elements
        this.enemies = [];
        this.projectiles.player = [];
        this.projectiles.enemy = [];
        this.powerups = [];
        this.formationOffset = { x: 0, y: 0 };
        
        // Store selected character in the audio manager but DON'T play the start sound
        // The start sound is already played from game_module.js
        if (window.audioManager) {
            // Just update the internal state without playing the sound
            window.audioManager.selectedCharacter = character;
        }
        
        // Spawn the first wave
        this.spawnWave();
    }
    
    /**
     * Initialize player with character-specific stats
     * @param {string} character - Selected character ('dere', 'aliza', or 'shinshi')
     */
    initializePlayer(character) {
        // Reset base player properties
        this.player = {
            position: { x: 0, y: 0 },
            speed: 5,
            direction: 'right',
            lastFireTime: 0,
            lastDamageTime: 0,
            powerLevel: 1
        };
        
        // Apply character-specific stats
        if (character === 'dere') {
            // Dere: Balanced character with standard health
            this.player.health = 3;
            this.player.maxHealth = 3;
            this.player.shield = 0;
            this.player.maxShield = 100;
            this.player.shieldRegenRate = 0;
            this.player.fireRate = 300; // Milliseconds between shots
            this.player.specialCooldown = 5000; // 5 seconds cooldown for special attack
            this.player.burstMode = {
                active: false,
                cooldown: 5000,
                lastUsed: 0,
                isReady: true
            };
        } else if (character === 'aliza') {
            // Aliza: Technical character with shield instead of health
            this.player.health = 1;
            this.player.maxHealth = 1;
            this.player.shield = 100;
            this.player.maxShield = 100;
            this.player.shieldRegenRate = 0.5; // Shield regenerates over time
            this.player.fireRate = 200; // Faster fire rate
            this.player.specialCooldown = 3000; // 3 seconds cooldown for special attack
            this.player.burstMode = {
                active: false,
                cooldown: 3000,
                lastUsed: 0,
                isReady: true
            };
        } else if (character === 'shinshi') {
            // Shinshi: Beam-focused character with more health but slightly slower movement
            this.player.health = 4;
            this.player.maxHealth = 4;
            this.player.shield = 0;
            this.player.maxShield = 0; // No shield
            this.player.shieldRegenRate = 0;
            this.player.speed = 4; // Increased speed by 30% (from original 3)
            this.player.fireRate = 50; // Very fast fire rate for continuous beam
            this.player.specialCooldown = 8000; // 8 seconds cooldown for special attack (powerful)
            this.player.isBeamActive = false; // Whether beam is currently firing
            this.player.burstMode = {
                active: false,
                cooldown: 8000,
                lastUsed: 0,
                isReady: true
            };
        }
    }
    
    /**
     * Pause or unpause the game
     * @param {boolean} isPaused - Whether the game should be paused
     */
    pauseGame(isPaused) {
        this.gameState.isPaused = isPaused;
        
        // Direct music handling for pause state
        if (isPaused) {
            // Pause the music when game is paused
            if (window.bgmPlayer) {
                window.bgmPlayer.pause();
            }
        } else {
            // Resume music when unpaused
            if (window.bgmPlayer) {
                window.bgmPlayer.play().catch(e => console.error("Couldn't resume music:", e));
            }
        }
    }
    
    /**
     * Move the player in the specified direction
     * @param {string} direction - Direction to move ('left' or 'right')
     * @param {boolean} isHeld - Whether the key is being held down
     */
    movePlayer(direction, isHeld) {
        // Set the visual direction for the player sprite
        this.player.direction = direction;
        
        // Calculate the movement amount based on player speed
        const movement = this.player.speed * (isHeld ? 1 : 0.5);
        
        // Move the player
        if (direction === 'left') {
            this.player.position.x = Math.max(-300, this.player.position.x - movement);
        } else if (direction === 'right') {
            this.player.position.x = Math.min(300, this.player.position.x + movement);
        }
    }
    
    /**
     * Fire a projectile from the player
     * @param {boolean} isSpecial - Whether this is a special attack
     */
    firePlayerProjectile(isSpecial) {
        const character = this.gameState.selectedCharacter;
        
        if (isSpecial && !this.player.burstMode.isReady) {
            // Special attack is on cooldown
            return;
        }
        
        // Character-specific projectile behavior
        if (character === 'dere') {
            // Dere: Power level determines number of projectiles
            if (isSpecial && this.player.burstMode.isReady) {
                // Special attack: Screen-clearing flash
                this.player.burstMode.active = true;
                this.player.burstMode.lastUsed = Date.now();
                this.player.burstMode.isReady = false;
                
                // Use PlayerLogic to create special attack with proper animation and sound
                if (!this.playerLogic) {
                    this.playerLogic = new PlayerLogic();
                }
                
                // Create special attack and play sound
                this.playerLogic.createSpecialAttack(character, this.gameState, this.audioManager);
                
                // Create flash effect that damages all enemies on screen
                this.createScreenClearingFlash();
            } else {
                // Regular attack: Shot count based on power level
                const powerConfig = this.monsterLogic.characterMechanics.dere.firing.powerLevels[this.player.powerLevel] || 
                                    this.monsterLogic.characterMechanics.dere.firing.powerLevels[1];
                                    
                // Create projectiles
                for (let i = 0; i < powerConfig.projectiles; i++) {
                    // Calculate offset based on number of projectiles
                    let offset = 0;
                    if (powerConfig.projectiles === 2) {
                        offset = i === 0 ? -15 : 15;
                    } else if (powerConfig.projectiles === 3) {
                        offset = i === 0 ? -20 : (i === 1 ? 0 : 20);
                    } else if (powerConfig.projectiles === 4) {
                        offset = i === 0 ? -30 : (i === 1 ? -10 : (i === 2 ? 10 : 30));
                    }
                    
                    // Use Dere's specific shot sprite based on power level
                    const shotSprite = `dereshot${Math.min(this.player.powerLevel, 3)}`;
                    
                    // Use ProjectileManager instead of directly manipulating the projectiles array
                    if (this.projectileManager) {
                        this.projectileManager.createPlayerProjectile(
                            this.player.position.x + offset,
                            this.player.position.y - 20,
                            0,
                            -20,
                            {
                                damage: powerConfig.damage,
                                sprite: shotSprite
                            }
                        );
                    } else {
                        // Fallback to direct array manipulation if ProjectileManager isn't available
                        this.projectiles.player.push({
                            x: this.player.position.x + offset,
                            y: this.player.position.y - 20,
                            vx: 0,
                            vy: -20,
                            damage: powerConfig.damage,
                            sprite: shotSprite
                        });
                    }
                }
                
                // Play the shared spellfire sound (cycles between variants)
                if (window.audioManager) {
                    window.audioManager.playSpellfireSound();
                } else if (this.audioManager) {
                    this.audioManager.playSfx('playerShot');
                }
            }
        } else if (character === 'aliza') {
            // Aliza: Technical shots with special patterns
            if (isSpecial && this.player.burstMode.isReady) {
                // Special attack: Rapid homing shots
                this.player.burstMode.active = true;
                this.player.burstMode.lastUsed = Date.now();
                this.player.burstMode.isReady = false;
                
                // Create burst of homing projectiles
                const burstCount = 12; // Number of homing projectiles in burst
                const angleStep = (Math.PI * 2) / burstCount;
                
                for (let i = 0; i < burstCount; i++) {
                    const angle = i * angleStep;
                    const speed = 5 + Math.random() * 3; // Random speed between 5-8
                    
                    // Calculate initial velocity based on angle
                    const vx = Math.cos(angle) * speed;
                    const vy = Math.sin(angle) * speed;
                    
                    // Create homing projectile directly to avoid issues
                    const proj = {
                        x: this.player.position.x,
                        y: this.player.position.y - 20,
                        vx: vx,
                        vy: vy,
                        damage: 5,
                        sprite: 'alizashot3',
                        isSpecialAttack: true,
                        isHoming: true,
                        homingStrength: 0.3,
                        homingDelay: i * 200, // Stagger homing activation
                        initialDelay: i * 100, // Stagger initial launch
                        impactSprite: 'alizashotimpact2',
                        width: 25,
                        height: 25
                    };
                    
                    if (!this.projectiles.player) {
                        this.projectiles.player = [];
                    }
                    this.projectiles.player.push(proj);
                }
                
                // Play special attack sound
                if (window.audioManager) {
                    window.audioManager.playSfx('alizaspecialattack');
                } else if (this.audioManager) {
                    this.audioManager.playSfx('alizaspecialattack');
                }
            } else {
                // Regular attack based on power level
                const powerLevel = this.player.powerLevel;
                
                // Define shot sprite based on power level
                const shotSprite = `alizashot${powerLevel}`;
                const damage = Math.min(powerLevel, 3);
                const speed = 8 + powerLevel;
                
                switch (powerLevel) {
                    case 1:
                        // Single shot
                        if (!this.projectiles.player) {
                            this.projectiles.player = [];
                        }
                        
                        this.projectiles.player.push({
                            x: this.player.position.x,
                            y: this.player.position.y - 20,
                            vx: 0,
                            vy: -speed,
                            damage: damage,
                            sprite: shotSprite
                        });
                        break;
                        
                    case 2:
                        // Double shot
                        if (!this.projectiles.player) {
                            this.projectiles.player = [];
                        }
                        
                        this.projectiles.player.push({
                            x: this.player.position.x - 8,
                            y: this.player.position.y - 20,
                            vx: 0,
                            vy: -speed,
                            damage: damage,
                            sprite: shotSprite
                        });
                        
                        this.projectiles.player.push({
                            x: this.player.position.x + 8,
                            y: this.player.position.y - 20,
                            vx: 0,
                            vy: -speed,
                            damage: damage,
                            sprite: shotSprite
                        });
                        break;
                        
                    case 3:
                    default:
                        // Triple shot with angled side shots
                        if (!this.projectiles.player) {
                            this.projectiles.player = [];
                        }
                        
                        // Center shot
                        this.projectiles.player.push({
                            x: this.player.position.x,
                            y: this.player.position.y - 20,
                            vx: 0,
                            vy: -speed,
                            damage: damage,
                            sprite: shotSprite
                        });
                        
                        // Side shots (angled)
                        this.projectiles.player.push({
                            x: this.player.position.x - 12,
                            y: this.player.position.y - 15,
                            vx: -2,
                            vy: -speed + 1, // Slightly slower vertical speed
                            damage: damage - 1,
                            sprite: shotSprite
                        });
                        
                        this.projectiles.player.push({
                            x: this.player.position.x + 12,
                            y: this.player.position.y - 15,
                            vx: 2,
                            vy: -speed + 1, // Slightly slower vertical speed
                            damage: damage - 1,
                            sprite: shotSprite
                        });
                        break;
                }
                
                // Play the shared spellfire sound (cycles between variants) - same as Dere
                if (window.audioManager) {
                    window.audioManager.playSpellfireSound();
                } else if (this.audioManager) {
                    this.audioManager.playSfx('playerShot');
                }
            }
        } else if (character === 'shinshi') {
            // Shinshi: Beam attack
            if (isSpecial && this.player.burstMode.isReady) {
                // Special attack: Five vertical beams across screen
                this.player.burstMode.active = true;
                this.player.burstMode.lastUsed = Date.now();
                this.player.burstMode.isReady = false;
                
                // Create vertical beam special attack
                this.createShinshiSpecialAttack();
                
                // Play special attack sound
                if (window.audioManager) {
                    window.audioManager.playSfx('shinnypewpewpew');
                } else if (this.audioManager) {
                    this.audioManager.playSfx('shinnypewpewpew');
                }
            } else {
                const now = Date.now();
                
                // Start beam or continue beam
                if (!this.player.isBeamActive) {
                    this.player.isBeamActive = true;
                    this.player.beamLevel = this.player.powerLevel;
                    
                    // Play beam start sound
                    if (window.audioManager) {
                        window.audioManager.playSfx('shinnyattack1');
                    } else if (this.audioManager) {
                        this.audioManager.playSfx('shinnyattack1');
                    }
                }
                
                // Create or update beam attack
                this.createShinshiBeamAttack(this.player.beamLevel);
            }
        }
    }
    
    /**
     * Creates Shinshi's beam attack
     * @param {number} level - Beam level (1-3)
     */
    createShinshiBeamAttack(level) {
        // Clear any existing beam effects
        this.projectiles.beams = this.projectiles.beams || [];
        
        // Use player's current power level instead of a separate beam level
        const beamLevel = Math.min(this.player.powerLevel, 3);
        
        // Beam properties based on level
        const beamWidth = beamLevel === 1 ? 15 : beamLevel === 2 ? 30 : 45;
        const damage = beamLevel === 3 ? 2 : 1;
        
        // Create beam effect from player to top of screen
        this.projectiles.beams.push({
            x: this.player.position.x,
            y: this.player.position.y - 10,
            width: beamWidth,
            height: this.player.position.y + 1000, // Extend beam to ensure it reaches top of screen
            damage: damage,
            level: beamLevel,
            createdAt: Date.now()
        });
        
        // Play Shinshi's attack sound, alternating between zap1 and zap2
        if (this.audioManager && !this.player.lastBeamSound) {
            const soundToPlay = Math.random() < 0.5 ? 'shinnyzap1' : 'shinnyzap2';
            this.audioManager.playSfx(soundToPlay);
            this.player.lastBeamSound = Date.now();
        } else if (this.audioManager && Date.now() - this.player.lastBeamSound > 1200) {
            // Only play a new sound after a short delay
            const soundToPlay = Math.random() < 0.8 ? 'shinnyzap1' : 'shinnyzap2';
            this.audioManager.playSfx(soundToPlay);
            this.player.lastBeamSound = Date.now();
        }
    }

    /**
     * Creates Shinshi's special attack with vertical beams
     */
    createShinshiSpecialAttack() {
        this.projectiles.specialBeams = this.projectiles.specialBeams || [];
        
        // Default dimensions if canvas is not available
        const screenWidth = this.canvas ? this.canvas.width : 800;
        const screenHeight = this.canvas ? this.canvas.height : 600;
        
        // Create 5 vertical beams that span the entire screen
        for (let i = 0; i < 5; i++) {
            // Calculate beam position to center across the screen
            // Divide screen into 5 equal sections, put beam in center of each section
            const xPos = (i * (screenWidth / 5)) + (screenWidth / 10);
            
            this.projectiles.specialBeams.push({
                x: xPos - (screenWidth / 2), // Convert to game coordinates (centered at 0,0)
                y: 0,
                width: 60, // Beam width
                height: screenHeight * 2, // Ensure beam covers entire screen
                damage: 15,
                isVertical: true, // Mark as vertical beam
                createdAt: Date.now(),
                duration: 200 // Set duration to 200ms
            });
        }
        
        // Play special attack sound
        if (this.audioManager) {
            this.audioManager.playSfx('shinnypewpewpew');
        }
    }
    
    /**
     * Create a screen-clearing flash attack that damages all enemies
     * Dere's special ability
     */
    createScreenClearingFlash() {
        // Get damage from character mechanics
        const flashDamage = this.monsterLogic.characterMechanics.dere.firing.special.damage || 30;
        
        // Apply damage to all enemies on screen with visual effect
        for (const enemy of this.enemies) {
            enemy.health -= flashDamage;
            
            // Visual effect (to be rendered)
            if (!this.effects) this.effects = [];
            
            this.effects.push({
                type: 'flash',
                position: { x: enemy.position.x, y: enemy.position.y },
                duration: 500,
                startTime: Date.now()
            });
        }
        
        // Add screen-wide flash effect
        if (!this.effects) this.effects = [];
        
        this.effects.push({
            type: 'screenFlash',
            duration: 500,
            startTime: Date.now()
        });
        
        // Add special attack state for the renderer to use
        this.specialAttack = {
            type: 'dereSpecial',
            startTime: Date.now(),
            duration: 1000,
            intensity: 0.7 // Flash intensity (0.0 to 1.0)
        };
    }
    
    /**
     * Stops Shinshi's beam attack when the fire button is released
     */
    stopPlayerBeam() {
        // Only applicable for Shinshi
        if (this.gameState.selectedCharacter === 'shinshi' && this.player) {
            this.player.isBeamActive = false;
            // Clear any active beams
            if (this.projectiles.beams) {
                this.projectiles.beams = [];
            }
        }
    }

    /**
     * Spawn a new wave of enemies based on the current round and wave
     */
    spawnWave() {
        // Clear any remaining enemies, projectiles, and powerups
        this.enemies = [];
        this.projectiles.enemy = [];
        this.powerups = [];
        
        const formation = this.monsterLogic.getWaveFormation(
            this.gameState.currentRound, 
            this.gameState.currentWave
        );
        
        if (!formation) {
            console.error('Invalid formation for current round/wave');
            return;
        }
        
        // Check if this is a boss wave and determine which boss number (1, 2, or 3)
        const isBossWave = this.monsterLogic.isBossWave(
            this.gameState.currentRound, 
            this.gameState.currentWave
        );
        
        console.log(`Spawning wave ${this.gameState.currentWave} for round ${this.gameState.currentRound}, isBoss: ${isBossWave}`);
        
        // Use the singleton audio system to play music based on the current round and wave
        if (window.audioManager) {
            if (isBossWave) {
                // Play boss music based on round number
                window.audioManager.playBossMusic(this.gameState.currentRound);
            } else {
                // Play round-specific music
                window.audioManager.playRoundMusic(this.gameState.currentRound, false);
            }
        } else if (window.updateGameMusic) {
            // Fallback to global function if available
            window.updateGameMusic(this.gameState.currentRound, isBossWave);
        }
        
        let enemyPositions = [];
        
        console.log(`Spawning wave formation: ${formation.formation} for round ${this.gameState.currentRound}, wave ${this.gameState.currentWave}`);
        
        // Process formation based on its type
        switch (formation.formation) {
            // Original formations
            case 'grid':
                enemyPositions = this.formationPatterns.grid(
                    formation.enemies,
                    formation.rows,
                    formation.cols,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'line':
                enemyPositions = this.formationPatterns.line(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'v':
                enemyPositions = this.formationPatterns.v(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'diamond':
                enemyPositions = this.formationPatterns.diamond(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'wall':
                enemyPositions = this.formationPatterns.wall(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'dual-columns':
                enemyPositions = this.formationPatterns['dual-columns'](
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'pincer':
                enemyPositions = this.formationPatterns.pincer(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'moving-grid':
                enemyPositions = this.formationPatterns['moving-grid'](
                    formation.enemies,
                    formation.rows,
                    formation.cols,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'custom':
                enemyPositions = this.formationPatterns.custom(formation.enemies);
                break;
                
            // New formation types
            case 'spiral':
                enemyPositions = this.formationPatterns.spiral(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'helix':
                enemyPositions = this.formationPatterns.helix(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'orbital':
                enemyPositions = this.formationPatterns.orbital(
                    formation.enemies,
                    formation.rings,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'multi-formation':
                enemyPositions = this.formationPatterns['multi-formation'](formation);
                break;
                
            case 'boss-with-satellites':
                enemyPositions = this.formationPatterns['boss-with-satellites'](formation);
                break;
                
            case 'arc':
                enemyPositions = this.formationPatterns.arc(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'pentagram':
                enemyPositions = this.formationPatterns.pentagram(
                    formation.enemies,
                    formation.spacing,
                    formation.startPosition
                );
                break;
                
            case 'nested-circles':
                enemyPositions = this.formationPatterns['nested-circles'](formation);
                break;
                
            case 'serpentine':
                enemyPositions = this.formationPatterns.serpentine(formation);
                break;
                
            case 'quantum':
                enemyPositions = this.formationPatterns.quantum(formation);
                break;
                
            case 'staggered-assault':
                enemyPositions = this.formationPatterns['staggered-assault'](formation);
                break;
                
            case 'growing-spiral':
                enemyPositions = this.formationPatterns['growing-spiral'](formation);
                break;
                
            case 'fractal':
                enemyPositions = this.formationPatterns.fractal(formation);
                break;
                
            case 'interlocking-rings':
                enemyPositions = this.formationPatterns['interlocking-rings'](formation);
                break;
                
            case 'fortress':
                enemyPositions = this.formationPatterns.fortress(formation);
                break;
                
            case 'nebula':
                enemyPositions = this.formationPatterns.nebula(formation);
                break;
                
            case 'crucible':
                enemyPositions = this.formationPatterns.crucible(formation);
                break;
                
            case 'dual-vortex':
                enemyPositions = this.formationPatterns['dual-vortex'](formation);
                break;
                
            case 'final-bastion':
                enemyPositions = this.formationPatterns['final-bastion'](formation);
                break;
                
            // Add round2-boss formation
            case 'round2-boss':
                enemyPositions = this.formationPatterns['boss-with-satellites'](formation);
                break;
            
            default:
                console.warn('Unknown formation type:', formation.formation);
                // Fallback to a simple line formation
                enemyPositions = this.formationPatterns.line(
                    formation.enemies,
                    { x: 50, y: 0 },
                    { x: 0, y: 80 }
                );
                break;
        }
        
        // Set the formation movement pattern
        this.formationMovement = this.monsterLogic.getFormationMovement(
            formation.formation,
            formation.movementPattern || 'default'
        );
        
        console.log(`Generated ${enemyPositions.length} enemies for ${formation.formation}`);
        
        // Create enemies based on the formation positions
        for (const enemyPos of enemyPositions) {
            const enemy = {
                type: enemyPos.type,
                position: { ...enemyPos.position },
                basePosition: { ...enemyPos.position }, // Store original position in formation
                health: this.monsterLogic.getInitialHealth(enemyPos.type),
                lastShotTime: Date.now() + (Math.random() * 2000), // Randomize initial shot timing
                shotCooldown: this.monsterLogic.getShotCooldown(enemyPos.type),
                speed: this.monsterLogic.getSpeed(enemyPos.type),
                points: this.monsterLogic.getPoints(enemyPos.type),
                isInFormation: true
            };
            
            // Add special properties from the formation
            if (enemyPos.isBoss) {
                enemy.isBoss = true;
            }
            
            if (enemyPos.orbit) {
                enemy.orbit = { ...enemyPos.orbit };
            }
            
            if (enemyPos.spiralParams) {
                enemy.spiralParams = { ...enemyPos.spiralParams };
            }
            
            if (enemyPos.waveFactor) {
                enemy.waveFactor = { ...enemyPos.waveFactor };
            }
            
            if (enemyPos.patrol) {
                enemy.patrol = { ...enemyPos.patrol };
            }
            
            if (enemyPos.nebula) {
                enemy.nebula = { ...enemyPos.nebula };
            }
            
            if (enemyPos.vortex) {
                enemy.vortex = { ...enemyPos.vortex };
            }
            
            if (enemyPos.phaseIndex !== undefined) {
                enemy.phaseIndex = enemyPos.phaseIndex;
                enemy.phases = enemyPos.phases;
                enemy.phaseChangeTime = enemyPos.phaseChangeTime;
            }
            
            if (enemyPos.belongsToPhase !== undefined) {
                enemy.belongsToPhase = enemyPos.belongsToPhase;
            }
            
            if (enemyPos.teleportPositions) {
                enemy.teleportPositions = enemyPos.teleportPositions;
                enemy.teleportInterval = enemyPos.teleportInterval || 3000;
            }
            
            if (enemyPos.converge) {
                enemy.converge = { ...enemyPos.converge };
            }
            
            // Check if this enemy is a flyby type that should be excluded from wave completion count
            // Only darkling1 and darkling9 should be flyby enemies, not mid-bosses
            enemy.isFlyby = (enemy.type === 'darkling1' || enemy.type === 'darkling9') && 
                            !enemy.type.startsWith('darkmidboss') && 
                            !enemy.type.includes('boss');
            
            // Extra safety check: NEVER allow mid-bosses to be flyby enemies
            if (enemy.type.startsWith('darkmidboss') || enemy.isMidBoss === true) {
                enemy.isFlyby = false;
            }
            
            this.enemies.push(enemy);
        }
        
        // Add mid-bosses if present in the formation
        if (formation.midBoss) {
            console.log('Adding mid-boss:', formation.midBoss.type);
            this.enemies.push({
                type: formation.midBoss.type,
                position: { ...formation.midBoss.position },
                basePosition: { ...formation.midBoss.position },
                health: this.monsterLogic.getInitialHealth(formation.midBoss.type),
                lastShotTime: Date.now(),
                shotCooldown: this.monsterLogic.getShotCooldown(formation.midBoss.type),
                speed: this.monsterLogic.getSpeed(formation.midBoss.type),
                points: this.monsterLogic.getPoints(formation.midBoss.type),
                isInFormation: false,
                isMidBoss: true
            });
        }
        
        // Add multiple mid-bosses if present
        if (formation.midBosses && Array.isArray(formation.midBosses)) {
            console.log(`Adding ${formation.midBosses.length} mid-bosses`);
            for (const midBoss of formation.midBosses) {
                this.enemies.push({
                    type: midBoss.type,
                    position: { ...midBoss.position },
                    basePosition: { ...midBoss.position },
                    health: this.monsterLogic.getInitialHealth(midBoss.type),
                    lastShotTime: Date.now(),
                    shotCooldown: this.monsterLogic.getShotCooldown(midBoss.type),
                    speed: this.monsterLogic.getSpeed(midBoss.type),
                    points: this.monsterLogic.getPoints(midBoss.type),
                    isInFormation: false,
                    isMidBoss: true
                });
            }
        }
        
        // Only count non-flyby enemies towards completion
        this.gameState.enemiesRemaining = this.enemies.filter(enemy => !enemy.isFlyby).length;
        this.gameState.waveCompleted = false;
        this.formationOffset = { x: 0, y: 0 };
        this.lastEnemySpawnTime = Date.now();
        
        // FIX: Log the number of enemies spawned for this wave
        console.log(`Spawned ${this.enemies.length} enemies, ${this.gameState.enemiesRemaining} count toward wave completion`);
        
        // FIX: Safety check - if no enemies were spawned that count toward completion, reset and try again
        if (this.gameState.enemiesRemaining === 0 && this.enemies.length === 0) {
            console.warn("No enemies spawned for this wave. Trying to fix...");
            
            // Create at least one enemy to avoid auto-completion
            this.enemies.push({
                type: 'darkling1',
                position: { x: 0, y: -100 },
                basePosition: { x: 0, y: -100 },
                health: 1,
                lastShotTime: Date.now(),
                shotCooldown: 3000,
                speed: 2,
                points: 10,
                isInFormation: true,
                isFlyby: false
            });
            
            this.gameState.enemiesRemaining = 1;
        }
    }
    
    /**
     * Get the current game state
     * @returns {Object} Current game state and player info
     */
    getGameState() {
        // Create a comprehensive state object that includes all necessary data for rendering
        return {
            isActive: this.gameState.isActive,
            isPaused: this.gameState.isPaused,
            currentRound: this.gameState.currentRound,
            currentWave: this.gameState.currentWave,
            waveCompleted: this.gameState.waveCompleted,
            enemiesRemaining: this.gameState.enemiesRemaining,
            score: this.gameState.score,
            selectedCharacter: this.gameState.selectedCharacter,
            gameOver: this.gameState.gameOver,
            victory: this.gameState.victory,
            elapsedTime: this.gameState.elapsedTime,
            player: this.player,
            enemies: this.enemies,
            projectiles: this.projectiles,
            powerups: this.powerups || [],
            formationPattern: this.formationMovement ? 'active' : 'none'
        };
    }
    
    /**
     * Update the game state
     * @param {number} timestamp - Current animation frame timestamp
     */
    update(timestamp) {
        // Update game time
        if (this.gameState.startTime) {
            this.gameState.elapsedTime = Date.now() - this.gameState.startTime;
        }
        
        // FIX: Only check for wave completion if the wave isn't already completed
        if (!this.gameState.waveCompleted) {
            // Check if all non-flyby enemies are defeated for wave completion
            const nonFlybyEnemiesRemaining = this.enemies.filter(enemy => !enemy.isFlyby).length;
            
            // Log the current enemy count for debugging
            if (this.gameState.debug) {
                console.log(`Remaining enemies: ${nonFlybyEnemiesRemaining} (wave ${this.gameState.currentWave}, round ${this.gameState.currentRound})`);
            }
            
            if (nonFlybyEnemiesRemaining === 0 && this.enemies.length > 0) {
                // Make sure we have enemies but they're all flyby enemies
                this.gameState.waveCompleted = true;
                this.handleWaveCompleted();
            } else if (nonFlybyEnemiesRemaining === 0 && this.lastEnemySpawnTime && 
                      (Date.now() - this.lastEnemySpawnTime > 2000)) {
                // If there are no enemies and it's been 2 seconds since the wave was spawned,
                // consider it completed (safety fallback)
                this.gameState.waveCompleted = true;
                this.handleWaveCompleted();
            }
        }
        
        // Update powerup cooldowns
        if (this.player.burstMode && !this.player.burstMode.isReady) {
            if (Date.now() - this.player.burstMode.lastUsed > this.player.burstMode.cooldown) {
                this.player.burstMode.isReady = true;
            }
        }
        

        // Regenerate shield if applicable (for Aliza) - with delay after being hit
        if (this.player.shieldRegenRate > 0 && 
            this.player.shield < this.player.maxShield &&
            Date.now() - (this.player.lastShieldHit || 0) > 3000) { // 3 second delay
            this.player.shield = Math.min(
                this.player.maxShield,
                this.player.shield + this.player.shieldRegenRate
    );
}
        
        // Check if we should spawn flyby enemies
        if (this.monsterLogic && this.monsterLogic.shouldSpawnFlyby(timestamp)) {
            const flybyEnemies = this.monsterLogic.createFlybyGroup(timestamp);
            if (flybyEnemies && flybyEnemies.length > 0) {
                // Add the flyby enemies to the main enemies array but don't count them toward wave completion
                this.enemies.push(...flybyEnemies);
                // Note: No longer updating enemiesRemaining here
            }
        }
        
        // Update flyby enemies
        this.updateFlybyEnemies(timestamp);
        
        // Update formation movement
        this.updateFormationMovement(timestamp);
        
        // Update enemies
        this.updateEnemies(timestamp);
        
        // Update projectiles
        this.updateProjectiles(timestamp);
        
        // Update powerups
        this.updatePowerups();
        
        // Check collisions
        this.checkCollisions();
    }
    
    /**
     * Handle completion of a wave
     */
    handleWaveCompleted() {
        // Prevent multiple calls to handleWaveCompleted
        if (this._handlingWaveCompletion) return;
        this._handlingWaveCompletion = true;
        
        console.log(`Wave ${this.gameState.currentWave} of Round ${this.gameState.currentRound} completed!`);
        
        // Apply wave completion bonus
        const waveBonus = 100 * this.gameState.currentWave * this.gameState.currentRound;
        this.gameState.score += waveBonus;
        
        // Schedule next wave or round
        setTimeout(() => {
            this._handlingWaveCompletion = false;
            const wavesInRound = this.monsterLogic.getWavesInRound(this.gameState.currentRound);
            
            if (this.gameState.currentWave < wavesInRound) {
                // Start next wave
                this.gameState.currentWave++;
                this.gameState.waveCompleted = false;
                console.log(`Starting wave ${this.gameState.currentWave} of round ${this.gameState.currentRound}`);
                this.spawnWave();
            } else if (this.gameState.currentRound < 3) {
                // Start next round
                this.gameState.currentRound++;
                this.gameState.currentWave = 1;
                this.gameState.waveCompleted = false;
                console.log(`Starting round ${this.gameState.currentRound}, wave ${this.gameState.currentWave}`);
                this.spawnWave();
            } else {
                // All rounds completed - victory!
                this.handleGameOver(true);
            }
        }, 3000); // 3 second delay between waves
    }
    
    /**
     * Update formation movement pattern
     * @param {number} timestamp - Current animation frame timestamp
     */
    updateFormationMovement(timestamp) {
        if (!this.formationMovement) {
            return;
        }
        
        // Apply the formation movement pattern function
        const movement = this.formationMovement(timestamp, this.formationOffset);
        
        if (movement) {
            this.formationOffset.x = movement.x;
            this.formationOffset.y = movement.y;
        }
    }
    
    /**
     * Update all enemies in the game
     * @param {number} timestamp - Current animation frame timestamp
     */
    updateEnemies(timestamp) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // HARD CONSTRAINT: Force mid-bosses to stay on screen
            // Store original position before any movement
            const originalPosition = { ...enemy.position };
            
            // Update enemy position based on formation and individual movement
            if (enemy.isInFormation) {
                // Apply formation movement
                enemy.position.x = enemy.basePosition.x + this.formationOffset.x;
                enemy.position.y = enemy.basePosition.y + this.formationOffset.y;
                
                // Handle special formation-specific behaviors
                if (enemy.orbit) {
                    // Handle orbital movement for satellites
                    enemy.orbit.angle += enemy.orbit.speed;
                    enemy.position.x = enemy.orbit.center.x + Math.cos(enemy.orbit.angle) * enemy.orbit.radius;
                    enemy.position.y = enemy.orbit.center.y + Math.sin(enemy.orbit.angle) * enemy.orbit.radius;
                }
                
                // Handle teleporting enemies (for quantum formation)
                if (enemy.teleportPositions && enemy.teleportPositions.length > 0) {
                    const now = Date.now();
                    
                    // Check if it's time to teleport
                    if (now - (enemy.lastTeleport || 0) > (enemy.teleportInterval || 3000)) {
                        // Choose a random position from the available teleport positions
                        const newPosIndex = Math.floor(Math.random() * enemy.teleportPositions.length);
                        const newPos = enemy.teleportPositions[newPosIndex];
                        
                        // Only teleport if the new position is different enough
                        const dx = newPos.x - enemy.basePosition.x;
                        const dy = newPos.y - enemy.basePosition.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 20) { // Minimum teleport distance
                            enemy.basePosition = { ...newPos };
                            
                            // Create teleport effect if particle system exists
                            if (this.game && this.game.particleSystem) {
                                this.game.particleSystem.createTeleportEffect(
                                    enemy.position.x, enemy.position.y, enemy.type
                                );
                            }
                            
                            // Update last teleport time
                            enemy.lastTeleport = now;
                        }
                    }
                }
                
                if (enemy.spiralParams) {
                    // Handle growing spiral movement
                    const growth = enemy.spiralParams.growFactor * Math.sin(timestamp * 0.001);
                    const radius = enemy.spiralParams.initialRadius * (1 + growth);
                    const angle = enemy.spiralParams.initialAngle + timestamp * 0.0005;
                    
                    enemy.position.x = enemy.basePosition.x + Math.cos(angle) * radius;
                    enemy.position.y = enemy.basePosition.y + Math.sin(angle) * radius;
                }
                
                if (enemy.waveFactor) {
                    // Handle serpentine wave movement
                    const waveOffset = Math.sin(
                        enemy.waveFactor.initialPhase + timestamp * 0.001
                    ) * enemy.waveFactor.amplitude;
                    
                    enemy.position.y += waveOffset;
                }
                
                if (enemy.patrol) {
                    // Handle patrol path movement
                    const path = enemy.patrol.path;
                    const currentPoint = enemy.patrol.currentPoint;
                    const nextPoint = (currentPoint + enemy.patrol.direction) % path.length;
                    if (nextPoint < 0) nextPoint = path.length - 1;
                    
                    const startPos = path[currentPoint];
                    const endPos = path[nextPoint];
                    
                    // Calculate progress along path segment
                    const distance = Math.sqrt(
                        Math.pow(endPos.x - startPos.x, 2) + 
                        Math.pow(endPos.y - startPos.y, 2)
                    );
                    
                    enemy.patrol.progress = (enemy.patrol.progress || 0) + enemy.patrol.speed / distance;
                    
                    if (enemy.patrol.progress >= 1) {
                        // Move to next point
                        enemy.patrol.currentPoint = nextPoint;
                        enemy.patrol.progress = 0;
                        
                        // If at end point, reverse direction
                        if (nextPoint === 0 || nextPoint === path.length - 1) {
                            enemy.patrol.direction *= -1;
                        }
                    }
                    
                    // Interpolate position
                    enemy.position.x = startPos.x + (endPos.x - startPos.x) * enemy.patrol.progress;
                    enemy.position.y = startPos.y + (endPos.y - startPos.y) * enemy.patrol.progress;
                }
                
                if (enemy.nebula) {
                    // Handle nebula pulsing movement
                    const center = enemy.nebula.center;
                    const initialDist = enemy.nebula.initialDistance;
                    const initialAngle = enemy.nebula.initialAngle;
                    
                    // Calculate pulse factor
                    const pulseFactor = enemy.nebula.pulseRate.min + 
                        Math.sin(timestamp * enemy.nebula.pulseRate.speed) * 
                        (enemy.nebula.pulseRate.max - enemy.nebula.pulseRate.min);
                    
                    // Apply to position with some rotation
                    const angle = initialAngle + timestamp * 0.0002;
                    const distance = initialDist * pulseFactor;
                    
                    enemy.position.x = center.x + Math.cos(angle) * distance;
                    enemy.position.y = center.y + Math.sin(angle) * distance;
                }
                
                if (enemy.vortex) {
                    // Handle vortex spiral movement
                    const angle = enemy.vortex.initialAngle + timestamp * 0.0008 * enemy.vortex.direction;
                    
                    // Breathe in and out effect
                    const radiusPulse = Math.sin(timestamp * 0.0005) * 0.2 + 0.8;
                    const radius = enemy.vortex.initialRadius * radiusPulse;
                    
                    enemy.position.x = enemy.vortex.center.x + Math.cos(angle) * radius;
                    enemy.position.y = enemy.vortex.center.y + Math.sin(angle) * radius;
                }
                
                // Add individual minor movement relative to formation position
                const enemyMovement = this.monsterLogic.getEnemyMovement(
                    enemy.type, 
                    enemy.position.x, 
                    enemy.position.y, 
                    true
                )(timestamp);
                
                enemy.position.x = enemyMovement.x;
                enemy.position.y = enemyMovement.y;
            } else {
                // If enemy has broken from formation, update with individual pattern
                const enemyMovement = this.monsterLogic.getEnemyMovement(
                    enemy.type, 
                    enemy.position.x, 
                    enemy.position.y, 
                    false
                )(timestamp);
                
                enemy.position.x = enemyMovement.x;
                enemy.position.y = enemyMovement.y;
            }
            
            // HARD CONSTRAINT: Force mid-bosses to stay on screen
            // After all movement calculations, enforce boundary constraints for mid-bosses
            if (enemy.isMidBoss || enemy.type.startsWith('darkmidboss')) {
                // Get canvas bounds
                const canvasWidth = this.canvas ? this.canvas.width : 800;
                const canvasHeight = this.canvas ? this.canvas.height : 600;
                
                // Define strict boundaries (allow 50px of enemy to go off-screen at most)
                const margin = 50;
                const leftBound = -canvasWidth/2 + margin;
                const rightBound = canvasWidth/2 - margin;
                const topBound = -canvasHeight/2 + margin;
                const bottomBound = canvasHeight/2 - margin;
                
                // Force position to stay within bounds
                if (enemy.position.x < leftBound) enemy.position.x = leftBound;
                if (enemy.position.x > rightBound) enemy.position.x = rightBound;
                if (enemy.position.y < topBound) enemy.position.y = topBound;
                if (enemy.position.y > bottomBound) enemy.position.y = bottomBound;
                
                // If position was constrained, also update basePosition to prevent elastic snapping
                if (enemy.position.x !== originalPosition.x || enemy.position.y !== originalPosition.y) {
                    enemy.basePosition.x += (enemy.position.x - originalPosition.x);
                    enemy.basePosition.y += (enemy.position.y - originalPosition.y);
                    
                    // Debug log
                    console.log(`CONSTRAINING MID-BOSS: Forced ${enemy.type} to stay on screen at (${enemy.position.x.toFixed(0)}, ${enemy.position.y.toFixed(0)})`);
                }
            }
            
            // Handle enemy shooting
            if (Date.now() - enemy.lastShotTime > enemy.shotCooldown) {
                const projectiles = this.monsterLogic.createProjectiles(
                    enemy.type,
                    enemy.position.x,
                    enemy.position.y,
                    this.player.position
                );
                
                // Properly register each projectile with the ProjectileManager
                if (projectiles && projectiles.length > 0) {
                    for (const proj of projectiles) {
                        // Use the ProjectileManager's createEnemyProjectileWithVelocity method
                        // instead of directly pushing to the projectiles array
                        if (this.projectileManager) {
                            this.projectileManager.createEnemyProjectileWithVelocity(
                                proj.x, proj.y, proj.dx, proj.dy, {
                                    width: proj.width,
                                    height: proj.height,
                                    sprite: proj.sprite
                                }
                            );
                        } else {
                            // Fallback: Add to the raw projectiles array with necessary properties
                            this.projectiles.enemy.push({
                                x: proj.x,
                                y: proj.y,
                                vx: proj.dx,
                                vy: proj.dy,
                                width: proj.width || 30,
                                height: proj.height || 30,
                                damage: proj.damage || 1,
                                sprite: proj.sprite || 'shot1',
                                adjustedY: proj.y
                            });
                        }
                    }
                }
                
                enemy.lastShotTime = Date.now();
            }
            
            // Check if enemy is defeated
            if (enemy.health <= 0) {
                // Add points to score
                this.gameState.score += enemy.points;
                
                // Check for potion drop
                const potionDrop = this.monsterLogic.getPotionDrop(enemy.type);
                if (potionDrop) {
                    // Create powerup at the enemy's adjusted position to match rendering
                    this.powerups.push({
                        type: potionDrop.type,
                        position: { 
                            x: enemy.position.x, 
                            y: enemy.position.y - 350 // Apply the same Y adjustment used in rendering
                        },
                        velocity: { x: 0, y: 1 }
                    });
                }
                
                // Remove the enemy
                this.enemies.splice(i, 1);
                this.gameState.enemiesRemaining--;
            }
        }
    }
    
    /**
     * Update all projectiles
     * @param {number} timestamp - Current timestamp for animation
     */
    updateProjectiles(timestamp) {
        // Update player projectiles
        for (let i = this.projectiles.player.length - 1; i >= 0; i--) {
            const projectile = this.projectiles.player[i];
            
            // Update position
            projectile.x += projectile.vx || 0;
            projectile.y += projectile.vy || 0;
            
            // Handle homing projectiles for Aliza
            if (projectile.isHoming && this.enemies.length > 0) {
                const now = Date.now();
                
                // Check if homing delay has elapsed
                if (!projectile.homingDelay || now - (projectile.createdAt || now) > projectile.homingDelay) {
                    // Find closest enemy
                    let closestEnemy = null;
                    let closestDistance = Infinity;
                    
                    for (const enemy of this.enemies) {
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
                        projectile.vx += Math.cos(angle) * homingStrength;
                        projectile.vy += Math.sin(angle) * homingStrength;
                        
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
            
            // Remove projectiles that are off-screen - MUCH MORE GENEROUS BOUNDS
            // FIXED: Greatly increased the vertical bounds especially for projectiles going upward
            if (projectile.y < -3000 || projectile.y > 2000 || 
                projectile.x < -1000 || projectile.x > 1000) {
                this.projectiles.player.splice(i, 1);
            }
        }
        
        // Update enemy projectiles
        for (let i = this.projectiles.enemy.length - 1; i >= 0; i--) {
            const projectile = this.projectiles.enemy[i];
            
            // Add frame counter for timing effects
            projectile.frames = (projectile.frames || 0) + 1;
            
            // Update position
            projectile.x += projectile.vx || 0;
            projectile.y += projectile.vy || 0;
            
            // FIXED: Update adjustedY property to match current y position
            projectile.adjustedY = projectile.y;
            
            // Update rotation for rotating projectiles
            if (projectile.rotate && projectile.rotationSpeed) {
                projectile.rotation = (projectile.rotation || 0) + projectile.rotationSpeed;
            }
            
            // Remove projectiles that are off-screen
            // FIXED: MUCH more generous boundary for vertical coordinates
            // Only remove projectiles that are FAR below the player (y > 1500)
            // Allow ANY Y value above the player (negative y) to exist
            if (projectile.y > 1500 || 
                projectile.x < -1000 || projectile.x > 1000) {
                this.projectiles.enemy.splice(i, 1);
            }
        }
        
        // Update special beams (for Shinshi's special attack)
        if (this.projectiles.specialBeams && this.projectiles.specialBeams.length > 0) {
            const now = Date.now();
            this.projectiles.specialBeams = this.projectiles.specialBeams.filter(beam => {
                // Keep only beams that haven't exceeded their duration
                return now - beam.createdAt < beam.duration;
            });
        }
        
        // Update character-specific projectile behaviors
        if (this.gameState.selectedCharacter === 'aliza' && 
            this.projectiles.player && 
            this.projectiles.player.length > 0) {
            
            // Use Aliza's logic to update her projectiles (especially homing ones)
            if (!this.playerAlizaLogic) {
                this.playerAlizaLogic = new PlayerAlizaLogic();
            }
            
            this.playerAlizaLogic.updateProjectiles(
                this.projectiles.player,
                this.enemies,
                16 // Default delta time for 60fps
            );
        }
    }
    
    /**
     * Update powerups
     */
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            // Apply gravity
            powerup.velocity.y += 0.05;
            
            // Update position
            powerup.position.x += powerup.velocity.x;
            powerup.position.y += powerup.velocity.y;
            
            // Remove powerups that fall off the screen
            if (powerup.position.y > 400) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    /**
     * Check collisions between game objects
     */
    checkCollisions() {
        // Player projectiles vs enemies
        for (let i = this.projectiles.player.length - 1; i >= 0; i--) {
            const projectile = this.projectiles.player[i];
            let hitEnemy = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                // Calculate distance WITHOUT applying the -350 offset
                // since both projectile and enemy should use the same coordinate system
                const dx = enemy.position.x - projectile.x;
                const dy = enemy.position.y - projectile.y; 
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Collision radius depends on enemy type
                const collisionRadius = enemy.type.includes('boss') ? 40 : 25;
                
                if (distance < collisionRadius) {
                    // Enemy hit
                    enemy.health -= projectile.damage;
                    hitEnemy = true;
                    
                    // Break loop if not a piercing projectile
                    if (!projectile.isPiercing) {
                        break;
                    }
                }
            }
            
            // Remove projectile if it hit an enemy and isn't a piercing type
            if (hitEnemy && !projectile.isPiercing) {
                this.projectiles.player.splice(i, 1);
            }
        }
        
        // Shinshi's beam vs enemies - NEW CODE
        if (this.projectiles.beams && this.projectiles.beams.length > 0) {
            for (const beam of this.projectiles.beams) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    
                    // Check if enemy is within the beam's horizontal range
                    // Beam extends from its x position with width
                    const beamLeftX = beam.x - beam.width / 2;
                    const beamRightX = beam.x + beam.width / 2;
                    
                    // Check if enemy is within the beam's vertical range
                    // Beam extends from player position to top of screen
                    const enemyAdjustedY = enemy.position.y - 150; // Apply rendering offset
                    
                    if (enemy.position.x >= beamLeftX && enemy.position.x <= beamRightX && 
                        enemy.position.y <= this.player.position.y) {
                        // Enemy is hit by the beam
                        enemy.health -= beam.damage;
                        
                        // Add visual effect if we have a particle system
                        if (this.game && this.game.particleSystem) {
                            this.game.particleSystem.createBeamHitEffect(
                                enemy.position.x, enemy.position.y
                            );
                        }
                    }
                }
            }
        }
        
        // Shinshi's special beam vs enemies - NEW CODE
        if (this.projectiles.specialBeams && this.projectiles.specialBeams.length > 0) {
            for (const specialBeam of this.projectiles.specialBeams) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    const enemyAdjustedY = enemy.position.y - 350; // Apply rendering offset
                    
                    // Check if enemy is within the horizontal beam's vertical range
                    // Beam has full width but specific height
                    const beamTopY = specialBeam.y - specialBeam.height / 2;
                    const beamBottomY = specialBeam.y + specialBeam.height / 2;
                    
                    if (enemyAdjustedY >= beamTopY && enemyAdjustedY <= beamBottomY) {
                        // Enemy is hit by the special beam
                        enemy.health -= specialBeam.damage;
                    }
                }
            }
        }
        
        // Enemy projectiles vs player
        for (let i = this.projectiles.enemy.length - 1; i >= 0; i--) {
            const projectile = this.projectiles.enemy[i];
            
            // FIXED: Always set player Y position for collision at 275 pixels from bottom of screen
            const playerCollisionY = this.canvas ? (this.canvas.height - 275) : 275;
            
            // Calculate distance for collision
            const dx = this.player.position.x - projectile.x;
            const dy = playerCollisionY - projectile.adjustedY; // Use fixed Y position from bottom
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) { // Player collision radius
                // Player hit
                this.handlePlayerHit(projectile.damage || 1);
                
                // Remove projectile
                this.projectiles.enemy.splice(i, 1);
            }
        }
        
        // Powerups vs player
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            // FIXED: Always set player Y position for collision at 275 pixels from bottom of screen
            const playerCollisionY = this.canvas ? (this.canvas.height - 275) : 275;
            
            // Calculate distance for collision
            const dx = this.player.position.x - powerup.position.x;
            const dy = playerCollisionY - powerup.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 40) { // Pickup radius
                // Apply powerup effect
                this.applyPowerup(powerup.type);
                
                // Remove powerup
                this.powerups.splice(i, 1);
            }
        }
    }
    
    /**
     * Handle player being hit
     * @param {number} damage - Damage amount
     * @returns {boolean} - True if damage was applied, false if blocked by invulnerability
     */
    handlePlayerHit(damage) {
        // Don't take damage if recently hit (invulnerability frames)
        if (Date.now() - this.player.lastDamageTime < 600) {
            return false;
        }
        
        // Record hit time for invulnerability frames
        this.player.lastDamageTime = Date.now();
        
        // Play character-specific hit sound
        if (window.audioManager) {
            window.audioManager.playCharacterSound('hit');
        }
        
        // Handle damage differently based on character
        if (this.gameState.selectedCharacter === 'dere') {
            // Dere: Shield takes damage first IF she has one from a power-up
            if (this.player.shield > 0) {
                this.player.shield = Math.max(0, this.player.shield - (damage * 10)); // Increased shield damage by 10x
                // Play shield hit sound if available
                if (this.audioManager) {
                    this.audioManager.playSfx('shieldHit');
                }
                // Create shield hit particle effect
                if (this.game && this.game.particleSystem) {
                    this.game.particleSystem.createShieldEffect(
                        this.player.position.x, 
                        this.player.position.y
                    );
                }
            } else {
                // No shield, direct health damage for Dere
                this.player.health -= damage;
                // Check for game over
                if (this.player.health <= 0) {
                    this.handleGameOver(false);
                }
            }
        } else if (this.gameState.selectedCharacter === 'aliza') {
            // Aliza: Shield takes damage first (she starts with a shield)
            if (this.player.shield > 0) {
                this.player.lastShieldHit = Date.now();
                // Take 25% of max shield per hit instead of fixed amount
                const shieldDamage = this.player.maxShield * 0.25;
                this.player.shield = Math.max(0, this.player.shield - shieldDamage);
                
                // Play shield hit sound if available
                if (this.audioManager) {
                    this.audioManager.playSfx('shieldHit');
                }
                
                // Create shield hit particle effect
                if (this.game && this.game.particleSystem) {
                    this.game.particleSystem.createShieldEffect(
                        this.player.position.x, 
                        this.player.position.y
                    );
                }
            } else {
                // Shield depleted, take health damage
                this.player.health--;
                
                // Check for game over
                if (this.player.health <= 0) {
                    this.handleGameOver(false);
                }
            }
        } else if (this.gameState.selectedCharacter === 'shinshi') {
            // Shinshi: Direct health damage (no shield)
            this.player.health -= damage;
            
            // Check for game over
            if (this.player.health <= 0) {
                this.handleGameOver(false);
            }
        }
        
        // For debugging - log the hit and current health/shield status
        console.log(`Hit! Character: ${this.gameState.selectedCharacter}, Damage: ${damage}, Health: ${this.player.health}, Shield: ${this.player.shield}`);
        
        return true; // Damage was applied
    }
    
    /**
     * Apply a power-up effect
     * @param {string} powerupType - Type of powerup ('health', 'shield', or 'power')
     */
    applyPowerup(powerupType) {
        switch (powerupType) {
            case 'health':
                // Health restoration for dere, shield for aliza
                if (this.gameState.selectedCharacter === 'dere') {
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
                } else {
                    this.player.shield = Math.min(this.player.maxShield, this.player.shield + 50);
                }
                break;
                
            case 'shield':
                // Both characters get shield boost
                this.player.shield = Math.min(this.player.maxShield, this.player.shield + 50);
                if (this.gameState.selectedCharacter === 'aliza') {
                    // Aliza gets longer shield boost
                    this.player.shield = Math.min(this.player.maxShield, this.player.shield + 25);
                }
                break;
                
            case 'power':
                // Power level increase
                if (this.player.powerLevel < 3) {
                    this.player.powerLevel++;
                } else {
                    // Already at max power, refresh special attack cooldown
                    this.player.burstMode.isReady = true;
                }
                break;
        }
    }
    
    /**
     * Handle game over or victory
     * @param {boolean} victory - Whether the player won
     */
    handleGameOver(victory) {
        this.gameState.isActive = false;
        this.gameState.gameOver = true;
        this.gameState.victory = victory;
        
        // Play appropriate sound using window.audioManager for character-specific sounds
        if (window.audioManager) {
            if (victory) {
                window.audioManager.playCharacterSound('victory');
            } else {
                window.audioManager.playCharacterSound('gameover');
            }
        } 
        // Fallback to old audio manager if window.audioManager is not available
        else if (this.audioManager) {
            if (victory) {
                this.audioManager.playSfx('victory');
            } else {
                this.audioManager.playSfx('gameOver');
            }
        }
    }
    
    /**
     * Update flyby enemies movement and status
     * @param {number} timestamp - Current animation frame timestamp
     */
    updateFlybyEnemies(timestamp) {
        // Get a list of flyby enemies from the main enemies array
        const flybyEnemies = this.enemies.filter(enemy => enemy.isFlyby);
        
        if (flybyEnemies.length > 0) {
            // Calculate time since last frame (approximate)
            const deltaTime = 16; // Assuming ~60fps
            
            // Use the monster logic to update flyby enemies
            const remainingEnemies = this.monsterLogic.updateFlybyEnemies(flybyEnemies, deltaTime);
            
            // If any enemies were removed (went off screen), update the main enemies array
            if (remainingEnemies.length !== flybyEnemies.length) {
                // Remove enemies that are no longer in the remaining array
                const remainingIds = remainingEnemies.map(e => e.id);
                
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    if (this.enemies[i].isFlyby && !remainingIds.includes(this.enemies[i].id)) {
                        // Just remove the enemy without adding points
                        this.enemies.splice(i, 1);
                        // No need to update enemiesRemaining since these aren't part of the wave count
                    }
                }
            }
        }
    }
}

// Remove ES6 export statement
// export { GameController };

// Use a global variable instead to make the class accessible
window.GameController = GameController;
