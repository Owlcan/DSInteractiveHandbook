class CollectibleManager {
/**
     * Handle player collecting a powerup
     * @param {Object} player - Player object
     * @param {Object} powerup - Powerup object
     */
    // Apply powerup effect based on type
    handleCollection(player, powerup) {
        switch (powerup.type) {
            case 'health':
                // Health increase (or shield for Aliza)
                if (player.health < player.maxHealth) {
                    player.health = Math.min(player.maxHealth, player.health + 1);
                }
                // Play health potion sound
                if (this.game.audioManager) {
                    this.game.audioManager.playSfx('healthPotion');
                }
                break;
                
            case 'shield':
                // Shield boost
                if (player.shield < player.maxShield) {
                    player.shield = Math.min(player.maxShield, player.shield + 50);
                }
                // Play shield potion sound
                if (this.game.audioManager) {
                    this.game.audioManager.playSfx('shieldPotion');
                }
                break;
                
            case 'power':
                // Power level increase
                if (player.powerLevel < 3) {
                    player.powerLevel++;
                } else {
                    // Max power - reset special cooldown
                    player.burstMode.lastUsed = 0;
                    player.burstMode.isReady = true;
                }
                // Play power potion sound
                if (this.game.audioManager) {
                    this.game.audioManager.playSfx('powerPotion');
                }
                break;
        }
        
        // Create particle effect
        if (this.game.particleSystem) {
            this.game.particleSystem.createPowerupCollectEffect(
                powerup.position.x, 
                powerup.position.y, 
                powerup.type
            );
        }
    }

    // Constructor to initialize the manager with a game reference
    constructor(game) {
        this.game = game;
    }
}

// Export the CollectibleManager class
export default CollectibleManager;