/**
 * AudioManager class for handling background music and sound effects
 * in the Interactive D&D Handbook
 */
class AudioManager {
  constructor() {
    this.musicEnabled = false;
    this.volume = 0.5; // Default volume (0-1)
    this.currentTrack = null;
    this.sectionMusicMap = {
      // Map sections to appropriate music tracks
      'character-creation': 'tavern-music.mp3',
      'diapers-and-diaper-use': 'peaceful-melody.mp3',
      'punishments': 'ominous-tones.mp3',
      'monsters-encounters': 'battle-theme.mp3',
      'darkling-lurker': 'creepy-ambient.mp3',
      'darkforme-overwatch': 'creepy-ambient.mp3',
      'darkling-caller': 'creepy-ambient.mp3',
      'forest-encounters': 'forest-sounds.mp3',
      'items-artifacts': 'magical-chimes.mp3',
      'crafting': 'workshop-sounds.mp3',
      'diaper-chart': 'light-comedy.mp3',
      'padded-arcana': 'mystical-magic.mp3',
      'species': 'epic-adventure.mp3',
      'expeditions': 'journey-theme.mp3',
      'magical-plains': 'fantasy-landscape.mp3',
      'virtual-combat': 'training-montage.mp3'
    };
    
    this.easterEggSounds = [
      'magic-poof.mp3',
      'baby-giggle.mp3',
      'surprise-chime.mp3'
    ];
    
    this.soundEffects = {
      pageFlip: 'page-flip.mp3',
      magicChime: 'magic-chime.mp3',
      warning: 'warning-bell.mp3',
      achievement: 'achievement.mp3'
    };
    
    this.initAudio();
    this.setupEventListeners();
  }
  
  /**
   * Initialize audio elements and preload sounds
   */
  initAudio() {
    // Create audio element for background music
    this.musicPlayer = document.createElement('audio');
    this.musicPlayer.loop = true;
    this.musicPlayer.volume = this.volume;
    document.body.appendChild(this.musicPlayer);
    
    // Create audio element for sound effects
    this.soundPlayer = document.createElement('audio');
    this.soundPlayer.volume = this.volume;
    document.body.appendChild(this.soundPlayer);
    
    // Preload common sound effects
    this.preloadSounds();
  }
  
  /**
   * Set up event listeners for audio controls
   */
  setupEventListeners() {
    const toggleButton = document.getElementById('toggle-music');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        this.toggleMusic();
      });
    }
    
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.value = this.volume * 100;
      volumeSlider.addEventListener('input', (e) => {
        this.setVolume(e.target.value / 100);
      });
    }
  }
  
  /**
   * Preload common sound effects for quick playing
   */
  preloadSounds() {
    // Create a temporary audio element to preload sounds
    const preloader = document.createElement('audio');
    preloader.style.display = 'none';
    document.body.appendChild(preloader);
    
    // Preload page flip sound
    try {
      preloader.src = `assets/audio/${this.soundEffects.pageFlip}`;
    } catch (e) {
      console.warn('Could not preload sound effects:', e);
    }
    
    // Clean up
    document.body.removeChild(preloader);
  }
  
  /**
   * Toggle background music on/off
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    const toggleButton = document.getElementById('toggle-music');
    if (toggleButton) {
      toggleButton.classList.toggle('active', this.musicEnabled);
    }
    
    if (this.musicEnabled && this.currentTrack) {
      this.musicPlayer.play();
    } else {
      this.musicPlayer.pause();
    }
  }
  
  /**
   * Set volume for both music and sound effects
   * @param {number} value - Volume level (0-1)
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.musicPlayer.volume = this.volume;
    this.soundPlayer.volume = this.volume;
    
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.value = this.volume * 100;
    }
  }
  
  /**
   * Play music appropriate for the current section
   * @param {string} sectionKey - The current section identifier
   */
  playMusicForSection(sectionKey) {
    // If music is disabled, don't try to play anything
    if (!this.musicEnabled) return;
    
    // Find the appropriate track for this section
    let trackToPlay = this.sectionMusicMap[sectionKey];
    
    // If no specific track for this section, find a parent section
    if (!trackToPlay && sectionKey.includes('-')) {
      const parentSection = sectionKey.split('-')[0];
      trackToPlay = this.sectionMusicMap[parentSection];
    }
    
    // Default to peaceful music if no track is found
    if (!trackToPlay) {
      trackToPlay = 'peaceful-melody.mp3';
    }
    
    // Only change track if it's different from the current one
    if (this.currentTrack !== trackToPlay) {
      this.currentTrack = trackToPlay;
      this.musicPlayer.src = `assets/audio/${trackToPlay}`;
      
      if (this.musicEnabled) {
        // Fade out current track and fade in new one
        this.fadeAudioTransition();
      }
    }
  }
  
  /**
   * Fade between audio tracks for smooth transition
   */
  fadeAudioTransition() {
    const originalVolume = this.volume;
    let currentVolume = originalVolume;
    
    // Fade out
    const fadeOut = setInterval(() => {
      currentVolume -= 0.05;
      if (currentVolume <= 0) {
        clearInterval(fadeOut);
        this.musicPlayer.pause();
        this.musicPlayer.currentTime = 0;
        this.musicPlayer.play();
        
        // Fade in
        currentVolume = 0;
        this.musicPlayer.volume = currentVolume;
        
        const fadeIn = setInterval(() => {
          currentVolume += 0.05;
          if (currentVolume >= originalVolume) {
            clearInterval(fadeIn);
            this.musicPlayer.volume = originalVolume;
          } else {
            this.musicPlayer.volume = currentVolume;
          }
        }, 50);
      } else {
        this.musicPlayer.volume = currentVolume;
      }
    }, 50);
  }
  
  /**
   * Play a sound effect once
   * @param {string} soundName - The name of the sound effect to play
   */
  playSound(soundName) {
    if (this.soundEffects[soundName]) {
      this.soundPlayer.src = `assets/audio/${this.soundEffects[soundName]}`;
      this.soundPlayer.play();
    } else {
      console.warn(`Sound effect "${soundName}" not found.`);
    }
  }
  
  /**
   * Play a page flip sound when navigating
   */
  playPageFlipSound() {
    this.playSound('pageFlip');
  }
  
  /**
   * Play a random easter egg sound
   */
  playEasterEggSound() {
    if (this.easterEggSounds.length > 0) {
      const randomSound = this.easterEggSounds[Math.floor(Math.random() * this.easterEggSounds.length)];
      this.soundPlayer.src = `assets/audio/${randomSound}`;
      this.soundPlayer.play();
    }
  }
  
  /**
   * Play a warning sound
   */
  playWarningSound() {
    this.playSound('warning');
  }
  
  /**
   * Play an achievement sound for tracker milestones
   */
  playAchievementSound() {
    this.playSound('achievement');
  }
}
