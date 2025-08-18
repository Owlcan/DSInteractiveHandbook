/**
 * Monster Logic Module for Alchemy Blaster
 */
class MonsterLogic {
    constructor(game) {
        this.game = game;
        this.characterSprites = {
            dere: {
                select: 'assets/images/darklings/dereharacterselect.png',
                left: 'assets/images/darklings/dereleft.png',
                right: 'assets/images/darklings/dereright.png',
                shots: [
                    'assets/images/darklings/shot1.png',
                    'assets/images/darklings/shot1a.png',
                    'assets/images/darklings/shot1b.png'
                ],
                gameover: 'assets/images/darklings/deregameover.png'
            },
            aliza: {
                select: 'assets/images/darklings/alizacharacterselect.png',
                left: 'assets/images/darklings/alizaleft.png',
                right: 'assets/images/darklings/alizaright.png',
                shots: [
                    'assets/images/darklings/alizashot1.png', // Largest shot
                    'assets/images/darklings/alizashot2.png', // Alternates between extra large/large
                    'assets/images/darklings/alizashot3.png'  // Between shot2 and shot1 in size 
                ],
                gameover: 'assets/images/darklings/alizagameover.png'
            },
            shinshi: {
                select: 'assets/images/darklings/shincharacterselect.png',
                left: 'assets/images/darklings/shinleft.png',
                right: 'assets/images/darklings/shinright.png',
                shots: [
                    'assets/images/darklings/shinbeam1.png',
                    'assets/images/darklings/shinbeam2.png',
                    'assets/images/darklings/shinbeam3.png'
                ],
                gameover: 'assets/images/darklings/shingameover.png',
                victory: 'assets/images/darklings/shinvictory.png',
                special: [
                    'assets/images/darklings/shinspecialbeamleftside.png',
                    'assets/images/darklings/shinspecialbeamrightside.png'
                ]
            }
        };
        
        // Character-specific game mechanics as per design document
        this.characterMechanics = {
            dere: {
                // Multi-layered health system with 5 levels
                health: {
                    type: 'layered',
                    layers: 3,
                    assets: [
                        'assets/images/darklings/derehp1.png',
                        'assets/images/darklings/derehp2.png',
                        'assets/images/darklings/derehp3.png'
                    ]
                },
                // Directional firing with offset
                firing: {
                    type: 'directional',
                    offsets: {
                        left: { x: 5, y: -5 }, 
                        right: { x: -5, y: -5 } 
                    },
                    rate: 'steady',
                    projectileSelection: 'random',
                    // Power level upgrades (1-5)
                    powerLevels: {
                        1: { projectiles: 1, damage: 1 },
                        2: { projectiles: 2, damage: 2 },
                        3: { projectiles: 3, damage: 3 },
                        4: { projectiles: 3, damage: 4 }, // Level 4: Same as 3 but higher damage
                        5: { projectiles: 4, damage: 5 }  // Level 5: 4 projectiles with higher damage
                    },
                    special: {
                        type: 'screen-clear',
                        damage: 30,        // High damage to all enemies on screen
                        cooldown: 10000,   // 10 second cooldown
                        effectRadius: 300, // Covers most of the screen
                        name: 'Flash Blast' // Special attack name
                    }
                },
                movement: {
                    speed: 'moderate',
                    style: 'horizontal'
                }
            },
            aliza: {
                // Regenerating shield system
                health: {
                    type: 'shield',
                    maxShield: 100,
                    regenRate: 0.5,
                    regenDelay: 120
                },
                // Central firing with burst mode
                firing: {
                    type: 'central',
                    offsets: { x: 0, y: 0 }, // Center of sprite
                    rate: 'variable',
                    burstFire: {
                        active: true,
                        cooldown: 5000, // ms
                        burstRate: 50, // ms between burst shots
                        burstCount: 6 // Number of shots in a burst
                    }
                },
                movement: {
                    speed: 'fast',
                    style: 'horizontal'
                }
            },
            shinshi: {
                // Simple health system with 4 HP
                health: {
                    type: 'basic',
                    maxHealth: 4,
                    // No overlay HP bar as per design document
                    hasOverlay: false
                },
                // Beam attack configuration
                firing: {
                    type: 'beam',
                    beamStayTime: 'continuous', // Beam stays on as long as fire button is held
                    chargeLevels: 3,  // 3 levels of charge
                    beams: {
                        // Level 1: Small beam with thin hitbox
                        1: { 
                            damage: 1,
                            width: 20,
                            sprite: 'shinbeam1'
                        },
                        // Level 2: Medium beam with wider hitbox
                        2: { 
                            damage: 1,
                            width: 40,
                            sprite: 'shinbeam2'
                        },
                        // Level 3: Large beam with even wider hitbox
                        3: { 
                            damage: 2,
                            width: 60,
                            sprite: 'shinbeam3'
                        }
                    },
                    // Beam stretches vertically from hand to top of screen
                    beamDirection: 'vertical',
                    special: {
                        type: 'vertical-beams',
                        damage: 15,
                        count: 5,  // Creates 5 vertical beams
                        cooldown: 10000, // 10 second cooldown
                        sprite: 'shinbeam3', // Using the thickest beam graphic
                        name: 'Full Screen Beam'
                    }
                },
                movement: {
                    // Slower than Dere or Aliza
                    speed: 'slow',
                    style: 'horizontal'
                },
                sounds: {
                    attack: ['shinnyzap1', 'shinnyzap2'], // Two sounds alternating to create electrical effect
                    hit: 'shinnyhit1',
                    special: 'shinnypewpewpew',
                    victory: ['shinnyvictory1', 'shinnyvictory2'] // Two victory sounds with chance to play either
                }
            }
        };
        
        // Define finite wave structure for Space Invaders style gameplay
        this.waveStructure = this.initializeWaveStructure();
        
        // Setup flyby system for basic darklings that move from left to right across screen
        this.flybySystem = {
            enabled: true,
            active: false,
            lastSpawn: 0,
            spawnInterval: 5000, // Reduced from 8000 to increase frequency
            minEnemies: 8,      // Increased from 3 to 8
            maxEnemies: 15,     // Increased from 6 to 15
            enemyTypes: ['darkling2', 'darkling3', 'darkling4'], // Basic enemy types for flybys
            possibleHeights: [60, 80, 100, 120, 140, 160, 180, 200], // Added more height options
            speed: 0.00001,       // Changed from 0.1 to 0.001 for much slower movement
            spacing: 30         // Reduced from 40 to create tighter groups
        };
    }
    
    /**
     * Initialize the wave structure for the entire game
     * Creates a finite set of waves with predetermined enemy formations
     * @returns {Object} Complete wave structure
     */
    initializeWaveStructure() {
        return {
            1: { // Round 1
                waves: [
                    {
                        // Wave 1: Spiral formation of basic enemies - with mid-boss 1
                        formation: 'spiral',
                        enemies: Array(20).fill().map((_, i) => 
                            i % 3 === 0 ? 'darkling2' : 'darkling1'),
                        spacing: { x: 25, y: 25 }, // Reduced spacing to accommodate more enemies
                        startPosition: { x: 0, y: -300 }, // Maintain original position
                        movementPattern: 'rotate',
                        midBoss: { type: 'darkmidboss1', position: { x: 0, y: -100 } }
                    },
                    {
                        // Wave 2: Dual helix formation - with mid-boss 2
                        formation: 'helix',
                        enemies: Array(20).fill().map((_, i) => 
                            i % 3 === 0 ? 'darkling2' : 'darkling1'),
                        spacing: { x: 25, y: 18 }, // Reduced spacing
                        startPosition: { x: 0, y: -150 }, // Original position
                        movementPattern: 'pulse',
                        midBoss: { type: 'darkmidboss2', position: { x: 0, y: -120 } }
                    },
                    {
                        // Wave 3: Circular orbiting formation - with mid-boss 3
                        formation: 'orbital',
                        rings: 3, // Added an extra ring
                        enemies: Array(24).fill().map((_, i) => 
                            i < 8 ? 'darkling3' : 'darkling2'),
                        spacing: { radius: [80, 140, 200] }, // Added a third ring
                        startPosition: { x: 0, y: -300 }, // Moved up by 400 from original 100
                        movementPattern: 'converge',
                        midBoss: { type: 'darkmidboss3', position: { x: 0, y: -150 } }
                    },
                    {
                        // Wave 4: Pulse Spiral - with mid-boss 4
                        formation: 'spiral',
                        enemies: Array(30).fill().map((_, i) => 
                            i % 3 === 0 ? 'darkling2' : 'darkling3'),
                        spacing: { x: 1, y: 1 }, // Reduced spacing to accommodate more enemies
                        startPosition: { x: 0, y: -300 }, // Maintain original position
                        movementPattern: 'rotate',
                        midBoss: { type: 'darkmidboss4', position: { x: 0, y: -100 } }
                    },
                    {
                        // Wave 5: Boss wave with circling minions - Increased minion counts
                        formation: 'boss-with-satellites',
                        boss: { type: 'darklingboss1', position: { x: 0, y: -200 } }, // Moved up by 300 from original 100
                        minions: [
                            { type: 'darkling2', count: 12, orbit: { radius: 120, speed: 0.002 } }, // Doubled from 6
                            { type: 'darkling1', count: 10, orbit: { radius: 200, speed: -0.001 } }, // More than doubled from 4
                            { type: 'darkling3', count: 8, orbit: { radius: 250, speed: 0.0015 } } // Added a new orbital group
                        ],
                        movementPattern: 'boss-attack'
                    }
                ],
                bossWave: 5
            },
            2: { // Round 2
                waves: [
                    {
                        // Wave 1: Pentagram formation with rotating enemies - with mid-boss 5
                        formation: 'pentagram',
                        enemies: Array(25).fill().map((_, i) => 
                            ['darkling1', 'darkling2', 'darkling3'][i % 3]),
                        spacing: { outer: 170, inner: 100 }, // Increased spacing to accommodate more enemies
                        startPosition: { x: 0, y: -200 }, // Adjusted Y position (-225 from previous 450)
                        movementPattern: 'star-pulse',
                        midBoss: { type: 'darkmidboss5', position: { x: 0, y: -100 } }
                    },
                    {
                        // Wave 2: Pentagram formation with rotating enemies - with mid-boss 6
                        formation: 'pentagram',
                        enemies: Array(25).fill().map((_, i) => 
                            ['darkling5', 'darkling6', 'darkling4'][i % 3]),
                        spacing: { outer: 170, inner: 100 }, // Increased spacing
                        startPosition: { x: 0, y: -200 }, // Adjusted Y position (-225 from previous 450)
                        movementPattern: 'star-pulse',
                        midBoss: { type: 'darkmidboss6', position: { x: 0, y: -120 } }
                    },
                    {
                        // Wave 3: Multi-tiered serpentine attack - with mid-boss 7
                        formation: 'serpentine',
                        rows: 5, // Increased from 3 to 5 rows
                        enemies: Array(35).fill().map((_, i) => {
                            const row = Math.floor(i / 7);
                            return row === 0 ? 'darkling6' : 
                                   row === 1 ? 'darkling5' : 
                                   row === 2 ? 'darkling4' :
                                   row === 3 ? 'darkling3' : 'darkling2';
                        }),
                        spacing: { x: 65, y: 40 }, // Reduced spacing slightly
                        startPosition: { x: 0, y: -300 }, // Adjusted Y position (-225 from previous 430)
                        waveFactor: { amplitude: 60, frequency: 0.1 },
                        movementPattern: 'wave-attack',
                        midBoss: { type: 'darkmidboss7', position: { x: 0, y: -150 } }
                    },
                    {
                        // Wave 4: Pentagram formation - with mid-boss 8
                        formation: 'pentagram',
                        enemies: Array(35).fill().map((_, i) => 
                            ['darkling5', 'darkling6', 'darkling4','darkling1','darkling2','darkling3' ][i % 6]),
                        spacing: { outer: 200, inner: 100 }, // Increased spacing
                        startPosition: { x: 0, y: -300 }, // Adjusted Y position (-225 from previous 450)
                        movementPattern: 'star-pulse',
                        midBoss: { type: 'darkmidboss8', position: { x: 0, y: -100 } }
                    },
                    {
                        // Wave 5: Nested circles with different rotation directions - with mid-boss 1 and 2 together
                        formation: 'nested-circles',
                        rings: [
                            { 
                                enemies: Array(16).fill('darkling8'), // Doubled from 8
                                radius: 80,
                                rotationSpeed: 0.001
                            },
                            { 
                                enemies: Array(24).fill('darkling5'), // Doubled from 12
                                radius: 150,
                                rotationSpeed: -0.0008
                            },
                            { 
                                enemies: Array(12).fill('darkling4'), // Doubled from 6
                                radius: 220,
                                rotationSpeed: 0.0005
                            }
                        ],
                        startPosition: { x: 0, y: -200 }, // Adjusted Y position (-225 from previous 470)
                        movementPattern: 'pulsating',
                        midBosses: [
                            { type: 'darkmidboss1', position: { x: -100, y: -150 } },
                            { type: 'darkmidboss2', position: { x: 100, y: -150 } }
                        ]
                    },
                    {
                        // Wave 6: Staggered assault with three attack lines - with mid-boss 2 and 3 together
                        formation: 'staggered-assault',
                        waves: [
                            {
                                formation: 'arc',
                                enemies: Array(10).fill('darkling8'), // Doubled from 5
                                spacing: { radius: 120, arc: 120 },
                                startPosition: { x: 0, y: -200 }, // Adjusted Y position (-225 from previous 410)
                                delay: 0
                            },
                            {
                                formation: 'pentagram',
                                enemies: Array(30).fill().map((_, i) => // Doubled from 15
                                ['darkling1', 'darkling2', 'darkling3'][i % 3]),
                                spacing: { outer: 170, inner: 100 }, // Increased spacing
                                startPosition: { x: 0, y: -225 }, // Adjusted Y position (-225 from previous 450)
                                movementPattern: 'star-pulse'
                            },
                            {
                                formation: 'arc',
                                enemies: Array(10).fill('darkling8'), // Doubled from 5
                                spacing: { radius: 120, arc: 120 },
                                startPosition: { x: 0, y: -250 }, // Adjusted Y position (-225 from previous 490)
                                delay: 0
                            }
                        ],
                        movementPattern: 'pulsating',
                        midBosses: [
                            { type: 'darkmidboss2', position: { x: -100, y: -150 } },
                            { type: 'darkmidboss3', position: { x: 100, y: -150 } }
                        ]
                    },
                    {
                        // Wave 7: Boss wave - with mid-boss 3 and 4 together
                        formation: 'round2-boss',
                        boss: { 
                            type: 'darklingboss2', 
                            position: { x: 0, y: -245 }, // Adjusted Y position (-225 from previous 470)
                            health: 150, // Increased health for more challenging battle
                            hasShield: true, // New shield mechanic
                            phase: 1, // Boss starts in phase 1
                            phaseThresholds: [0.7, 0.4] // Transition at 70% and 40% health
                        },
                        guardians: [
                            // Four fixed guardian positions symmetrically around the boss
                            { type: 'darkling7', position: { x: -100, y: -195 } }, // Adjusted Y position (-225 from previous 420)
                            { type: 'darkling7', position: { x: 100, y: -195 } },  // Adjusted Y position (-225 from previous 420)
                            { type: 'darkling7', position: { x: -100, y: -295 } }, // Adjusted Y position (-225 from previous 520)
                            { type: 'darkling7', position: { x: 100, y: -295 } }   // Adjusted Y position (-225 from previous 520)
                        ],
                        minions: [
                            // Orbiting minions - first wave
                            { type: 'darkling5', count: 8, orbit: { radius: 180, speed: 0.001, offset: 0 } },
                            // Second wave of minions spawns when boss reaches 70% health
                            { type: 'darkling4', count: 10, orbit: { radius: 220, speed: -0.0015, offset: Math.PI / 2 } },
                            // Final reinforcements when boss reaches 40% health
                            { type: 'darkling8', count: 6, orbit: { radius: 150, speed: 0.002, offset: Math.PI / 4 } }
                        ],
                        movementPattern: 'round2-boss-movement',
                        midBosses: [
                            { type: 'darkmidboss3', position: { x: -150, y: -150 } },
                            { type: 'darkmidboss4', position: { x: 150, y: -150 } }
                        ]
                    }
                ],
                bossWave: 7
            },
            3: { // Round 3
                waves: [
                    {
                        // Wave 1: Hypnotic spiral with alternating enemy types - with mid-boss 4 and 5 together
                        formation: 'growing-spiral',
                        enemies: Array(40).fill().map((_, i) => 
                            i % 2 === 0 ? 'darkling8' : 'darkling7'),
                        spacing: { angle: 12, radiusStep: 12 }, // Reduced spacing to fit more enemies
                        startPosition: { x: 0, y: -450 }, // Adjusted Y position (-225 from previous 450)
                        growFactor: 0.3,
                        movementPattern: 'spiral-expand',
                        midBosses: [
                            { type: 'darkmidboss4', position: { x: -100, y: -150 } },
                            { type: 'darkmidboss5', position: { x: 100, y: -150 } }
                        ]
                    },
                    {
                        // Wave 2: Dynamic fractal formation that evolves - with mid-boss 7 and 8 together
                        formation: 'fractal',
                        seed: {
                            enemies: ['darkling10', 'darkling10', 'darkling10', 'darkling10', 'darkling10'], // Added 2 more seed enemies
                            positions: [
                                { x: -150, y: -205 }, // Adjusted Y position (-225 from previous 430)
                                { x: -75, y: -195 },  // Adjusted Y position (-225 from previous 390)
                                { x: 0, y: -185 },    // Adjusted Y position (-225 from previous 370)
                                { x: 75, y: -195 },   // Adjusted Y position (-225 from previous 390)
                                { x: 150, y: -205 }   // Adjusted Y position (-225 from previous 430)
                            ]
                        },
                        children: {
                            enemies: Array(50).fill().map(() => // Increased from 32 to 50
                                Math.random() < 0.3 ? 'darkling8' : 'darkling7'),
                            offset: { x: [-40, -20, 0, 20, 40], y: [-30, -30, -30, -30, -30] }
                        },
                        movementPattern: 'fractal-collapse',
                        midBosses: [
                            { type: 'darkmidboss7', position: { x: -100, y: -150 } },
                            { type: 'darkmidboss8', position: { x: 100, y: -150 } }
                        ]
                    },
                    {
                        // Wave 3: Interlocking rings with coordinated movements - with mid-boss 9
                        formation: 'interlocking-rings',
                        rings: [
                            {
                                enemies: Array(18).fill('darkling10'), // Tripled from 6
                                radius: 100,
                                rotationSpeed: 0.001,
                                center: { x: -60, y: -225 } // Adjusted Y position (-225 from previous 450)
                            },
                            {
                                enemies: Array(18).fill('darkling10'), // Tripled from 6
                                radius: 100,
                                rotationSpeed: -0.001,
                                center: { x: 60, y: -225 } // Adjusted Y position (-225 from previous 450)
                            },
                            {
                                enemies: Array(12).fill('darkling7'), // Quadrupled from 3
                                radius: 40,
                                rotationSpeed: 0.002,
                                center: { x: 0, y: -225 } // Adjusted Y position (-225 from previous 450)
                            },
                            { // Added a fourth ring
                                enemies: Array(24).fill('darkling8'),
                                radius: 150,
                                rotationSpeed: 0.0015,
                                center: { x: 0, y: -225 } // Adjusted Y position (-225 from previous 450)
                            }
                        ],
                        movementPattern: 'cosmic-dance',
                        midBoss: { type: 'darkmidboss9', position: { x: 0, y: -100 } }
                    },
                    {
                        // Wave 4: Fortress formation with more turrets and defenders - with mid-boss 10
                        formation: 'fortress',
                        core: {
                            enemies: Array(10).fill('darkling7'), // Doubled from 5
                            positions: [
                                { x: 0, y: -400 }, // Center of formation
                                { x: -60, y: -420 }, // Symmetrically positioned
                                { x: 60, y: -420 },
                                { x: -120, y: -440 },
                                { x: 120, y: -440 },
                                { x: -40, y: -380 },
                                { x: 40, y: -380 },
                                { x: -80, y: -440 },
                                { x: 80, y: -440 },
                                { x: 0, y: -460 }
                            ]
                        },
                        turrets: [
                            { type: 'darkling8', position: { x: -160, y: -500 } },
                            { type: 'darkling8', position: { x: 160, y: -500 } },
                            { type: 'darkling8', position: { x: -140, y: -520 } }, // Added 2 more turrets
                            { type: 'darkling8', position: { x: 140, y: -520 } }
                        ],
                        defenders: {
                            formation: 'patrol',
                            enemies: Array(18).fill('darkling10'), // Tripled from 6
                            paths: [
                                { points: [{ x: -140, y: 140 }, { x: 140, y: -640 }], speed: 0.5 },
                                { points: [{ x: -100, y: 280 }, { x: 100, y: -450 }], speed: 0.3 },
                                { points: [{ x: -120, y: 220 }, { x: 120, y: -220 }], speed: 0.4 } // Added third patrol path
                            ]
                        },
                        movementPattern: 'fortress-defense',
                        midBoss: { type: 'darkmidboss10', position: { x: 0, y: -150 } }
                    },
                    {
                        // Wave 5: Pulsating nebula with swarming enemies - with mid-boss 5 and 10 together
                        formation: 'nebula',
                        clusters: [
                            {
                                enemies: Array(50).fill().map(() => // Doubled from 25
                                    Math.random() < 0.7 ? 'darkling8' : 'darkling10'),
                                radius: 180,
                                density: 0.7,
                                center: { x: 0, y: -220 } // Centered with slight vertical offset
                            },
                            { // Added a second cluster
                                enemies: Array(20).fill().map(() =>
                                    Math.random() < 0.4 ? 'darkling7' : 'darkling10'),
                                radius: 100,
                                density: 0.6,
                                center: { x: 0, y: -160 } // Centered with slight vertical offset
                            }
                        ],
                        pulseRate: { min: 0.7, max: 1.3, speed: 0.0005 },
                        movementPattern: 'nebula-pulse',
                        midBosses: [
                            { type: 'darkmidboss5', position: { x: -100, y: -150 } },
                            { type: 'darkmidboss10', position: { x: 100, y: -150 } }
                        ]
                    },
                    {
                        // Wave 6: Alchemy crucible - with mid-boss 1, 2, and 3 together
                        formation: 'crucible',
                        phases: [
                            {
                                formation: 'pentagon',
                                enemies: Array(30).fill('darkling8'), // Tripled from 10
                                radius: 150, // Increased radius to fit more enemies
                                position: { x: 0, y: -200 }, // Centered on screen
                                duration: 6000
                            },
                            {
                                formation: 'star',
                                enemies: Array(30).fill('darkling10'), // Tripled from 10
                                radius: { inner: 100, outer: 200 }, // Increased radius
                                position: { x: 0, y: -200 }, // Centered on screen
                                duration: 6000
                            },
                            {
                                formation: 'circle',
                                enemies: Array(30).fill('darkling7'), // Tripled from 10
                                radius: 170, // Increased radius
                                position: { x: 0, y: -200 }, // Centered on screen
                                duration: 6000
                            }
                        ],
                        transitionSpeed: 2000,
                        movementPattern: 'alchemical-transmutation',
                        midBosses: [
                            { type: 'darkmidboss1', position: { x: -120, y: -150 } },
                            { type: 'darkmidboss2', position: { x: 0, y: -150 } },
                            { type: 'darkmidboss3', position: { x: 120, y: -150 } }
                        ]
                    },
                    {
                        // Wave 7: Dual vortex with periodic enemy pulses - with mid-boss 11 (displayed at 100% size)
                        formation: 'dual-vortex',
                        vortices: [
                            {
                                enemies: Array(16).fill().map((_, i) => // Doubled from 8
                                    i % 2 === 0 ? 'darkling10' : 'darkling8'),
                                center: { x: -100, y: -100 }, // Symmetrical position
                                radius: { start: 30, end: 120 },
                                spiral: { turns: 1.5, direction: 1 }
                            },
                            {
                                enemies: Array(16).fill().map((_, i) => // Doubled from 8
                                    i % 2 === 0 ? 'darkling10' : 'darkling8'),
                                center: { x: 100, y: -100 }, // Symmetrical position
                                radius: { start: 30, end: 120 },
                                spiral: { turns: 1.5, direction: -1 }
                            }
                        ],
                        connectors: {
                            enemies: Array(15).fill('darkling7'), // Tripled from 5
                            spacing: { x: 20, y: 0 } // Reduced spacing to fit more enemies
                        },
                        movementPattern: 'vortex-collapse',
                        midBoss: { 
                            type: 'darkmidboss11', 
                            position: { x: 0, y: -150 },
                            scale: 1.0, // Display at 100% size
                            health: 150,
                            specialAttack: {
                                enabled: true,
                                cooldown: 3500, // 3.5 seconds cooldown as specified
                                patterns: [
                                    // First pattern at full health
                                    {
                                        type: 'burst',
                                        projectiles: 16,
                                        speed: 3
                                    },
                                    // Second pattern at half health
                                    {
                                        type: 'radial',
                                        projectiles: 24,
                                        speed: 2.5
                                    }
                                ],
                                healthThreshold: 0.5 // Switch patterns at 50% health
                            }
                        }
                    },
                    {
                        // Wave 8: Final boss with new tougher vanguard enemies - replaced previous minions
                        formation: 'final-bastion',
                        boss: { type: 'darklingboss3', position: { x: 0, y: -420 } }, // Centered boss
                        phases: [
                            {
                                // Phase 1: Shielding formation with mini-boss entourage (darkling11 - using boss1's attack pattern)
                                formation: 'shield-wall',
                                enemies: Array(6).fill('darkling11'), // Using darkling11 instead of darkling10
                                positions: [
                                    { x: -120, y: -170 }, { x: -80, y: -160 }, 
                                    { x: 0, y: -140 }, { x: 40, y: -150 }, 
                                    { x: 120, y: -170 }, { x: 0, y: -180 }
                                ],
                                duration: 20000
                            },
                            {
                                // Phase 2: Attack formation with mini-boss squads (darkling12 - using boss2's attack pattern)
                                formation: 'attack-squad',
                                squads: [
                                    {
                                        enemies: Array(3).fill('darkling12'), // Using darkling12 instead of darkling7
                                        formation: 'triangle',
                                        radius: 90,
                                        center: { x: -120, y: -200 }
                                    },
                                    {
                                        enemies: Array(3).fill('darkling12'), // Using darkling12 instead of darkling7
                                        formation: 'triangle',
                                        radius: 90,
                                        center: { x: 120, y: -300 }
                                    },
                                    {
                                        enemies: Array(4).fill('darkling13'), // Using darkling13 instead of darkling8
                                        formation: 'diamond',
                                        radius: 100,
                                        center: { x: 0, y: -150 }
                                    }
                                ],
                                duration: 15000
                            },
                            {
                                // Phase 3: Desperate defense - mix of all three new vanguard enemy types
                                formation: 'desperation',
                                enemies: Array(18).fill().map((_, i) => 
                                    i % 3 === 0 ? 'darkling11' : (i % 3 === 1 ? 'darkling12' : 'darkling13')),
                                pattern: 'chaos',
                                boundary: { x: [-200, 200], y: [60, 180] },
                                duration: 25000
                            }
                        ],
                        // Add flanking guardians directly with the boss
                        guardians: [
                            { type: 'darkling11', position: { x: -150, y: -280 } },
                            { type: 'darkling11', position: { x: 150, y: -280 } },
                            { type: 'darkling12', position: { x: -100, y: -250 } },
                            { type: 'darkling12', position: { x: 100, y: -250 } }
                        ],
                        movementPattern: 'final-stand'
                    }
                ],
                bossWave: 8
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
            'darklingboss1': 500,
            'darklingboss2': 1000,
            'darklingboss3': type === 'darklingboss3' ? 4000 : 400,
            'darkling4': 3,
            'darkling5': 2,
            'darkling6': 2,
            'darkling7': 7,
            'darkling8': 3,
            'darkling9': 1,
            'darkling10': 10,
            'darkling11': 15, // Mini boss 1 - tougher than regular enemies
            'darkling12': 20, // Mini boss 2 - even tougher
            'darkling13': 10,  // Elite enemy - tougher than regular but not as tough as mini bosses
            'darkmidboss1': 50, // Round 1 Wave 1 mid-boss
            'darkmidboss2': 50, // Round 1 Wave 2 mid-boss
            'darkmidboss3': 75, // Round 1 Wave 3 mid-boss
            'darkmidboss4': 75, // Round 1 Wave 4 mid-boss
            'darkmidboss5': 100, // Round 2 Wave 1 mid-boss
            'darkmidboss6': 100, // Round 2 Wave 2 mid-boss
            'darkmidboss7': 100, // Round 2 Wave 3 mid-boss
            'darkmidboss8': 100, // Round 2 Wave 4 mid-boss
            'darkmidboss9': 150, // Round 3 Wave 3 mid-boss
            'darkmidboss10': 150, // Round 3 Wave 4 mid-boss
            'darkmidboss11': 150, // Round 3 Wave 7 special mid-boss
        };
        return healthMap[type] || 1; // Default to 1 if type not found
    }

    /**
     * Get individual enemy movement pattern
     * @param {string} type - The type of enemy
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @returns {Function} Movement function
     */
    getMovementPattern(type, x, y) {
        const randomOffset = Math.random() * Math.PI * 2;
        const reverseDirection = Math.random() > 0.5 ? -1 : 1;
        const phaseOffset = Math.random() * 1000;
        const verticalOffset = Math.random() * 50 - 25;
        const amplitudeVariation = 0.8 + Math.random() * 0.4;
        
        return t => {
            // Basic sine wave pattern with vertical offset and amplitude variation
            const x = Math.sin((t + phaseOffset) * 0.001) * 100 * amplitudeVariation * reverseDirection;
            const y = 100 + verticalOffset;

            // Special patterns for certain enemy types
            if (type === 'darkling11') {
                // Uses boss1's pattern but 50% slower
                return {
                    x: x * 0.5,
                    y: y + Math.sin((t + phaseOffset) * 0.0005) * 30
                };
            }
            if (type === 'darkling12') {
                // Uses boss2's pattern but 50% slower
                return {
                    x: Math.sin((t + phaseOffset) * 0.001) * 60,
                    y: y + Math.cos((t + phaseOffset) * 0.0006) * 25
                };
            }
            if (type === 'darkling13') {
                // Wave 3 monster - more aggressive pattern
                return {
                    x: x * 1.2,
                    y: y + Math.sin((t + phaseOffset) * 0.002) * 40
                };
            }

            return { x, y };
        };
    }

    /**
     * Create projectiles for an enemy
     * @param {string} type - Enemy type
     * @param {number} x - Enemy x position
     * @param {number} y - Enemy y position
     * @param {Object} playerPosition - Player position {x, y}
     * @returns {Array} Array of projectile objects
     */
    createProjectiles(type, x, y, playerPosition = null) {
        const projectiles = [];
        
        // Helper function to create a projectile with an angle
        const createProjectile = (angle, speed = 3, size = 1) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            
            // Select appropriate sprite based on enemy type and speed
            let sprite;
            let shouldRotate = false;
            
            // For bosses or high-level enemies, use the rotating projectile
            if (type.includes('boss') || ['darkling7', 'darkling8', 'darkling10'].includes(type)) {
                sprite = 'darklingshot7';
                shouldRotate = true;
            }
            // For faster projectiles
            else if (speed > 4) {
                sprite = 'darklingshot5';
            }
            // For more advanced enemies
            else if (['darkling4', 'darkling5', 'darkling6'].includes(type)) {
                sprite = Math.random() < 0.5 ? 'darklingshot4' : 'darklingshot3';
            }
            // For basic enemies
            else {
                sprite = Math.random() < 0.5 ? 'darklingshot1' : 'darklingshot2';
            }
            
            // Special case for special attacks
            if (type === 'darklingboss3' || (type === 'darklingboss2' && Math.random() < 0.3)) {
                sprite = 'darklingshotspecial';
                shouldRotate= true;
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
        const createTargetedProjectile = (speed = 3, size = 1) => {
            if (!playerPosition) return null;
            
            const dx = playerPosition.x - x;
            const dy = playerPosition.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize and scale by speed
            const ndx = (dx / dist) * speed;
            const ndy = (dy / dist) * speed;
            
            // Select appropriate sprite for targeted shots
            let sprite;
            let shouldRotate = false;
            
            if (type.includes('boss')) {
                sprite = 'darklingshot7';
                shouldRotate = true;
            } else if (type === 'darkling10' || type === 'darkling8') {
                sprite = 'darklingshot4';
            } else if (type === 'darkling7') {
                sprite = 'darklingshot6';
            } else {
                sprite = 'darklingshot3';
            }
            
            return {
                x: x,
                y: y,
                dx: ndx,
                dy: ndy,
                width: 30 * size,
                height: 30 * size,
                sprite: sprite,
                rotate: shouldRotate,
                rotationSpeed: shouldRotate ? (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1) : 0,
                rotation: 0
            };
        };
        
        // Some enemies don't shoot
        if (['darkling1', 'darkling9'].includes(type)) {
            return projectiles;
        }
        
        // Define baseSpeed for all enemy projectiles
        const baseSpeed = 3;
        
        // Check if the enemy is a mid-boss and use specialized patterns
        if (type.startsWith('darkmidboss')) {
            // Use the specialized mid-boss projectile pattern function
            return getMidBossProjectilePattern(type, x, y);
        }
        
        switch(type) {
            case 'darkling2':
            case 'darkling3':
                // Simple single shot
                projectiles.push(createProjectile(90, 3));
                break;
                
            case 'darkling4':
                // Two angled shots
                projectiles.push(createProjectile(75, 3));
                projectiles.push(createProjectile(105, 3));
                break;
                
            case 'darkling5':
            case 'darkling6':
                // Diagonal shots
                projectiles.push(createProjectile(75, 3.5));
                projectiles.push(createProjectile(105, 3.5));
                break;
                
            case 'darkling7':
                // Wide spread
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, 3.5));
                }
                break;
                
            case 'darkling8':
                // Two precise shots
                projectiles.push(createProjectile(85, 4));
                projectiles.push(createProjectile(95, 4));
                break;
                
            case 'darkling10':
                // Random pattern with multiple options
                const patterns = [
                    // Pattern 1: Single fast shot
                    () => projectiles.push(createProjectile(90, 5)),
                    
                    // Pattern 2: Three-way spread
                    () => {
                        for (let angle = 75; angle <= 105; angle += 15) {
                            projectiles.push(createProjectile(angle, 3.2));
                        }
                    },
                    
                    // Pattern 3: Targeted shot if player position available
                    () => {
                        const targeted = createTargetedProjectile(4, 1.2);
                        if (targeted) projectiles.push(targeted);
                    }
                ];
                
                // Choose a random pattern
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
                
            case 'darkling11':
                // Uses boss1's attack pattern but 50% slower
                // First boss: multiple shots in a V pattern
                for (let angle = 75; angle <= 105; angle += 7.5) {
                    projectiles.push(createProjectile(angle, 2, 1.0)); // Half speed (4→2)
                }
                break;
                
            case 'darkling12':
                // Uses boss2's attack pattern but 50% slower
                // Circular pattern with fewer projectiles (6 instead of 8) and half speed
                for (let i = 0; i < 6; i++) {
                    const wideAngle = (i * Math.PI / 3);
                    projectiles.push({
                        x: x,
                        y: y,
                        dx: Math.cos(wideAngle) * baseSpeed * 0.4,
                        dy: Math.sin(wideAngle) * baseSpeed * 0.4,
                        width: 28,
                        height: 28,
                        sprite: 'darklingshot7',
                        rotate: true,
                        rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                        rotation: 0
                    });
                }
                
                // Add a targeted projectile with half speed
                if (playerPosition) {
                    const targeted = createTargetedProjectile(2.25); // Half speed (4.5→2.25)
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            case 'darkling13':
                // Wave 3 monster - combination of darkling7 and darkling8 attacks
                // Medium spread with 3 shots
                for (let angle = 80; angle <= 100; angle += 10) {
                    projectiles.push(createProjectile(angle, 3.5));
                }
                
                // Add a targeted shot if player position is available
                if (playerPosition) {
                    const targeted = createTargetedProjectile(3.8);
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            case 'darklingboss1':
                // First boss: multiple shots in a V pattern
                for (let angle = 75; angle <= 105; angle += 7.5) {
                    projectiles.push(createProjectile(angle, 4, 1.2));
                }
                break;
                
            case 'darklingboss2':
                // Simplified Round 2 boss: 3-way spread + 1 targeted shot
                // No more phases or complex mechanics
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, 4));
                }
                
                // Add a targeted projectile
                if (playerPosition) {
                    const targeted = createTargetedProjectile(4.5);
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            case 'darklingboss3':
                // Final boss: heavy attack pattern
                // Circle shot pattern (12 projectiles in all directions)
                for (let i = 0; i < 12; i++) {
                    const wideAngle = (i * Math.PI / 6);
                    projectiles.push({
                        x: x,
                        y: y,
                        dx: Math.cos(wideAngle) * baseSpeed * 0.8,
                        dy: Math.sin(wideAngle) * baseSpeed * 0.8,
                        width: 40,
                        height: 40,
                        sprite: 'darklingshotspecial',
                        rotate: true,
                        rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                        rotation: 0
                    });
                }
                
                // Add targeted projectiles
                if (playerPosition) {
                    const targeted1 = createTargetedProjectile(5, 1.5);
                    if (targeted1) projectiles.push(targeted1);
                    
                    // Add two flanking shots
                    const angleToPlayer = Math.atan2(playerPosition.y - y, playerPosition.x - x) * 180 / Math.PI;
                    projectiles.push(createProjectile(angleToPlayer - 15, 4.5, 1.2));
                    projectiles.push(createProjectile(angleToPlayer + 15, 4.5, 1.2));
                }
                break;
                
            default:
                // Default - simple straight shot
                projectiles.push(createProjectile(90, 3));
        }
        
        return projectiles;
    }

    /**
     * Get shot cooldown for an enemy based on its type
     * @param {string} type - The type of enemy
     * @param {number} health - Current health of the enemy
     * @returns {number} - Cooldown time in milliseconds
     */
    getShotCooldown(type, health) {
        const cooldownMap = {
            'darklingboss1': 1500, // Boss cooldowns consistent with EnemySystem.js
            'darklingboss2': 1500,
            'darklingboss3': 1500,
            'darkling1': 0,     // Doesn't shoot
            'darkling2': 2500,
            'darkling3': 2500,
            'darkling4': 2500,
            'darkling5': 2000,
            'darkling6': 2000,
            'darkling7': 2000,
            'darkling8': 1500,
            'darkling9': 0,     // Doesn't shoot
            'darkling10': 1500,
            // Mini-boss enemies
            'darkling11': 2400,
            'darkling12': 2250,
            'darkling13': 1600,
            // Mid-boss cooldowns - matching EnemySystem.js
            'darkmidboss1': 1800, // Aggressive 2-shot attack pattern
            'darkmidboss2': 2200, // Defensive flight pattern
            'darkmidboss3': 1900, // Balanced aggressive/defensive
            'darkmidboss4': 1900, // Balanced aggressive/defensive
            'darkmidboss5': 1700, // More powerful 3-shot attack pattern
            'darkmidboss6': 1700, // More powerful 3-shot attack pattern
            'darkmidboss7': 1700, // More powerful 3-shot attack pattern
            'darkmidboss8': 1700, // More powerful 3-shot attack pattern
            'darkmidboss9': 1600, // Aggressive attack pattern
            'darkmidboss10': 1600, // Aggressive attack pattern
            'darkmidboss11': 1300  // Special mid-boss with changing projectile patterns
        };
        
        // If enemy is a boss with low health, reduce cooldown even further (more aggressive at low health)
        if (type === 'darklingboss3' && health < 20) {
            return 1000; // Even more aggressive when at low health
        }
        
        return cooldownMap[type] || 3000;  // Default for unknown enemy types
    }

    /**
     * Get movement speed for an enemy based on its type and health
     * @param {string} type - The type of enemy
     * @param {number} health - Current health of the enemy
     * @returns {number} - Movement speed value
     */
    getSpeed(type, health) {
        // Special cases for bosses - speed up at low health
        if (type === 'darklingboss3' && health <= 20) {
            return 3;
        }
        
        // Remove conditional speed change for darklingboss2
        if (type.includes('boss')) {
            return 1.5; // All bosses are slower
        }
        
        // Fix for mid-bosses moving too fast - reduce their speed
        if (type.startsWith('darkmidboss')) {
            // Reduce speed for all mid-bosses
            return 0.9; // Significantly slower than normal enemies
        }
        
        if (['darkling5', 'darkling9'].includes(type)) {
            return 2.5; // Fast enemies
        }
        
        return 2; // Default speed
    }

    /**
     * Get point value for defeating an enemy
     * @param {string} type - The type of enemy
     * @returns {number} - Point value
     */
    getPoints(type) {
        if (type.includes('boss')) {
            return 500; // Bosses give more points
        }
        
        // Base points based on enemy type
        const pointsMap = {
            'darkling1': 10,
            'darkling2': 15,
            'darkling3': 20,
            'darkling4': 25,
            'darkling5': 30,
            'darkling6': 35,
            'darkling7': 50,
            'darkling8': 40,
            'darkling9': 15,
            'darkling10': 45,
            'darkling11': 60, // Mini boss 1 - tougher than regular enemies
            'darkling12': 60, // Mini boss 2 - even tougher
            'darkling13': 40, // Elite enemy
            // Mid-boss point values
            'darkmidboss1': 100, // Round 1 Wave 1 mid-boss (50 HP)
            'darkmidboss2': 100, // Round 1 Wave 2 mid-boss (50 HP)
            'darkmidboss3': 150, // Round 1 Wave 3 mid-boss (75 HP)
            'darkmidboss4': 150, // Round 1 Wave 4 mid-boss (75 HP)
            'darkmidboss5': 200, // Round 2 Wave 1 mid-boss (100 HP)
            'darkmidboss6': 200, // Round 2 Wave 2 mid-boss (100 HP)
            'darkmidboss7': 200, // Round 2 Wave 3 mid-boss (100 HP)
            'darkmidboss8': 200, // Round 2 Wave 4 mid-boss (100 HP)
            'darkmidboss9': 300, // Round 3 Wave 3 mid-boss (150 HP)
            'darkmidboss10': 300, // Round 3 Wave 4 mid-boss (150 HP)
            'darkmidboss11': 350  // Round 3 Wave 7 special mid-boss (150 HP)
        };
        
        return pointsMap[type] || 10;
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
            dropChance = 0.5; // 50% chance - bosses always have a good chance of dropping items
        } else if (['darkling7', 'darkling8', 'darkling10'].includes(type)) {
            dropChance = 0.2; // 20% chance for stronger enemies
        } else if (['darkling4', 'darkling5', 'darkling6'].includes(type)) {
            dropChance = 0.1; // 10% chance for medium-strength enemies
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
     * Get formation data for a specific round and wave
     * @param {number} round - Current round number
     * @param {number} wave - Current wave number
     * @returns {Object} - Formation data for the wave
     */
    getWaveFormation(round, wave) {
        // Validate input
        if (!this.waveStructure[round] || 
            !this.waveStructure[round].waves || 
            !this.waveStructure[round].waves[wave - 1]) {
            console.error(`Invalid round or wave: ${round}, ${wave}`);
            
            // Add fallback formation for debugging
            return {
                formation: 'line',
                enemies: Array(5).fill('darkling8'),
                spacing: { x: 50, y: 0 },
                startPosition: { x: 0, y: 80 },
                movementPattern: 'default'
            };
        }
        
        // Get the wave formation definition
        const formation = this.waveStructure[round].waves[wave - 1];
        console.log(`Loading formation for round ${round}, wave ${wave}: ${formation.formation}`);
        
        // For quantum formation in wave 4, ensure teleport positions are properly defined
        if (formation.formation === 'quantum') {
            // Add default teleport grid if not defined
            if (!formation.teleportPositions) {
                formation.teleportPositions = [];
                // Create grid of teleport positions
                for (let x = -200; x <= 200; x += 100) {
                    for (let y = 50; y <= 200; y += 50) {
                        formation.teleportPositions.push({ x, y });
                    }
                }
            }
            
            // Ensure teleport interval is defined
            if (!formation.teleportInterval) {
                formation.teleportInterval = 3000;
            }
        }
        
        return formation;
    }

    /**
     * Check if the current wave is a boss wave
     * @param {number} round - Current round number
     * @param {number} wave - Current wave number
     * @returns {boolean} - True if this is a boss wave
     */
    isBossWave(round, wave) {
        // Hardcoded boss wave numbers for clarity and reliability
        if (round === 1 && wave === 5) return true;
        if (round === 2 && wave === 7) return true;
        if (round === 3 && wave === 8) return true;
        
        return false;
    }

    /**
     * Get the number of waves in a specific round
     * @param {number} round - Round number
     * @returns {number} - Number of waves in the round
     */
    getWavesInRound(round) {
        // Hardcoded wave counts for reliability
        if (round === 1) return 5;
        if (round === 2) return 7;
        if (round === 3) return 8;
        if (round === 4) return 5;
        
        // Default fallback
        return this.waveStructure[round] ? 
               this.waveStructure[round].waves.length : 0;
    }

    /**
     * Get a movement pattern for a formation of enemies
     * @param {string} formation - The formation type
     * @param {string} pattern - The movement pattern to use
     * @returns {Function} - Function that returns formation position based on time
     */
    getFormationMovement(formation, pattern = 'default') {
        // Set up base movement patterns
        const patterns = {
            // Original patterns
            'default': t => ({
                x: Math.sin(t * 0.001) * 100,
                y: Math.min(100, Math.floor(t / 5000) * 20)
            }),
            
            // New pattern for Round 2 boss
            'round2-boss-movement': t => {
                // Boss in center with somewhat aggressive movement
                const phase = Math.floor(t / 12000) % 2;
                const phaseProgress = (t % 12000) / 12000;
                
                if (phase === 0) {
                    // Slower movement phase
                    return {
                        x: Math.sin(t * 0.0005) * 100,
                        y: 120 + Math.sin(t * 0.0007) * 30
                    };
                } else {
                    // More aggressive movement phase
                    return {
                        x: Math.sin(t * 0.001) * 140,
                        y: 120 + Math.cos(t * 0.0012) * 50
                    };
                }
            },
            
            'sidestep': t => ({
                x: Math.sin(t * 0.001) * 80,
                y: Math.min(60, (t * 0.008) % 80)
            }),
            
            'oscillate': t => ({
                x: Math.sin(t * 0.002) * 120,
                y: Math.floor(t / 4000) * 20 + Math.sin(t * 0.001) * 15
            }),
            
            'advance': t => ({
                x: Math.sin(t * 0.0015) * 50,
                y: Math.min(150, (t * 0.02))
            }),
            
            // New movement patterns
            'rotate': t => ({
                x: Math.sin(t * 0.001) * 100,
                y: Math.cos(t * 0.001) * 50 + 50
            }),
            
            'pulse': t => {
                const baseScale = 0.8 + Math.sin(t * 0.0015) * 0.2;
                return {
                    x: Math.sin(t * 0.001) * 100 * baseScale,
                    y: Math.cos(t * 0.0008) * 50 * baseScale + 30
                };
            },
            
            'converge': t => {
                // Start wide, then converge toward center
                const progress = Math.min(1, t / 10000);
                const expansionFactor = Math.max(0.3, 1 - progress);
                return {
                    x: Math.sin(t * 0.001) * 150 * expansionFactor,
                    y: 40 + progress * 80
                };
            },
            
            'swoop': t => {
                const swoopPhase = (t % 8000) / 8000;
                
                if (swoopPhase < 0.5) {
                    // Swoop in
                    const inProgress = swoopPhase * 2;
                    return {
                        x: Math.sin(t * 0.001) * 100,
                        y: 150 * inProgress
                    };
                } else {
                    // Swoop out
                    const outProgress = (swoopPhase - 0.5) * 2;
                    return {
                        x: Math.sin(t * 0.001) * 100,
                        y: 150 - (outProgress * 100)
                    };
                }
            },
            
            'boss-attack': t => {
                const phase = Math.floor(t / 8000) % 3;
                
                switch (phase) {
                    case 0: // Center position
                        return {
                            x: Math.sin(t * 0.0005) * 30,
                            y: 100 + Math.sin(t * 0.0007) * 20
                        };
                    case 1: // Left attack
                        return {
                            x: -150 + Math.sin(t * 0.002) * 50,
                            y: 80 + Math.cos(t * 0.002) * 30
                        };
                    case 2: // Right attack
                        return {
                            x: 150 + Math.sin(t * 0.002) * 50,
                            y: 80 + Math.cos(t * 0.002) * 30
                        };
                }
            },
            
            'converge-attack': t => {
                // Start at the sides, converge to center, then attack
                const phase = Math.floor(t / 10000) % 2;
                const phaseProgress = (t % 10000) / 10000;
                
                if (phase === 0) {
                    // Converge phase
                    return {
                        x: (1 - phaseProgress) * 200 * (Math.sin(t * 0.002)),
                        y: 60 + phaseProgress * 60
                    };
                } else {
                    // Attack phase - advance toward player
                    return {
                        x: Math.sin(t * 0.001) * 80,
                        y: 120 + phaseProgress * 100
                    };
                }
            },
            
            'star-pulse': t => {
                // Pentagram rotates and pulses
                const rotationSpeed = 0.0003;
                const pulseRate = 0.0006;
                const pulseAmount = 0.3;
                
                const rotation = t * rotationSpeed;
                const pulse = 1 + Math.sin(t * pulseRate) * pulseAmount;
                
                return {
                    x: Math.sin(rotation) * 100 * pulse,
                        y: 100 + Math.cos(rotation) * 40 * pulse
                };
            },
            
            'wave-attack': t => {
                const waveTime = t % 15000;
                const waveProgress = waveTime / 15000;
                
                // Start with horizontal wave motion
                if (waveProgress < 0.6) {
                    const adjustedProgress = waveProgress / 0.6;
                    return {
                        x: Math.sin(t * 0.001) * 150,
                        y: 60 + adjustedProgress * 40
                    };
                } else {
                    // Then rush attack
                    const attackProgress = (waveProgress - 0.6) / 0.4;
                    return {
                        x: Math.sin(t * 0.002) * (150 * (1 - attackProgress)),
                        y: 100 + attackProgress * 200
                    };
                }
            },
            
            'quantum-shift': t => {
                // Teleportation movement pattern with smooth transitions
                const phase = Math.floor(t / 3000) % 4;
                const phaseProgress = (t % 3000) / 3000;
                
                // Define key teleport positions for the overall formation movement
                const positions = [
                    { x: 0, y: 100 },
                    { x: -150, y: 80 },
                    { x: 0, y: 150 },
                    { x: 150, y: 80 }
                ];
                
                // Current and next position
                const currentPos = positions[phase];
                const nextPos = positions[(phase + 1) % 4];
                
                // For the first 80% of each phase, stay at current position with slight movement
                if (phaseProgress < 0.8) {
                    return {
                        x: currentPos.x + Math.sin(t * 0.003) * 20,
                        y: currentPos.y + Math.cos(t * 0.003) * 15
                    };
                } 
                // For the last 20%, quickly transition to next position (teleport effect)
                else {
                    // Use easing function for smooth transition
                    const transitionProgress = (phaseProgress - 0.8) / 0.2;
                    const easedProgress = Math.pow(transitionProgress, 2);
                    
                    return {
                        x: currentPos.x + (nextPos.x - currentPos.x) * easedProgress,
                        y: currentPos.y + (nextPos.y - currentPos.y) * easedProgress
                    };
                }
            },
            
            'pulsating': t => {
                // Concentric circles that rotate at different speeds and pulse
const baseScale = 0.8 + Math.sin(t * 0.001) * 0.2;
                const yOffset = 100 + Math.sin(t * 0.0003) * 30;
                
                return {
                    x: Math.sin(t * 0.0007) * 80 * baseScale,
                    y: yOffset + Math.cos(t * 0.001) * 30 * baseScale
                };
            },
            
            'rush-and-hold': t => {
                const phase = Math.floor(t / 6000) % 2;
                const phaseProgress = (t % 6000) / 6000;
                
                if (phase === 0) {
                    // Rush in quickly
                    return {
                        x: Math.sin(t * 0.002) * 100 * (1 - phaseProgress),
                        y: 200 * phaseProgress
                    };
                } else {
                    // Hold position with slight movement
                    return {
                        x: Math.sin(t * 0.002) * 40,
                        y: 200 + Math.sin(t * 0.001) * 30
                    };
                }
            },
            
            'fortified-assault': t => {
                // Boss in center with defensive formation that periodically charges
                const phase = Math.floor(t / 10000) % 3;
                const phaseProgress = (t % 10000) / 10000;
                
                switch (phase) {
                    case 0: // Defensive formation
                        return {
                            x: Math.sin(t * 0.0005) * 40,
                            y: 120 + Math.sin(t * 0.0007) * 20
                        };
                    case 1: // Charge preparation
                        return {
                            x: Math.sin(t * 0.001) * 80 * (1 - phaseProgress),
                            y: 120 - phaseProgress * 40
                        };
                    case 2: // Charge attack
                        return {
                            x: Math.sin(t * 0.001) * 60,
                            y: 80 + phaseProgress * 180
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.0005) * 40,
                            y: 120
                        };
                }
            },
            
            'spiral-expand': t => {
                // Spiral grows and contracts
                const expansionPhase = (t % 12000) / 12000;
                const expansionFactor = Math.sin(expansionPhase * Math.PI) * 0.5 + 0.5;
                
                return {
                    x: Math.sin(t * 0.0008) * 120 * expansionFactor,
                    y: 100 + Math.cos(t * 0.0008) * 60 * expansionFactor
                };
            },
            
            'fractal-collapse': t => {
                // Starts expanded, collapses inward, then expands again
                const collapsePhase = (t % 15000) / 15000;
                const collapseFactor = Math.abs(Math.sin(collapsePhase * Math.PI));
                
                return {
                    x: Math.sin(t * 0.0006) * 150 * collapseFactor,
                    y: 100 + Math.cos(t * 0.0006) * 70 * collapseFactor
                };
            },
            
            'cosmic-dance': t => {
                // Complex interlocking movements for interlocking-rings formation
                return {
                    x: Math.sin(t * 0.0007) * 120 + Math.sin(t * 0.0015) * 50,
                    y: 100 + Math.cos(t * 0.0009) * 60 + Math.cos(t * 0.0015) * 30
                };
            },
            
            'fortress-defense': t => {
                // Static fortress with slight movement and occasional defensive posture shifts
                const phase = Math.floor(t / 12000) % 3;
                const phaseProgress = (t % 12000) / 12000;
                
                switch (phase) {
                    case 0: // Standard defensive position
                        return {
                            x: Math.sin(t * 0.0004) * 30,
                            y: 120 + Math.sin(t * 0.0006) * 20
                        };
                    case 1: // Advance slightly
                        return {
                            x: Math.sin(t * 0.0005) * 50,
                            y: 130 + Math.sin(t * 0.0008) * 20
                        };
                    case 2: // Retreat and regroup
                        return {
                            x: Math.sin(t * 0.0003) * 25,
                            y: 100 + Math.sin(t * 0.0004) * 10
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.0004) * 30,
                            y: 120
                        };
                }
            },
            
            'nebula-pulse': t => {
                // Swirling cloud-like motion
                const pulseRate = 0.0004;
                const pulseAmount = 0.4;
                const pulse = 1 + Math.sin(t * pulseRate) * pulseAmount;
                
                return {
                    x: Math.sin(t * 0.0005) * 80 * pulse,
                    y: 120 + Math.cos(t * 0.0007) * 40 * pulse
                };
            },
            
            'alchemical-transmutation': t => {
                // Movement that represents alchemical transformation
                const phase = Math.floor(t / 6000) % 3;
                const phaseProgress = (t % 6000) / 6000;
                
                // Different movement for each alchemical phase
                switch (phase) {
                    case 0: // Calcination - heating
                        return {
                            x: Math.sin(t * 0.001) * 80,
                            y: 100 + Math.sin(phaseProgress * Math.PI) * 30
                        };
                    case 1: // Dissolution - dissolving
                        return {
                            x: Math.sin(t * 0.0015) * 120 * (1 - phaseProgress/2),
                            y: 100 + Math.cos(t * 0.0015) * 50 * (1 - phaseProgress/2)
                        };
                    case 2: // Conjunction - recombining
                        return {
                            x: Math.sin(t * 0.002) * 60 * phaseProgress,
                            y: 100 + Math.cos(t * 0.002) * 30 * phaseProgress
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.001) * 80,
                            y: 100 + Math.sin(t * 0.0008) * 30
                        };
                }
            },
            
            'vortex-collapse': t => {
                // Dual vortices that periodically collapse inward
                const collapsePhase = (t % 10000) / 10000;
                const collapseProgress = Math.sin(collapsePhase * Math.PI * 2);
                const collapseFactor = 0.5 + Math.abs(collapseProgress) * 0.5;
                
                return {
                    x: Math.sin(t * 0.0008) * 120 * collapseFactor,
                    y: 120 + Math.sin(t * 0.0004) * 50 * collapseFactor
                };
            },
            
            'final-stand': t => {
                // Complex multi-phase boss pattern
                const majorPhase = Math.floor(t / 20000) % 3;
                const phaseProgress = (t % 20000) / 20000;
                
                switch (majorPhase) {
                    case 0: // Defensive position
                        return {
                            x: Math.sin(t * 0.0005) * 60,
                            y: 140 + Math.sin(t * 0.0007) * 20
                        };
                    case 1: // Attack phase - rapid movement
                        return {
                            x: Math.sin(t * 0.002) * 150,
                            y: 120 + Math.cos(t * 0.0015) * 80
                        };
                    case 2: // Desperation phase - erratic movement
                        return {
                            x: Math.sin(t * 0.003) * 100 + Math.sin(t * 0.005) * 50,
                            y: 140 + Math.sin(t * 0.004) * 60 + Math.cos(t * 0.006) * 30
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.0005) * 60,
                            y: 140 + Math.sin(t * 0.0007) * 20
                        };
                }
            }
        };
        
        // Return the requested pattern, or default if not found
        return patterns[pattern] || patterns.default;
    }

    /**
     * Get individual enemy movement pattern for a specific enemy
     * @param {string} type - The type of enemy
     * @param {number} x - Base X position (from formation)
     * @param {number} y - Base Y position (from formation)
     * @param {boolean} isInFormation - Whether the enemy is part of a formation
     * @returns {Function} - Function that returns x,y position based on time
     */
    getEnemyMovement(type, x, y, isInFormation = true) {
        // If the enemy is part of a formation, use simpler movement patterns
        // as the formation itself will move
        if (isInFormation) {
            if (type.includes('boss')) {
                // Bosses move in special patterns even in formations
                if (type === 'darklingboss2') {
                    // Simplified, more aggressive movement for Round 2 boss
                    return t => ( {
                        x: x + Math.sin(t * 0.002) * 120, // Wider horizontal movement
                        y: y + Math.sin(t * 0.001) * 20   // Subtle vertical movement
                    });
                }
                return t => ( {
                    x: x + Math.sin(t * 0.002) * 30,
                    y: y + Math.sin(t * 0.003) * 20
                });
            }
            
            // Basic enemies in formations just have minor movement relative to their position
            return t => ( {
                x: x + Math.sin(t * 0.003 + (x * 0.01)) * 10,
                y: y + Math.sin(t * 0.002 + (y * 0.01)) * 8
            });
        }
        
        // If not in formation (special enemies or escaped from formation),
        // use more complex movement patterns from the original logic
        switch(type) {
            case 'darklingboss1':
                return t => ( {
                    x: x + Math.sin(t * 0.002) * 120,
                    y: y + Math.sin(t * 0.001) * 60
                });
                
            case 'darklingboss2':
                // More aggressive movement for Round 2 boss when not in formation too
                return t => ( {
                    x: x + Math.sin(t * 0.002) * 120, // Faster, wider horizontal motion
                    y: y + Math.sin(t * 0.001) * 20   // Slight vertical movement
                });
                
            case 'darklingboss3':
                return t => {
                    // Teleport mechanic for final boss
                    if (!this.lastTeleport || Date.now() - this.lastTeleport > 8000) {
                        this.teleportX = Math.random() * 240 - 120;
                        this.lastTeleport = Date.now();
                    }
                    
                    return {
                        x: x + this.teleportX + Math.sin(t * 0.002) * 30,
                        y: y + Math.sin(t * 0.001) * 50
                    };
                };
                
            default:
                // Default movement for normal enemies not in formation
                return t => ( {
                    x: x + Math.sin(t * 0.002) * 80,
                    y: y + Math.sin(t * 0.001) * 40
                });
        }
    }

    /**
     * Create projectiles for an enemy based on its type
     * @param {string} type - The type of enemy
     * @param {number} x - X position of the enemy
     * @param {number} y - Y position of the enemy
     * @param {Object} playerPosition - Player's current position (for targeted shots)
     * @returns {Array} - Array of projectile objects
     */
    createProjectiles(type, x, y, playerPosition = null) {
        const projectiles = [];
        
        // Helper function to create a projectile with an angle
        const createProjectile = (angle, speed = 3, size = 1) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            
            // Select appropriate sprite based on enemy type and speed
            let sprite;
            let shouldRotate = false;
            
            // For bosses or high-level enemies, use the rotating projectile
            if (type.includes('boss') || ['darkling7', 'darkling8', 'darkling10'].includes(type)) {
                sprite = 'darklingshot7';
                shouldRotate = true;
            }
            // For faster projectiles
            else if (speed > 4) {
                sprite = 'darklingshot5';
            }
            // For more advanced enemies
            else if (['darkling4', 'darkling5', 'darkling6'].includes(type)) {
                sprite = Math.random() < 0.5 ? 'darklingshot4' : 'darklingshot3';
            }
            // For basic enemies
            else {
                sprite = Math.random() < 0.5 ? 'darklingshot1' : 'darklingshot2';
            }
            
            // Special case for special attacks
            if (type === 'darklingboss3' || (type === 'darklingboss2' && Math.random() < 0.3)) {
                sprite = 'darklingshotspecial';
                shouldRotate= true;
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
        const createTargetedProjectile = (speed = 3, size = 1) => {
            if (!playerPosition) return null;
            
            const dx = playerPosition.x - x;
            const dy = playerPosition.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize and scale by speed
            const ndx = (dx / dist) * speed;
            const ndy = (dy / dist) * speed;
            
            // Select appropriate sprite for targeted shots
            let sprite;
            let shouldRotate = false;
            
            if (type.includes('boss')) {
                sprite = 'darklingshot7';
                shouldRotate = true;
            } else if (type === 'darkling10' || type === 'darkling8') {
                sprite = 'darklingshot4';
            } else if (type === 'darkling7') {
                sprite = 'darklingshot6';
            } else {
                sprite = 'darklingshot3';
            }
            
            return {
                x: x,
                y: y,
                dx: ndx,
                dy: ndy,
                width: 30 * size,
                height: 30 * size,
                sprite: sprite,
                rotate: shouldRotate,
                rotationSpeed: shouldRotate ? (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1) : 0,
                rotation: 0
            };
        };
        
        // Some enemies don't shoot
        if (['darkling1', 'darkling9'].includes(type)) {
            return projectiles;
        }
        
        // Define baseSpeed for all enemy projectiles
        const baseSpeed = 3;
        
        // Check if the enemy is a mid-boss and use specialized patterns
        if (type.startsWith('darkmidboss')) {
            // Use the specialized mid-boss projectile pattern function
            return getMidBossProjectilePattern(type, x, y);
        }
        
        switch(type) {
            case 'darkling2':
            case 'darkling3':
                // Simple single shot
                projectiles.push(createProjectile(90, 3));
                break;
                
            case 'darkling4':
                // Two angled shots
                projectiles.push(createProjectile(75, 3));
                projectiles.push(createProjectile(105, 3));
                break;
                
            case 'darkling5':
            case 'darkling6':
                // Diagonal shots
                projectiles.push(createProjectile(75, 3.5));
                projectiles.push(createProjectile(105, 3.5));
                break;
                
            case 'darkling7':
                // Wide spread
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, 3.5));
                }
                break;
                
            case 'darkling8':
                // Two precise shots
                projectiles.push(createProjectile(85, 4));
                projectiles.push(createProjectile(95, 4));
                break;
                
            case 'darkling10':
                // Random pattern with multiple options
                const patterns = [
                    // Pattern 1: Single fast shot
                    () => projectiles.push(createProjectile(90, 5)),
                    
                    // Pattern 2: Three-way spread
                    () => {
                        for (let angle = 75; angle <= 105; angle += 15) {
                            projectiles.push(createProjectile(angle, 3.2));
                        }
                    },
                    
                    // Pattern 3: Targeted shot if player position available
                    () => {
                        const targeted = createTargetedProjectile(4, 1.2);
                        if (targeted) projectiles.push(targeted);
                    }
                ];
                
                // Choose a random pattern
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
                
            case 'darkling11':
                // Uses boss1's attack pattern but 50% slower
                // First boss: multiple shots in a V pattern
                for (let angle = 75; angle <= 105; angle += 7.5) {
                    projectiles.push(createProjectile(angle, 2, 1.0)); // Half speed (4→2)
                }
                break;
                
            case 'darkling12':
                // Uses boss2's attack pattern but 50% slower
                // Circular pattern with fewer projectiles (6 instead of 8) and half speed
                for (let i = 0; i < 6; i++) {
                    const wideAngle = (i * Math.PI / 3);
                    projectiles.push({
                        x: x,
                        y: y,
                        dx: Math.cos(wideAngle) * baseSpeed * 0.4,
                        dy: Math.sin(wideAngle) * baseSpeed * 0.4,
                        width: 28,
                        height: 28,
                        sprite: 'darklingshot7',
                        rotate: true,
                        rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                        rotation: 0
                    });
                }
                
                // Add a targeted projectile with half speed
                if (playerPosition) {
                    const targeted = createTargetedProjectile(2.25); // Half speed (4.5→2.25)
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            case 'darkling13':
                // Wave 3 monster - combination of darkling7 and darkling8 attacks
                // Medium spread with 3 shots
                for (let angle = 80; angle <= 100; angle += 10) {
                    projectiles.push(createProjectile(angle, 3.5));
                }
                
                // Add a targeted shot if player position is available
                if (playerPosition) {
                    const targeted = createTargetedProjectile(3.8);
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            case 'darklingboss1':
                // First boss: multiple shots in a V pattern
                for (let angle = 75; angle <= 105; angle += 7.5) {
                    projectiles.push(createProjectile(angle, 4, 1.2));
                }
                break;
                
            case 'darklingboss2':
                // Simplified Round 2 boss: 3-way spread + 1 targeted shot
                // No more phases or complex mechanics
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, 4));
                }
                
                // Add a targeted projectile
                if (playerPosition) {
                    const targeted = createTargetedProjectile(4.5);
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            case 'darklingboss3':
                // Final boss: heavy attack pattern
                // Circle shot pattern (12 projectiles in all directions)
                for (let i = 0; i < 12; i++) {
                    const wideAngle = (i * Math.PI / 6);
                    projectiles.push({
                        x: x,
                        y: y,
                        dx: Math.cos(wideAngle) * baseSpeed * 0.8,
                        dy: Math.sin(wideAngle) * baseSpeed * 0.8,
                        width: 40,
                        height: 40,
                        sprite: 'darklingshotspecial',
                        rotate: true,
                        rotationSpeed: (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
                        rotation: 0
                    });
                }
                
                // Add targeted projectiles
                if (playerPosition) {
                    const targeted1 = createTargetedProjectile(5, 1.5);
                    if (targeted1) projectiles.push(targeted1);
                    
                    // Add two flanking shots
                    const angleToPlayer = Math.atan2(playerPosition.y - y, playerPosition.x - x) * 180 / Math.PI;
                    projectiles.push(createProjectile(angleToPlayer - 15, 4.5, 1.2));
                    projectiles.push(createProjectile(angleToPlayer + 15, 4.5, 1.2));
                }
                break;
                
            default:
                // Default - simple straight shot
                projectiles.push(createProjectile(90, 3));
        }
        
        return projectiles;
    }

    /**
     * Check if it's time to spawn a new flyby group
     * @param {number} timestamp - Current game timestamp
     * @returns {boolean} - True if it's time to spawn a new flyby
     */
    shouldSpawnFlyby(timestamp) {
        if (!this.flybySystem.enabled) return false;
        // If no flyby is active and enough time has passed since the last one
        const timeSinceLastSpawn = timestamp - (this.flybySystem.lastSpawn || 0);
        return timeSinceLastSpawn >= this.flybySystem.spawnInterval;
    }

    /**
     * Create a new flyby group of enemies
     * @param {number} timestamp - Current game timestamp
     * @returns {Array} - Array of enemy objects in the flyby formation
     */
    createFlybyGroup(timestamp) {
        this.flybySystem.lastSpawn = timestamp;
        this.flybySystem.active = true;

        // Determine number of enemies in this flyby group
        const count = Math.floor(
            Math.random() * 
            (this.flybySystem.maxEnemies - this.flybySystem.minEnemies + 1) + 
            this.flybySystem.minEnemies
        );
        
        // Select a random height from the possible heights
        const yPos = this.flybySystem.possibleHeights[
            Math.floor(Math.random() * this.flybySystem.possibleHeights.length)
        ];
        
        // Select enemy types for this group
        const enemyTypes = [];
        for (let i = 0; i < count; i++) {
            // Pick a random enemy type from the available ones
            const typeIndex = Math.floor(Math.random() * this.flybySystem.enemyTypes.length);
            enemyTypes.push(this.flybySystem.enemyTypes[typeIndex]);
        }
        
        // Create the enemies in a line formation
        const enemies = [];
        const startX = -300; // Start off-screen to the left
        for (let i = 0; i < count; i++) {
            const enemy = {
                id: `flyby_${timestamp}_${i}`,
                type: enemyTypes[i],
                health: this.getInitialHealth(enemyTypes[i]),
                position: {
                    x: startX + (i * this.flybySystem.spacing),
                    y: yPos
                },
                movement: 'flyby',
                shotCooldown: this.getShotCooldown(enemyTypes[i]),
                lastShot: 0,
                isFlyby: true,
                speed: this.flybySystem.speed,
                points: this.getPoints(enemyTypes[i]) // Add points property
            };
            
            enemies.push(enemy);
        }
        
        return enemies; // Return the created enemies array
    }

    /**
     * Update flyby enemy positions
     * @param {Array} flybyEnemies - Array of flyby enemies
     * @param {number} deltaTime - Time since last update
     * @returns {Array} - Remaining enemies after update
     */
    updateFlybyEnemies(flybyEnemies, deltaTime) {
        const remainingEnemies = [];
        const screenRightEdge = 800; // Increased right edge of the screen for visibility
        
        for (const enemy of flybyEnemies) {
            // Move the enemy from left to right at a much slower speed
            // Reduce speed by factor of 40 to make them crawl across screen
            enemy.position.x += (enemy.speed / 80) * (deltaTime / 16);
            
            // Keep the enemy if it's still on screen
            if (enemy.position.x < screenRightEdge) {
                remainingEnemies.push(enemy);
            }
        }
        
        // If all enemies have gone off-screen, mark flyby as inactive
        if (remainingEnemies.length === 0) {
            this.flybySystem.active = false;
        }
        
        return remainingEnemies;
    }

    /**
     * Get movement function for flyby enemies
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} speed - Movement speed 
     * @returns {Function} - Function that returns x,y position based on time
     */
    getFlybyMovement(x, y, speed) {
        // Simple left to right linear movement with small vertical oscillation
        return t => {
            return {
                x: x + (speed * t / 16), // Move right at constant speed
                y: y + Math.sin(t * 0.002) * 10 // Small vertical oscillation
            };
        };
    }
}

/**
 * Mid-boss projectile patterns
 * @param {string} bossType - Type of mid-boss
 * @param {number} x - X position of the mid-boss
 * @param {number} y - Y position of the mid-boss
 * @returns {array} - Array of projectiles with speeds and angles
 */
function getMidBossProjectilePattern(bossType, x, y) {
    const projectiles = [];
    const baseSpeed = 3.0; // Slightly reduced from 3.5 to make projectiles more manageable
    const playerX = 0; // Center of the screen
    
    // Helper function to create a projectile
    const createProjectile = (angle, speed, size = 1.0) => {
        const rad = angle * Math.PI / 180;
        return {
            x: x,
            y: y,
            dx: Math.cos(rad) * speed,
            dy: Math.sin(rad) * speed,
            angle: angle,
            speed: speed,
            width: 30 * size,
            height: 30 * size,
            sprite: 'darklingshot7', // Use the rotating projectile sprite
            rotate: true,
            rotation: 0,
            rotationSpeed: Math.random() * 0.1 + 0.05
        };
    };

    // Helper for targeted projectiles
    const createTargetedProjectile = (speed, size = 1.0) => {
        const dx = playerX - x;
        const dy = 200 - y; // Player is fixed at y=200
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return createProjectile(angle, speed, size);
    };
    
    // Helper for creating circular patterns (like the final boss but fewer projectiles)
    const createCirclePattern = (count, speed, angleOffset = 0, size = 1.0) => {
        const angleStep = 360 / count;
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep + angleOffset;
            projectiles.push(createProjectile(angle, speed, size));
        }
    };
    
    // Helper for creating spiral patterns
    const createSpiralPattern = (count, speed, size = 1.0) => {
        const baseAngle = Math.random() * 360; // Random starting angle
        for (let i = 0; i < count; i++) {
            // Create a spiral effect with varying angles
            const angle = baseAngle + (i * 15);
            projectiles.push(createProjectile(angle, speed * (0.8 + (i * 0.05)), size));
        }
    };
    
    // Helper for creating targeted spread patterns
    const createTargetedSpread = (count, speed, spreadAngle = 30, size = 1.0) => {
        // Get angle to player
        const dx = playerX - x;
        const dy = 200 - y;
        const centerAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Create spread around player's position
        const angleStep = spreadAngle / (count - 1);
        for (let i = 0; i < count; i++) {
            const angle = centerAngle - (spreadAngle / 2) + (i * angleStep);
            projectiles.push(createProjectile(angle, speed, size));
        }
    };
    
    switch(bossType) {
        case 'darkmidboss1': // Slower version of final boss pattern 1
            // Three aimed shots plus two flanking shots
            projectiles.push(createTargetedProjectile(baseSpeed * 1.1, 1.1));
            createTargetedSpread(3, baseSpeed, 20, 0.9);
            break;
            
        case 'darkmidboss2': // Defensive arc pattern
            // Wide spread with central targeted shot
            for (let angle = 60; angle <= 120; angle += 15) {
                projectiles.push(createProjectile(angle, baseSpeed, 0.9));
            }
            projectiles.push(createTargetedProjectile(baseSpeed * 1.2, 1.1));
            break;
            
        case 'darkmidboss3': // Balanced attack with spread and targeted shots
            // Mini-version of the final boss's pattern - aimed shot with flanking shots
            if (Math.random() < 0.7) {
                // Targeted shot with two flanking shots
                projectiles.push(createTargetedProjectile(baseSpeed * 1.2, 1.1));
                const dx = playerX - x;
                const dy = 200 - y;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                projectiles.push(createProjectile(angle - 20, baseSpeed, 0.9));
                projectiles.push(createProjectile(angle + 20, baseSpeed, 0.9));
            } else {
                // Occasionally do a 3-way spread
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, baseSpeed * 1.1, 1.0));
                }
            }
            break;
            
        case 'darkmidboss4': // Similar to darkmidboss3 but with different pattern
            // Alternating pattern - mimics final boss's versatility
            if (Math.random() < 0.6) {
                // Pattern 1: 5-shot narrow fan
                for (let angle = 80; angle <= 100; angle += 5) {
                    projectiles.push(createProjectile(angle, baseSpeed * 1.1, 0.9));
                }
            } else {
                // Pattern 2: 4-shot wider spread
                projectiles.push(createProjectile(70, baseSpeed, 1.0));
                projectiles.push(createProjectile(80, baseSpeed * 1.1, 1.0));
                projectiles.push(createProjectile(100, baseSpeed * 1.1, 1.0));
                projectiles.push(createProjectile(110, baseSpeed, 1.0));
            }
            break;
            
        case 'darkmidboss5': // Partial circular pattern
            // Semi-circular pattern (covers ~120 degrees in front)
            createTargetedSpread(5, baseSpeed * 1.1, 60, 0.9);
            break;
            
        case 'darkmidboss6': // Arc pattern with focused center
            // Similar to final boss's behavior but more predictable
            createTargetedSpread(3, baseSpeed * 1.2, 15, 1.1);
            projectiles.push(createProjectile(70, baseSpeed * 0.9, 0.8));
            projectiles.push(createProjectile(110, baseSpeed * 0.9, 0.8));
            break;
            
        case 'darkmidboss7': // Spiral pattern
            // Creates a mini spiral pattern like the final boss but slower
            createSpiralPattern(5, baseSpeed, 0.9);
            break;
            
        case 'darkmidboss8': // Wide arc with multiple projectiles
            // Covers a wide area similar to final boss but fewer projectiles
            for (let angle = 45; angle <= 135; angle += 15) {
                projectiles.push(createProjectile(angle, baseSpeed * (0.9 + Math.random() * 0.3), 0.9));
            }
            break;
            
        case 'darkmidboss9': // Focused attack with partial circular pattern
            // Mini version of the final boss's devastating attack
            if (Math.random() < 0.7) {
                // Main pattern: targeted shot with small circular pattern
                projectiles.push(createTargetedProjectile(baseSpeed * 1.3, 1.2));
                
                // Add a partial circle of shots (6 shots covering 180 degrees)
                const startAngle = Math.random() * 180;
                for (let i = 0; i < 6; i++) {
                    const angle = startAngle + (i * 30);
                    projectiles.push(createProjectile(angle, baseSpeed, 0.8));
                }
            } else {
                // Alternate pattern: wide targeted spread
                createTargetedSpread(7, baseSpeed * 1.1, 60, 0.9);
            }
            break;
            
        case 'darkmidboss10': // Similar to darkmidboss9 but with different pattern mix
            if (Math.random() < 0.6) {
                // Main pattern: small circular burst (8 shots)
                createCirclePattern(8, baseSpeed * 0.9, Math.random() * 45, 0.9);
            } else {
                // Alternate pattern: targeted 3-way with faster projectiles
                projectiles.push(createTargetedProjectile(baseSpeed * 1.4, 1.1));
                
                // Add two faster flanking shots
                const dx = playerX - x;
                const dy = 200 - y;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                projectiles.push(createProjectile(angle - 25, baseSpeed * 1.2, 0.9));
                projectiles.push(createProjectile(angle + 25, baseSpeed * 1.2, 0.9));
            }
            break;
            
        case 'darkmidboss11': // Special mid-boss with health-based patterns
            // This boss has two distinct patterns based on health
            if (Math.random() < 0.5) { // Simulating health check
                // First pattern - circular burst (like final boss but fewer projectiles)
                createCirclePattern(10, baseSpeed * 1.0, Math.random() * 36, 1.0);
            } else {
                // Second pattern - targeted spread with additional circular shots
                projectiles.push(createTargetedProjectile(baseSpeed * 1.3, 1.2));
                
                // Add circular pattern of slower shots
                for (let angle = 0; angle < 360; angle += 60) {
                    projectiles.push(createProjectile(angle, baseSpeed * 0.8, 0.8));
                }
            }
            break;
            
        default:
            // Fallback - simple 3-way pattern
            projectiles.push(createProjectile(80, baseSpeed));
            projectiles.push(createProjectile(90, baseSpeed));
            projectiles.push(createProjectile(100, baseSpeed));
    }
    
    return projectiles;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MonsterLogic };
}

/**
 * Check if an enemy is a mid-boss
 * @param {string} enemyType - The type of enemy to check
 * @returns {boolean} - True if the enemy is a mid-boss
 */
function isMidBoss(enemyType) {
    return enemyType.startsWith('darkmidboss');
}

/**
 * Get specialized mid-boss movement pattern
 * This is called from game_controller.js when initializing enemies
 * @param {string} bossType - Type of mid-boss
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @returns {Function} - Movement function that returns position based on time
 */
function getMidBossMovement(bossType, startX, startY) {
    // Store state for smoother transitions
    const state = {
        lastTeleport: 0,
        teleportX: 0,
        teleportY: 0,
        phaseTime: 0,
        currentPhase: 0,
        // Add movement range constraints - allows movement within screen bounds but not off-screen
        movementRange: {
            x: { min: -250, max: 250 },  // Wider horizontal range but still on screen
            y: { min: 50, max: 350 }     // Allow more vertical movement while staying visible
        }
    };
    
    // Mid-bosses should have a slow, deliberate movement pattern like a slower version of the final boss
    return (timestamp) => {
        // Different movement patterns based on boss type
        let wiggleX, wiggleY;
        
        // Update phase time for all bosses
        if (!state.phaseTime) {
            state.phaseTime = timestamp;
        }
        
        // Every 5 seconds, change phase for variance but maintain smooth transitions
        if (timestamp - state.phaseTime > 5000) {
            state.currentPhase = (state.currentPhase + 1) % 3;
            state.phaseTime = timestamp;
        }
        
        // Phase progress for smooth transitions (0.0 to 1.0)
        const phaseProgress = Math.min(1.0, (timestamp - state.phaseTime) / 5000);
        
        // Further reduce movement speed with smaller coefficients (about 40% slower)
        switch(bossType) {
            case 'darkmidboss1':
            case 'darkmidboss2':
                // Smoother figure-8 pattern with reduced amplitude
                wiggleX = Math.sin(timestamp * 0.0002) * 100;
                wiggleY = Math.sin(timestamp * 0.0004) * 35;
                break;
                
            case 'darkmidboss3':
                // Boss1-like movement pattern but slower
                wiggleX = Math.sin(timestamp * 0.00018) * 120; // Wide horizontal movement like boss1
                wiggleY = Math.sin(timestamp * 0.00010) * 60;  // Similar vertical movement to boss1
                break;
                
            case 'darkmidboss4':
                // Smoother arc pattern - reduced frequency for gentler movement
                wiggleX = Math.sin(timestamp * 0.00015) * 120;
                wiggleY = Math.cos(timestamp * 0.0002) * 40 + Math.sin(timestamp * 0.00008) * 20;
                break;
                
            case 'darkmidboss5':
                // Boss2-like aggressive movement pattern but scaled down
                wiggleX = Math.sin(timestamp * 0.00022) * 120; // Fast, wide horizontal motion like boss2
                wiggleY = Math.sin(timestamp * 0.00008) * 20;  // Slight vertical movement like boss2
                break;
                
            case 'darkmidboss6':
                // Slower pendulum with more natural feel
                wiggleX = Math.sin(timestamp * 0.00018) * 110;
                wiggleY = Math.sin(timestamp * 0.00008) * 35;
                break;
                
            case 'darkmidboss7':
                // Modified boss3-like teleporting behavior but more predictable
                // Teleport every 7 seconds to new position
                if (!state.lastTeleport || timestamp - state.lastTeleport > 7000) {
                    // Choose from a set of predetermined positions rather than random
                    const positions = [
                        { x: -100, y: 20 },
                        { x: 100, y: 20 },
                        { x: 0, y: 30 },
                        { x: -80, y: -20 },
                        { x: 80, y: -20 }
                    ];
                    const posIndex = Math.floor(timestamp / 7000) % positions.length;
                    state.teleportX = positions[posIndex].x;
                    state.teleportY = positions[posIndex].y;
                    state.lastTeleport = timestamp;
                    state.teleportStartTime = timestamp;
                }
                
                // Calculate teleport progress with smoother transition
                const teleportTime = 800;
                const teleportProgress = Math.min(1.0, (timestamp - state.teleportStartTime) / teleportTime);
                
                // Use easing function for smoother transition
                const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const smoothProgress = easeInOutQuad(teleportProgress);
                
                // Small oscillation on top of the teleport movement
                wiggleX = state.teleportX + Math.sin(timestamp * 0.0003) * 20;
                wiggleY = state.teleportY + Math.sin(timestamp * 0.0002) * 15;
                break;
                
            case 'darkmidboss8':
                // Smoother path with compound sine waves for more organic movement
                wiggleX = Math.sin(timestamp * 0.00015) * 120 + Math.sin(timestamp * 0.0003) * 30;
                wiggleY = Math.sin(timestamp * 0.0001) * 50 + Math.cos(timestamp * 0.00025) * 20;
                break;
                
            case 'darkmidboss9':
                // Combined boss1 and boss2 movements - aggressive figure-8
                wiggleX = Math.sin(timestamp * 0.00020) * 130;
                wiggleY = Math.sin(timestamp * 0.00040) * 50;
                break;
                
            case 'darkmidboss10':
                // Three-phase combat movement like bosses use
                switch(state.currentPhase) {
                    case 0: // Defensive phase - small movements
                        wiggleX = Math.sin(timestamp * 0.00016) * 60;
                        wiggleY = Math.cos(timestamp * 0.00010) * 25;
                        break;
                    case 1: // Attack phase - wider, faster movements
                        wiggleX = Math.sin(timestamp * 0.00025) * 120;
                        wiggleY = Math.cos(timestamp * 0.00020) * 40;
                        break;
                    case 2: // Recovery phase - slow, small movements
                        wiggleX = Math.sin(timestamp * 0.00010) * 40;
                        wiggleY = Math.cos(timestamp * 0.00008) * 20;
                        break;
                    default:
                        wiggleX = Math.sin(timestamp * 0.00016) * 80;
                        wiggleY = Math.cos(timestamp * 0.00016) * 30;
                }
                break;
                
            case 'darkmidboss11':
                // Special mid-boss with final boss-like teleport pattern
                if (!state.lastTeleport || timestamp - state.lastTeleport > 8000) { // Increased teleport delay
                    // Set new target position with wider range
                    state.teleportX = Math.random() * 200 - 100;
                    state.teleportY = Math.random() * 80 - 40;
                    state.lastTeleport = timestamp;
                    state.teleportStartTime = timestamp;
                }
                
                // Calculate how far through the teleport we are (0.0 to 1.0)
                const specialTeleportTime = 900; // Longer transition time for smoother movement
                const specialTeleportProgress = Math.min(1.0, (timestamp - state.teleportStartTime) / specialTeleportTime);
                
                // Smoother easing function for transition
                const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const specialSmoothProgress = easeInOutCubic(specialTeleportProgress);
                
                // Apply smooth movement toward target position with subtle oscillation
                wiggleX = state.teleportX + Math.sin(timestamp * 0.0004) * 25;
                wiggleY = state.teleportY + Math.sin(timestamp * 0.0003) * 20;
                break;
                
            default:
                // Default mid-boss movement - smoother and more varied
                wiggleX = Math.sin(timestamp * 0.0002) * 90 + Math.cos(timestamp * 0.0004) * 30;
                wiggleY = Math.sin(timestamp * 0.00015) * 40 + Math.sin(timestamp * 0.0003) * 15;
        }
        
        // Apply movement constraints to keep bosses on screen but allow more freedom
        const finalX = Math.max(state.movementRange.x.min, Math.min(state.movementRange.x.max, startX + wiggleX));
        const finalY = Math.max(state.movementRange.y.min, Math.min(state.movementRange.y.max, startY + wiggleY));
        
        return {
            x: finalX,
            y: finalY
        };
    };
}