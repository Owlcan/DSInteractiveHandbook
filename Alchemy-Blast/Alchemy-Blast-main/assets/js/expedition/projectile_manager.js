/**
 * ProjectileManager class
 * Handles creation and management of projectiles in the game
 */
class ProjectileManager {
    constructor(game) {
        this.game = game;
        this.projectiles = {
            player: [],
            enemy: [],
            pool: []
        };
    }
    
    /**
     * Create a player projectile
     * @param {number} x - X position of the projectile
     * @param {number} y - Y position of the projectile
     * @param {number} offsetX - X velocity offset
     * @param {number} offsetY - Y velocity offset
     * @param {Object} options - Additional projectile options
     */
    createPlayerProjectile(x, y, offsetX, offsetY, options = {}) {
        // Create the projectile
        const projectile = {
            x: x,
            y: y,
            vx: offsetX,
            vy: offsetY,
            damage: options.damage || 1,
            width: options.width || 20,
            height: options.height || 20,
            isHoming: options.isHoming || false,
            isPiercing: options.isPiercing || false,
            isSpecialAttack: options.isSpecialAttack || false,
            hasImpact: options.hasImpact || false,
            impactSprite: options.impactSprite || null,
            sprite: options.sprite
        };
        
        // Add to player projectiles
        if (this.game.gameController && this.game.gameController.projectiles) {
            this.game.gameController.projectiles.player.push(projectile);
        }
        
        // Play shot sound based on projectile type
        if (options.isSpecialAttack) {
            if (this.game.audioManager) {
                const character = this.game.gameController.gameState.selectedCharacter;
                if (character === 'aliza') {
                    this.game.audioManager.playSfx('alizaspecialattack');
                } else if (character === 'dere') {
                    this.game.audioManager.playSfx('derespecialattack');
                }
            }
        }
        
        return projectile;
    }
    
    /**
     * Create an enemy projectile with specific velocity
     * @param {number} x - X position of the projectile
     * @param {number} y - Y position of the projectile
     * @param {number} dx - X velocity
     * @param {number} dy - Y velocity
     * @param {Object} options - Additional projectile options
     */
    createEnemyProjectileWithVelocity(x, y, dx, dy, options = {}) {
        // Create the projectile
        const projectile = {
            x: x,
            y: y,
            vx: dx,
            vy: dy,
            damage: options.damage || 1,
            width: options.width || 30,
            height: options.height || 30,
            sprite: options.sprite || 'darklingshot1',
            adjustedY: y,
            rotate: options.rotate || false,
            rotationSpeed: options.rotationSpeed || 0,
            rotation: 0
        };
        
        // Add to enemy projectiles
        if (this.game.gameController && this.game.gameController.projectiles) {
            this.game.gameController.projectiles.enemy.push(projectile);
        }
        
        return projectile;
    }
    
    /**
     * Update all projectiles
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update logic for projectiles here
    }
    
    /**
     * Clear all projectiles
     */
    clearAll() {
        if (this.game.gameController && this.game.gameController.projectiles) {
            this.game.gameController.projectiles.player = [];
            this.game.gameController.projectiles.enemy = [];
        }
    }
}
