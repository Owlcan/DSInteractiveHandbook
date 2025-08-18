/**
 * Audio Manager for Alchemy Blaster
 * 
 * Handles loading and playing sound effects and music
 */

// Immediately clear any existing audio elements to prevent duplication
(function clearExistingAudio() {
    console.log("[AUDIO MANAGER] Clearing any existing audio elements");
    
    // Stop and remove ALL audio elements except our singleton
    document.querySelectorAll('audio').forEach(audio => {
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.src = "";
            audio.remove();
        } catch(e) {
            console.error("Error cleaning up audio element:", e);
        }
    });
    
    // Clear any global audio references
    if (window.currentBgm) window.currentBgm = null;
    if (window.bgmPlayer) window.bgmPlayer = null;
})();

// Create ONE global audio element that will be used for ALL music playback
window.ONLY_MUSIC_PLAYER = document.createElement('audio');
window.ONLY_MUSIC_PLAYER.id = 'only-music-player';
window.ONLY_MUSIC_PLAYER.loop = true;
window.ONLY_MUSIC_PLAYER.volume = 0.5;
window.ONLY_MUSIC_PLAYER.autoplay = false;
document.body.appendChild(window.ONLY_MUSIC_PLAYER);

// DIRECT HARDCODED MUSIC TRACKS
const MUSIC_MAP = {
    title: 'assets/sounds/Main Theme Turn On.mp3',
    round1: 'assets/sounds/Darkness Unleashed.mp3',
    round2: 'assets/sounds/ShadowDuel.mp3',
    round3: 'assets/sounds/Unyielding Shadows.mp3',
    boss1: 'assets/sounds/Against_the_Shadows.mp3',
    boss2: 'assets/sounds/Bravery_Rises.mp3',
    boss3: 'assets/sounds/MissShadowsResplendent.mp3'
};

// Tracking variable to prevent race conditions
let audioPlayInProgress = false;
// Add tracking variable to prevent character start sound duplication
let characterStartSoundPlayed = {};

class AudioManager {
    constructor() {
        console.log("[AUDIO MANAGER] Initializing audio manager");
        
        this.sfx = {};
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.6;
        this.muted = false;
        this.currentRound = 0;
        this.currentWave = 0;
        this.currentIsBoss = false;
        this.selectedCharacter = null; // Track the selected character
        
        // Initialize sfx only - music is handled by the global player
        this.initAudio();
        
        // Track which spellfire variant was last played (shared by Dere and Aliza)
        this.lastSpellfireVariant = 0;
    }
    
    /**
     * Initialize audio resources
     */
    initAudio() {
        // Load sound effects only - music will use singleton player
        this.loadSfx('playerShot', 'assets/sounds/playershot.wav');
        this.loadSfx('enemyShot', 'assets/sounds/enemyshot.wav');
        this.loadSfx('explosion', 'assets/sounds/explosion.wav');
        this.loadSfx('hit', 'assets/sounds/hit.wav');
        this.loadSfx('powerup', 'assets/sounds/powerup.wav');
        this.loadSfx('waveComplete', 'assets/sounds/wavecomplete.wav');
        this.loadSfx('gameOver', 'assets/sounds/gameover.wav');
        this.loadSfx('victory', 'assets/sounds/victory.wav');
        this.loadSfx('buttonClick', 'assets/sounds/buttonclick.wav');
        this.loadSfx('shieldHit', 'assets/sounds/shieldhit.wav');
        
        // Load shared spellfire sounds for Dere and Aliza
        this.loadSfx('spellfire1', 'assets/sounds/spellfire.wav');
        this.loadSfx('spellfire2', 'assets/sounds/spellfire1.mp3');
        this.loadSfx('spellfire3', 'assets/sounds/spellfire2.mp3');
        this.loadSfx('spellfire4', 'assets/sounds/spellfire3.mp3');
        
        // Load character-specific sounds
        // Dere sounds
        this.loadSfx('derehit', 'assets/sounds/derehit.wav'); // Fixed path to correct filename
        this.loadSfx('derehit1', 'assets/sounds/derehit1.wav'); // Fixed path to correct filename
        this.loadSfx('derehit2', 'assets/sounds/derehit2.wav'); // Fixed path to correct filename
        this.loadSfx('derehit3', 'assets/sounds/derehit3.wav'); // Fixed path to correct filename
        this.loadSfx('derespecialattack', 'assets/sounds/derespecialattack.wav');
        this.loadSfx('derevictory1', 'assets/sounds/victory1.wav');
        this.loadSfx('deregameover', 'assets/sounds/gameover.wav');
        this.loadSfx('derestart', 'assets/sounds/derestart.wav');
        
        // Aliza sounds
        this.loadSfx('alizahit', 'assets/sounds/alizahit.wav');
        this.loadSfx('alizahit1', 'assets/sounds/alizahit1.wav');
        this.loadSfx('alizahit2', 'assets/sounds/alizahit2.wav');
        this.loadSfx('alizahit3', 'assets/sounds/alizahit3.wav'); // Added additional hit sound
        this.loadSfx('alizaspecialattack', 'assets/sounds/alizaspecialattack.wav');
        this.loadSfx('alizavictory1', 'assets/sounds/alizavictory1.wav');
        this.loadSfx('alizagameover1', 'assets/sounds/alizagameover1.wav');
        this.loadSfx('alizastart', 'assets/sounds/alizastart.wav');
        
        // Shinshi sounds
        this.loadSfx('shinnyattack1', 'assets/sounds/shinnyattack1.wav');
        this.loadSfx('shinnypewpewpew', 'assets/sounds/shinnypewpewpew.wav');
        this.loadSfx('shinnyvictory1', 'assets/sounds/shinnyvictory1.wav');
        this.loadSfx('shinnyvictory2', 'assets/sounds/shinnyvictory2.wav');
        this.loadSfx('shinnyhit1', 'assets/sounds/shinnyhit1.wav');
        this.loadSfx('shinnygameover', 'assets/sounds/shinnygameover.wav');
        this.loadSfx('shinnyzap1', 'assets/sounds/shinnyzap1.wav');
        this.loadSfx('shinnyzap2', 'assets/sounds/shinnyzap2.mp3');
        this.loadSfx('shinnystart', 'assets/sounds/shinnystart.wav'); // Character start sound
        
        // Potion sounds
        this.loadSfx('potion1', 'assets/sounds/potion1.wav');
        this.loadSfx('potion2', 'assets/sounds/potion2.wav');
        this.loadSfx('potion4', 'assets/sounds/potion4.wav');
        
        // Track which sounds were last played to avoid repetition
        this.lastSpellfireVariant = 0;
        this.lastHitSound = {
            dere: 0,
            aliza: 0,
            shinshi: 0
        };
    }
    
    /**
     * Load a sound effect
     * @param {string} id - Sound effect ID
     * @param {string} src - Source path
     */
    loadSfx(id, src) {
        const audio = new Audio();
        audio.src = src;
        audio.volume = this.sfxVolume;
        audio.load();
        this.sfx[id] = audio;
    }
    
    /**
     * Play a sound effect
     * @param {string} id - Sound effect ID
     */
    playSfx(id) {
        if (this.muted) return null;
        
        const sound = this.sfx[id];
        if (sound) {
            const clone = sound.cloneNode();
            clone.volume = this.sfxVolume;
            clone.play().catch(error => {
                console.warn(`Error playing sound ${id}:`, error);
            });
            return clone; // Return the instance for tracking
        } else {
            console.warn(`Sound effect "${id}" not found`);
            return null;
        }
    }
    
    /**
     * Play the next spellfire sound in sequence - shared between Dere and Aliza
     * @returns {HTMLAudioElement} - The audio element being played
     */
    playSpellfireSound() {
        if (this.muted) return null;
        
        // Cycle through the 4 spellfire variants
        this.lastSpellfireVariant = (this.lastSpellfireVariant % 4) + 1;
        const soundId = `spellfire${this.lastSpellfireVariant}`;
        
        console.log(`[AUDIO MANAGER] Playing shared spellfire sound: ${soundId}`);
        return this.playSfx(soundId);
    }
    
    /**
     * Play character specific sound
     * @param {string} action - Action type (hit, victory, gameover, start)
     * @returns {HTMLAudioElement} - The audio element being played
     */
    playCharacterSound(action) {
        if (!this.selectedCharacter || this.muted) return null;
        
        // Get the appropriate sound ID based on character and action
        let soundId = null;
        if (action === 'hit') {
            // For hit sounds, cycle through available options to avoid repetition
            if (this.selectedCharacter === 'dere') {
                const hitSounds = ['derehit1', 'derehit2', 'derehit3'];
                // Use cycling instead of random to ensure all sounds get used
                this.lastHitSound.dere = (this.lastHitSound.dere + 1) % hitSounds.length;
                soundId = hitSounds[this.lastHitSound.dere];
            } else if (this.selectedCharacter === 'aliza') {
                const hitSounds = ['alizahit1', 'alizahit2', 'alizahit3', 'alizahit'];
                // Use cycling instead of random to ensure all sounds get used
                this.lastHitSound.aliza = (this.lastHitSound.aliza + 1) % hitSounds.length;
                soundId = hitSounds[this.lastHitSound.aliza];
            } else if (this.selectedCharacter === 'shinshi') {
                soundId = 'shinnyhit1';
            }
            
            console.log(`[AUDIO MANAGER] Playing ${this.selectedCharacter} hit sound: ${soundId}`);
        } else if (action === 'victory') {
            if (this.selectedCharacter === 'dere') {
                soundId = 'derevictory1';
            } else if (this.selectedCharacter === 'aliza') {
                soundId = 'alizavictory1';
            } else if (this.selectedCharacter === 'shinshi') {
                soundId = 'shinnyvictory1';
            }
        } else if (action === 'gameover') {
            if (this.selectedCharacter === 'dere') {
                soundId = 'deregameover';
            } else if (this.selectedCharacter === 'aliza') {
                soundId = 'alizagameover1';
            } else if (this.selectedCharacter === 'shinshi') {
                soundId = 'shinnygameover';
            }
        } else if (action === 'start') {
            // Character start sounds - Check if already played to avoid duplication
            const startSoundKey = `${this.selectedCharacter}_start`;
            if (characterStartSoundPlayed[startSoundKey]) {
                console.log(`[AUDIO MANAGER] Character start sound for ${this.selectedCharacter} already played, skipping`);
                return null;
            }
            
            if (this.selectedCharacter === 'dere') {
                soundId = 'derestart';
            } else if (this.selectedCharacter === 'aliza') {
                soundId = 'alizastart';
            } else if (this.selectedCharacter === 'shinshi') {
                soundId = 'shinnystart';
            }
            
            // Mark that we've played this character's start sound
            if (soundId) {
                characterStartSoundPlayed[startSoundKey] = true;
                
                // Reset after 5 seconds to allow replaying if they select the character again
                setTimeout(() => {
                    characterStartSoundPlayed[startSoundKey] = false;
                }, 5000);
            }
        }
        
        // Play the selected sound if available
        if (soundId && this.sfx[soundId]) {
            return this.playSfx(soundId);
        }
        
        console.warn(`[AUDIO MANAGER] No ${action} sound found for character ${this.selectedCharacter}`);
        return null;
    }
    
    /**
     * Set the active character for character-specific sounds
     * @param {string} character - Character ID ('dere', 'aliza', or 'shinshi')
     */
    setCharacter(character) {
        // Only play the start sound if the character has changed
        const characterChanged = this.selectedCharacter !== character;
        
        console.log(`[AUDIO MANAGER] Setting active character to: ${character}`);
        this.selectedCharacter = character;
        
        // Play the character's start sound only if character changed
        if (characterChanged) {
            this.playCharacterSound('start');
        }
    }
    
    /**
     * Stop ALL music tracks forcefully
     */
    stopAllMusic() {
        console.log("[AUDIO MANAGER] Stopping ALL music tracks");
        
        // Safely stop the singleton music player
        try {
            window.ONLY_MUSIC_PLAYER.pause();
            window.ONLY_MUSIC_PLAYER.currentTime = 0;
            window.ONLY_MUSIC_PLAYER.src = "";
        } catch (e) {
            console.error("[AUDIO MANAGER] Could not fully stop ONLY_MUSIC_PLAYER:", e);
        }
        
        // Clear current music reference
        this.currentMusic = null;
        
        return Promise.resolve();
    }
    
    /**
     * Play music using the singleton audio player
     * @param {string} id - Music ID
     */
    playMusic(id) {
        if (this.muted || (this.gameState && this.gameState.isPaused)) {
            console.log("[AUDIO MANAGER] Skipping music playback - muted or paused");
            return;
        }
        
        if (!MUSIC_MAP[id]) {
            console.error("[AUDIO MANAGER] No music track found for id:", id);
            return;
        }
        
        if (audioPlayInProgress) {
            console.log("[AUDIO MANAGER] Audio play already in progress, queueing:", id);
            setTimeout(() => this.playMusic(id), 100);
            return;
        }
        
        console.log("[AUDIO MANAGER] Playing music:", id);
        
        audioPlayInProgress = true;
        
        try {
            // First, stop anything currently playing
            window.ONLY_MUSIC_PLAYER.pause();
            window.ONLY_MUSIC_PLAYER.currentTime = 0;
            
            // Set up the new track
            window.ONLY_MUSIC_PLAYER.src = MUSIC_MAP[id];
            window.ONLY_MUSIC_PLAYER.volume = this.musicVolume;
            
            // Play the track
            const playPromise = window.ONLY_MUSIC_PLAYER.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("[AUDIO MANAGER] Successfully started playback for:", id);
                    this.currentMusic = id;
                    window.currentBgm = window.ONLY_MUSIC_PLAYER; // For legacy code
                    audioPlayInProgress = false;
                }).catch(error => {
                    console.error("[AUDIO MANAGER] Play failed:", error);
                    audioPlayInProgress = false;
                    // Try one more time after a short delay
                    setTimeout(() => {
                        window.ONLY_MUSIC_PLAYER.play().catch(() => {});
                    }, 500);
                });
            } else {
                this.currentMusic = id;
                window.currentBgm = window.ONLY_MUSIC_PLAYER; // For legacy code
                audioPlayInProgress = false;
            }
        } catch(e) {
            console.error("[AUDIO MANAGER] Error playing music:", e);
            audioPlayInProgress = false;
        }
    }
    
    /**
     * Hard-coded wave-specific music system
     * Maps each round and wave combination to the correct music track
     * @param {number} round - Current round number
     * @param {number} wave - Current wave number
     * @param {boolean} isBossWave - Whether this is a boss wave
     */
    playWaveSpecificMusic(round, wave, isBossWave) {
        console.log(`[AUDIO MANAGER] Playing music for Round ${round}, Wave ${wave}, Boss: ${isBossWave}`);
        
        // Store the current state
        this.currentRound = round;
        this.currentWave = wave;
        this.currentIsBoss = isBossWave;
        
        let musicId = 'title'; // Default to title music
        
        // EXPLICIT HARDCODED MUSIC MAPPINGS
        if (round === 1) {
            if (isBossWave || wave === 5) {
                musicId = 'boss1';
            } else {
                musicId = 'round1';
            }
        } 
        else if (round === 2) {
            if (isBossWave || wave === 7) {
                musicId = 'boss2';
            } else {
                musicId = 'round2';
            }
        } 
        else if (round === 3) {
            if (isBossWave || wave === 8) {
                musicId = 'boss3';
            } else {
                musicId = 'round3';
            }
        }
        
        // Play the selected music
        this.playMusic(musicId);
    }
    
    /**
     * Play round-specific music (with hard-coded wave checking)
     * @param {number} round - Current round number
     * @param {boolean} isBossWave - Whether this is a boss wave
     */
    playRoundMusic(round, isBossWave) {
        console.log(`[AUDIO MANAGER] Playing music for round ${round}, boss wave: ${isBossWave}`);
        
        // Let the specific version handle this
        this.playWaveSpecificMusic(round, isBossWave ? this.getBossWaveForRound(round) : 1, isBossWave);
    }
    
    /**
     * Get the boss wave number for a specific round
     * @param {number} round - Current round number
     * @returns {number} - Boss wave number
     */
    getBossWaveForRound(round) {
        // Hard-coded boss wave numbers
        switch(round) {
            case 1: return 5;
            case 2: return 7;
            case 3: return 8;
            default: return 5;
        }
    }
    
    /**
     * Play boss music by number
     * @param {number} bossNum - Boss number (1, 2, or 3)
     */
    playBossMusic(bossNum) {
        console.log(`[AUDIO MANAGER] Playing boss ${bossNum} music`);
        
        const bossId = `boss${bossNum}`;
        this.playMusic(bossId);
    }
    
    /**
     * Handle pause state
     * @param {boolean} isPaused - Whether game is paused
     */
    handlePause(isPaused) {
        if (!this.gameState) this.gameState = {};
        this.gameState.isPaused = isPaused;
        
        if (isPaused) {
            console.log("[AUDIO MANAGER] Game paused - stopping music");
            this.stopAllMusic();
        } else if (this.currentMusic) {
            console.log("[AUDIO MANAGER] Game unpaused - restoring music");
            setTimeout(() => this.playMusic(this.currentMusic), 200);
        }
    }
    
    /**
     * Set the volume for music
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        try {
            window.ONLY_MUSIC_PLAYER.volume = this.musicVolume;
        } catch(e) {
            console.error("[AUDIO MANAGER] Error setting music volume:", e);
        }
    }
    
    /**
     * Set the volume for sound effects
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Mute or unmute all audio
     * @param {boolean} muted - Whether audio should be muted
     */
    setMuted(muted) {
        this.muted = muted;
        
        if (muted) {
            this.stopAllMusic();
        } else if (!muted && this.currentMusic) {
            this.playMusic(this.currentMusic);
        }
    }
}

// Set up initialization flag
window._musicSystemInitialized = true;

// Create a single audioManager instance
window.audioManager = new AudioManager();

// Override any global music control functions to use our singleton system
window.updateGameMusic = function(round, isBoss) {
    if (window.audioManager.muted) return;
    
    // Simple explicit mapping
    let musicId;
    if (isBoss) {
        musicId = `boss${round}`;
    } else {
        musicId = `round${round}`;
    }
    
    // Save the state
    window.audioManager.currentRound = round;
    window.audioManager.currentIsBoss = isBoss;
    
    // Play the music
    window.audioManager.playMusic(musicId);
};

window.playBossMusic = function(bossNum) {
    if (window.audioManager.muted) return;
    window.audioManager.playMusic(`boss${bossNum}`);
};

window.stopAllAudio = function() {
    return window.audioManager.stopAllMusic();
};

window.handleGamePause = function(isPaused) {
    window.audioManager.handlePause(isPaused);
};

// Override and disable any legacy audio functions that might interfere
if (window.playBackgroundMusic) {
    window.playBackgroundMusic = function() {
        console.log("[AUDIO MANAGER] Legacy playBackgroundMusic intercepted and disabled");
    };
}

// Override AudioContext if any other component is trying to use it
window.AudioContext = function() {
    console.log("[AUDIO MANAGER] New AudioContext creation blocked to prevent audio conflicts");
    return {
        createGain: function() { return { gain: { value: 0 } }; },
        createOscillator: function() { return { connect: function() {}, start: function() {} }; }
    };
};

// Monitor for any new audio elements and remove them
setInterval(() => {
    const audioElements = document.querySelectorAll('audio:not(#only-music-player)');
    if (audioElements.length > 0) {
        console.log(`[AUDIO MANAGER] Found ${audioElements.length} unauthorized audio elements, removing...`);
        audioElements.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
                audio.src = "";
                audio.remove();
            } catch(e) {}
        });
    }
}, 1000);

// Expose singleton to window for legacy code to access
window._playDirectMusic = function(trackId) {
    window.audioManager.playMusic(trackId);
};